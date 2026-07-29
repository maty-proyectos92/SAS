import { 
  collection, doc, getDocs, setDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  initialEmpresas, initialUsuarios, initialClientes, initialEmpleados, 
  initialCategorias, initialServicios, initialTurnos, initialPagos, initialCajas, initialNotificaciones 
} from './mockData';

// Firestore collection mappings
export const COLLECTIONS = {
  EMPRESAS: 'empresas',
  USUARIOS: 'usuarios',
  CLIENTES: 'clientes',
  EMPLEADOS: 'empleados',
  CATEGORIAS: 'categorias_servicios',
  SERVICIOS: 'servicios',
  TURNOS: 'turnos',
  PAGOS: 'pagos',
  CAJAS: 'cajas_diarias',
  NOTIFICACIONES: 'notificaciones'
};

// Async helper to save a document to Firestore safely
export async function saveToFirestore<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  const instance = db;
  if (!instance) return;
  try {
    const docRef = doc(instance, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] Error saving document ${item.id} to ${collectionName}:`, err);
  }
}

// Async helper to delete a document from Firestore safely
export async function deleteFromFirestore(collectionName: string, id: string): Promise<void> {
  const instance = db;
  if (!instance) return;
  try {
    const docRef = doc(instance, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`[Firestore] Error deleting document ${id} from ${collectionName}:`, err);
  }
}

// Seed initial mock data to Firestore if collections are empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  const instance = db;
  if (!instance) return;

  try {
    const empresasSnap = await getDocs(collection(instance, COLLECTIONS.EMPRESAS));
    if (empresasSnap.empty) {
      console.log('[Firestore] Seeding initial data into Firestore database...');
      
      const seedOperations = [
        ...initialEmpresas.map(e => setDoc(doc(instance, COLLECTIONS.EMPRESAS, e.id), e)),
        ...initialUsuarios.map(u => setDoc(doc(instance, COLLECTIONS.USUARIOS, u.id), u)),
        ...initialClientes.map(c => setDoc(doc(instance, COLLECTIONS.CLIENTES, c.id), c)),
        ...initialEmpleados.map(e => setDoc(doc(instance, COLLECTIONS.EMPLEADOS, e.id), e)),
        ...initialCategorias.map(cat => setDoc(doc(instance, COLLECTIONS.CATEGORIAS, cat.id), cat)),
        ...initialServicios.map(s => setDoc(doc(instance, COLLECTIONS.SERVICIOS, s.id), s)),
        ...initialTurnos.map(t => setDoc(doc(instance, COLLECTIONS.TURNOS, t.id), t)),
        ...initialPagos.map(p => setDoc(doc(instance, COLLECTIONS.PAGOS, p.id), p)),
        ...initialCajas.map(cj => setDoc(doc(instance, COLLECTIONS.CAJAS, cj.id), cj)),
        ...initialNotificaciones.map(n => setDoc(doc(instance, COLLECTIONS.NOTIFICACIONES, n.id), n))
      ];

      await Promise.all(seedOperations);
      console.log('[Firestore] Database successfully seeded with initial records.');
    }
  } catch (err) {
    console.warn('[Firestore] Error seeding initial data:', err);
  }
}

// Subscribe to real-time updates from Firestore to keep local storage synced across browsers
export function initFirestoreRealtimeSync(onDataUpdated: () => void) {
  const instance = db;
  if (!instance) return () => {};

  const unsubscribes: (() => void)[] = [];

  const collectionsToWatch = [
    { name: COLLECTIONS.EMPRESAS, storageKey: 'saas_turnos_empresas' },
    { name: COLLECTIONS.USUARIOS, storageKey: 'saas_turnos_usuarios' },
    { name: COLLECTIONS.CLIENTES, storageKey: 'saas_turnos_clientes' },
    { name: COLLECTIONS.EMPLEADOS, storageKey: 'saas_turnos_empleados' },
    { name: COLLECTIONS.CATEGORIAS, storageKey: 'saas_turnos_categorias' },
    { name: COLLECTIONS.SERVICIOS, storageKey: 'saas_turnos_servicios' },
    { name: COLLECTIONS.TURNOS, storageKey: 'saas_turnos_turnos' },
    { name: COLLECTIONS.PAGOS, storageKey: 'saas_turnos_pagos' },
    { name: COLLECTIONS.CAJAS, storageKey: 'saas_turnos_cajas' },
    { name: COLLECTIONS.NOTIFICACIONES, storageKey: 'saas_turnos_notificaciones' },
  ];

  collectionsToWatch.forEach(({ name, storageKey }) => {
    try {
      const unsub = onSnapshot(collection(instance, name), (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        localStorage.setItem(storageKey, JSON.stringify(items));
        onDataUpdated();
      }, (err) => {
        console.warn(`[Firestore] Snapshot error on ${name}:`, err);
      });
      unsubscribes.push(unsub);
    } catch (e) {
      console.warn(`[Firestore] Failed listener on ${name}:`, e);
    }
  });

  return () => {
    unsubscribes.forEach(un => un());
  };
}
