import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, setDoc } from 'firebase/firestore';
import { Usuario, RolUsuario } from '../types';
import { StorageService } from '../services/storageService';
import { useCompany } from './CompanyContext';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  usuario: Usuario | null;
  user: Usuario | null;
  rol: RolUsuario;
  isLoading: boolean;
  login: (email: string) => boolean | Promise<boolean>;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  loginWithRole: (rol: RolUsuario) => void;
  logout: () => Promise<void>;
  cambiarRolSimulado: (nuevoRol: RolUsuario) => void;
  tienePermiso: (modulo: keyof import('../types').PermisosRolesMap, accion: 'ver' | 'crear' | 'editar' | 'eliminar') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Función helper opcional para crear un usuario tanto en Firebase Auth como en la colección 'usuarios' de Firestore.
 * Invocable únicamente por administradores o dueños del sistema.
 */
export async function createUserInAuthAndFirestore(
  email: string,
  pass: string,
  userData: Omit<Usuario, 'id' | 'email'>
): Promise<Usuario> {
  if (!auth || !db) {
    throw new Error('Firebase Auth / Firestore no están inicializados.');
  }
  const userCred = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = userCred.user.uid;

  const newUser: Usuario = {
    id: uid,
    email: email.toLowerCase(),
    ...userData
  };

  await setDoc(doc(db, 'usuarios', uid), newUser);
  return newUser;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { empresa } = useCompany();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [rol, setRol] = useState<RolUsuario>('dueno');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Escuchar cambios de autenticación en Firebase Auth (Restore Session)
  useEffect(() => {
    if (!auth) {
      // Fallback si Firebase Auth no está configurado
      const users = StorageService.getUsuarios();
      const savedId = localStorage.getItem('saas_turnos_active_user_id');
      const found = users.find(u => u.id === savedId) || users[0] || null;
      if (found) {
        setUsuario(found);
        setRol(found.rol);
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        await resolveAndSetUserSession(firebaseUser);
      } else {
        setUsuario(null);
        localStorage.removeItem('saas_turnos_active_user_id');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Actualizar rol cuando cambia el usuario activo
  useEffect(() => {
    if (usuario) {
      setRol(usuario.rol);
    }
  }, [usuario]);

  // Helper interno para asociar el usuario de Firebase Auth con el registro en Firestore / localStorage
  const resolveAndSetUserSession = async (firebaseUser: FirebaseUser) => {
    // Refrescar el token de id de Firebase Auth para forzar la sincronización de Custom Claims (empresaId, rol)
    try {
      await firebaseUser.getIdToken(true);
    } catch (tokenErr) {
      console.warn('[Auth] No se pudo refrescar el token de custom claims:', tokenErr);
    }

    const userEmail = firebaseUser.email?.toLowerCase() || '';
    
    // Primero buscar en Firestore si está disponible
    if (db) {
      try {
        const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const fetched = { id: docSnap.id, ...docSnap.data() } as Usuario;
          setUsuario(fetched);
          setRol(fetched.rol);
          localStorage.setItem('saas_turnos_active_user_id', fetched.id);
          return fetched;
        }

        // Búsqueda por correo si el id en Firestore es un slug custom (e.g. usr_dueno1)
        const q = query(collection(db, 'usuarios'), where('email', '==', userEmail));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const docItem = querySnap.docs[0];
          const fetched = { id: docItem.id, ...docItem.data() } as Usuario;
          setUsuario(fetched);
          setRol(fetched.rol);
          localStorage.setItem('saas_turnos_active_user_id', fetched.id);
          return fetched;
        }
      } catch (err) {
        console.warn('[Auth] Error consultando perfil de usuario en Firestore:', err);
      }
    }

    // Fallback: Buscar en el storage de usuarios locales
    const localUsers = StorageService.getUsuarios();
    const foundLocal = localUsers.find(u => u.email.toLowerCase() === userEmail || u.id === firebaseUser.uid);
    if (foundLocal) {
      setUsuario(foundLocal);
      setRol(foundLocal.rol);
      localStorage.setItem('saas_turnos_active_user_id', foundLocal.id);
      return foundLocal;
    }

    // Si no existe perfil en DB para este email registrado, denegar sesión (NO autocrear como dueño)
    console.error(`[Auth] No se encontró perfil de usuario para ${userEmail}`);
    setUsuario(null);
    return null;
  };

  /**
   * Inicio de sesión real mediante Firebase Auth (email + contraseña).
   */
  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    if (!email) return false;
    
    if (auth && password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const resolved = await resolveAndSetUserSession(userCredential.user);
        return Boolean(resolved);
      } catch (err: any) {
        console.error('[Auth] Error en signInWithEmailAndPassword:', err);
        throw err;
      }
    }

    // Si no hay password o auth no disponible, buscar en usuarios locales (sin autocreación de dueño)
    const localUsers = StorageService.getUsuarios();
    const found = localUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setUsuario(found);
      setRol(found.rol);
      localStorage.setItem('saas_turnos_active_user_id', found.id);
      return true;
    }

    // Si no se encuentra, retornar error (sin autocrear usuario)
    return false;
  };

  /**
   * Método legacy de inicio de sesión sin contraseña.
   * Deprecado: Usar loginWithEmail(email, password).
   */
  const login = (email: string): boolean | Promise<boolean> => {
    const localUsers = StorageService.getUsuarios();
    const found = localUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setUsuario(found);
      setRol(found.rol);
      localStorage.setItem('saas_turnos_active_user_id', found.id);
      return true;
    }
    return false;
  };

  /**
   * Cambiar de rol simulado en runtime.
   * SEGURIDAD: Restringido EXCLUSIVAMENTE a superadmin para prevenir escalada de privilegios.
   */
  const cambiarRolSimulado = (nuevoRol: RolUsuario) => {
    if (usuario?.rol !== 'superadmin' && rol !== 'superadmin') {
      console.warn('[Auth] Operación bloqueada: Solo el usuario SuperAdmin puede alternar roles en desarrollo.');
      return;
    }
    setRol(nuevoRol);
    if (usuario) {
      setUsuario({ ...usuario, rol: nuevoRol });
    }
  };

  /**
   * Iniciar sesión rápido con rol.
   * SEGURIDAD: Restringido a superadmin si ya hay una sesión activa, para prevenir bypass.
   */
  const loginWithRole = (targetRol: RolUsuario) => {
    if (usuario && usuario.rol !== 'superadmin' && rol !== 'superadmin') {
      console.warn('[Auth] Operación bloqueada: Solo SuperAdmin puede usar cambio rápido de rol.');
      return;
    }

    const users = StorageService.getUsuarios();
    const found = users.find(u => u.rol === targetRol && (!empresa || u.empresaId === empresa.id));
    const fallback = users.find(u => u.rol === targetRol) || users[0];
    const userToSet = found || fallback;
    if (userToSet) {
      setUsuario(userToSet);
      setRol(targetRol);
      localStorage.setItem('saas_turnos_active_user_id', userToSet.id);
    }
  };

  /**
   * Cierre de sesión seguro.
   */
  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('[Auth] Error al cerrar sesión en Firebase Auth:', err);
      }
    }
    localStorage.removeItem('saas_turnos_active_user_id');
    setUsuario(null);
  };

  /**
   * Verificación centralizada de permisos por módulo (RBAC Deny-by-Default).
   */
  const tienePermiso = (
    modulo: keyof import('../types').PermisosRolesMap,
    accion: 'ver' | 'crear' | 'editar' | 'eliminar'
  ): boolean => {
    if (rol === 'superadmin') return true;
    if (!empresa || !empresa.permisosRoles) return false;

    const permisosRol = empresa.permisosRoles[rol];
    if (!permisosRol) return false;

    const moduloPermiso = permisosRol[modulo];
    if (!moduloPermiso) return false;

    return Boolean(moduloPermiso[accion]);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        user: usuario,
        rol,
        isLoading,
        login,
        loginWithEmail,
        loginWithRole,
        logout,
        cambiarRolSimulado,
        tienePermiso
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
