import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, RolUsuario } from '../types';
import { StorageService } from '../services/storageService';
import { useCompany } from './CompanyContext';

interface AuthContextType {
  usuario: Usuario | null;
  rol: RolUsuario;
  login: (email: string) => boolean;
  loginWithEmail: (email: string, password?: string) => boolean;
  loginWithRole: (rol: RolUsuario) => void;
  logout: () => void;
  cambiarRolSimulado: (nuevoRol: RolUsuario) => void;
  tienePermiso: (modulo: keyof import('../types').PermisosRolesMap, accion: 'ver' | 'crear' | 'editar' | 'eliminar') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { empresa } = useCompany();

  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const users = StorageService.getUsuarios();
    const savedId = localStorage.getItem('saas_turnos_active_user_id');
    const found = users.find(u => u.id === savedId);
    return found || users[1] || users[0] || null; // default Marcos Rivas (Dueño)
  });

  const [rol, setRol] = useState<RolUsuario>(() => usuario?.rol || 'dueno');

  useEffect(() => {
    if (usuario) {
      setRol(usuario.rol);
    }
  }, [usuario]);

  const login = (email: string): boolean => {
    const users = StorageService.getUsuarios();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUsuario(found);
      setRol(found.rol);
      localStorage.setItem('saas_turnos_active_user_id', found.id);
      return true;
    }
    // If not found in seed, create a temporary user session
    const newUser: Usuario = {
      id: `usr_${Date.now()}`,
      empresaId: empresa?.id || 'emp_01',
      email,
      nombre: email.split('@')[0],
      rol: 'dueno',
      estado: 'activo'
    };
    setUsuario(newUser);
    setRol(newUser.rol);
    localStorage.setItem('saas_turnos_active_user_id', newUser.id);
    return true;
  };

  const loginWithEmail = (email: string, _password?: string): boolean => {
    return login(email);
  };

  const loginWithRole = (targetRol: RolUsuario) => {
    const users = StorageService.getUsuarios();
    const found = users.find(u => u.rol === targetRol && (!empresa || u.empresaId === empresa.id));
    const fallback = users.find(u => u.rol === targetRol) || users[0];
    const userToSet = found || fallback;
    if (userToSet) {
      setUsuario(userToSet);
      setRol(targetRol);
      localStorage.setItem('saas_turnos_active_user_id', userToSet.id);
    } else if (usuario) {
      setRol(targetRol);
      setUsuario({ ...usuario, rol: targetRol });
    }
  };

  const logout = () => {
    localStorage.removeItem('saas_turnos_active_user_id');
    setUsuario(null);
  };

  const cambiarRolSimulado = (nuevoRol: RolUsuario) => {
    setRol(nuevoRol);
    if (usuario) {
      const updated = { ...usuario, rol: nuevoRol };
      setUsuario(updated);
    }
  };

  const tienePermiso = (
    modulo: keyof import('../types').PermisosRolesMap,
    accion: 'ver' | 'crear' | 'editar' | 'eliminar'
  ): boolean => {
    if (rol === 'superadmin') return true;
    if (!empresa || !empresa.permisosRoles) return true;

    const permisosRol = empresa.permisosRoles[rol];
    if (!permisosRol) return true;

    const moduloPermiso = permisosRol[modulo];
    if (!moduloPermiso) return true;

    return Boolean(moduloPermiso[accion]);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol,
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
