import { 
  Empresa, Usuario, Cliente, Empleado, CategoriaServicio, Servicio, Turno, Pago, CajaDiaria, Notificacion 
} from '../types';
import { 
  initialEmpresas, initialUsuarios, initialClientes, initialEmpleados, 
  initialCategorias, initialServicios, initialTurnos, initialPagos, initialCajas, initialNotificaciones 
} from './mockData';
import { 
  COLLECTIONS, saveToFirestore, deleteFromFirestore, seedFirestoreIfEmpty, initFirestoreRealtimeSync 
} from './firestoreSync';

const STORAGE_KEYS = {
  EMPRESAS: 'saas_turnos_empresas',
  USUARIOS: 'saas_turnos_usuarios',
  CLIENTES: 'saas_turnos_clientes',
  EMPLEADOS: 'saas_turnos_empleados',
  CATEGORIAS: 'saas_turnos_categorias',
  SERVICIOS: 'saas_turnos_servicios',
  TURNOS: 'saas_turnos_turnos',
  PAGOS: 'saas_turnos_pagos',
  CAJAS: 'saas_turnos_cajas',
  NOTIFICACIONES: 'saas_turnos_notificaciones',
  ACTIVE_EMPRESA_ID: 'saas_turnos_active_empresa_id',
  ACTIVE_USER_ID: 'saas_turnos_active_user_id'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error('Error writing to localStorage', err);
  }
}

// Initial seed helper
export function initStorageSeed() {
  if (!localStorage.getItem(STORAGE_KEYS.EMPRESAS)) {
    setLocal(STORAGE_KEYS.EMPRESAS, initialEmpresas);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
    setLocal(STORAGE_KEYS.USUARIOS, initialUsuarios);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLIENTES)) {
    setLocal(STORAGE_KEYS.CLIENTES, initialClientes);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLEADOS)) {
    setLocal(STORAGE_KEYS.EMPLEADOS, initialEmpleados);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIAS)) {
    setLocal(STORAGE_KEYS.CATEGORIAS, initialCategorias);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICIOS)) {
    setLocal(STORAGE_KEYS.SERVICIOS, initialServicios);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TURNOS)) {
    setLocal(STORAGE_KEYS.TURNOS, initialTurnos);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAGOS)) {
    setLocal(STORAGE_KEYS.PAGOS, initialPagos);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CAJAS)) {
    setLocal(STORAGE_KEYS.CAJAS, initialCajas);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICACIONES)) {
    setLocal(STORAGE_KEYS.NOTIFICACIONES, initialNotificaciones);
  }

  // Seed Firestore in parallel if empty & subscribe to real-time sync
  seedFirestoreIfEmpty();
  initFirestoreRealtimeSync(notifyListeners);
}

initStorageSeed();

export const StorageService = {
  // EMPRESAS
  getEmpresas: (): Empresa[] => getLocal(STORAGE_KEYS.EMPRESAS, initialEmpresas),
  
  getEmpresaById: (id: string): Empresa | undefined => {
    const empresas = StorageService.getEmpresas();
    return empresas.find(e => e.id === id);
  },

  saveEmpresa: (empresa: Empresa) => {
    const empresas = StorageService.getEmpresas();
    const idx = empresas.findIndex(e => e.id === empresa.id);
    if (idx >= 0) {
      empresas[idx] = empresa;
    } else {
      empresas.push(empresa);
    }
    setLocal(STORAGE_KEYS.EMPRESAS, empresas);
    saveToFirestore(COLLECTIONS.EMPRESAS, empresa);
  },

  deleteEmpresa: (id: string) => {
    let empresas = StorageService.getEmpresas();
    empresas = empresas.filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EMPRESAS, empresas);
    deleteFromFirestore(COLLECTIONS.EMPRESAS, id);
  },

  // USUARIOS
  getUsuarios: (empresaId?: string): Usuario[] => {
    const users = getLocal<Usuario[]>(STORAGE_KEYS.USUARIOS, initialUsuarios);
    if (empresaId) return users.filter(u => u.empresaId === empresaId);
    return users;
  },

  saveUsuario: (usuario: Usuario) => {
    const users = getLocal<Usuario[]>(STORAGE_KEYS.USUARIOS, initialUsuarios);
    const idx = users.findIndex(u => u.id === usuario.id);
    if (idx >= 0) {
      users[idx] = usuario;
    } else {
      users.push(usuario);
    }
    setLocal(STORAGE_KEYS.USUARIOS, users);
    saveToFirestore(COLLECTIONS.USUARIOS, usuario);
  },

  deleteUsuario: (id: string) => {
    let users = getLocal<Usuario[]>(STORAGE_KEYS.USUARIOS, initialUsuarios);
    users = users.filter(u => u.id !== id);
    setLocal(STORAGE_KEYS.USUARIOS, users);
    deleteFromFirestore(COLLECTIONS.USUARIOS, id);
  },

  // CLIENTES
  getClientes: (empresaId: string): Cliente[] => {
    const clientes = getLocal<Cliente[]>(STORAGE_KEYS.CLIENTES, initialClientes);
    return clientes.filter(c => c.empresaId === empresaId);
  },

  saveCliente: (cliente: Cliente) => {
    const clientes = getLocal<Cliente[]>(STORAGE_KEYS.CLIENTES, initialClientes);
    const idx = clientes.findIndex(c => c.id === cliente.id);
    if (idx >= 0) {
      clientes[idx] = cliente;
    } else {
      clientes.push(cliente);
    }
    setLocal(STORAGE_KEYS.CLIENTES, clientes);
    saveToFirestore(COLLECTIONS.CLIENTES, cliente);
  },

  deleteCliente: (id: string) => {
    let clientes = getLocal<Cliente[]>(STORAGE_KEYS.CLIENTES, initialClientes);
    clientes = clientes.filter(c => c.id !== id);
    setLocal(STORAGE_KEYS.CLIENTES, clientes);
    deleteFromFirestore(COLLECTIONS.CLIENTES, id);
  },

  // EMPLEADOS
  getEmpleados: (empresaId: string): Empleado[] => {
    const empleados = getLocal<Empleado[]>(STORAGE_KEYS.EMPLEADOS, initialEmpleados);
    return empleados.filter(e => e.empresaId === empresaId);
  },

  saveEmpleado: (empleado: Empleado) => {
    const empleados = getLocal<Empleado[]>(STORAGE_KEYS.EMPLEADOS, initialEmpleados);
    const idx = empleados.findIndex(e => e.id === empleado.id);
    if (idx >= 0) {
      empleados[idx] = empleado;
    } else {
      empleados.push(empleado);
    }
    setLocal(STORAGE_KEYS.EMPLEADOS, empleados);
    saveToFirestore(COLLECTIONS.EMPLEADOS, empleado);
  },

  deleteEmpleado: (id: string) => {
    let list = getLocal<Empleado[]>(STORAGE_KEYS.EMPLEADOS, initialEmpleados);
    list = list.filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EMPLEADOS, list);
    deleteFromFirestore(COLLECTIONS.EMPLEADOS, id);
  },

  // CATEGORIAS & SERVICIOS
  getCategorias: (empresaId: string): CategoriaServicio[] => {
    const cats = getLocal<CategoriaServicio[]>(STORAGE_KEYS.CATEGORIAS, initialCategorias);
    return cats.filter(c => c.empresaId === empresaId);
  },

  saveCategoria: (categoria: CategoriaServicio) => {
    const cats = getLocal<CategoriaServicio[]>(STORAGE_KEYS.CATEGORIAS, initialCategorias);
    const idx = cats.findIndex(c => c.id === categoria.id);
    if (idx >= 0) {
      cats[idx] = categoria;
    } else {
      cats.push(categoria);
    }
    setLocal(STORAGE_KEYS.CATEGORIAS, cats);
    saveToFirestore(COLLECTIONS.CATEGORIAS, categoria);
  },

  getServicios: (empresaId: string): Servicio[] => {
    const srvs = getLocal<Servicio[]>(STORAGE_KEYS.SERVICIOS, initialServicios);
    return srvs.filter(s => s.empresaId === empresaId);
  },

  saveServicio: (servicio: Servicio) => {
    const srvs = getLocal<Servicio[]>(STORAGE_KEYS.SERVICIOS, initialServicios);
    const idx = srvs.findIndex(s => s.id === servicio.id);
    if (idx >= 0) {
      srvs[idx] = servicio;
    } else {
      srvs.push(servicio);
    }
    setLocal(STORAGE_KEYS.SERVICIOS, srvs);
    saveToFirestore(COLLECTIONS.SERVICIOS, servicio);
  },

  deleteServicio: (id: string) => {
    let srvs = getLocal<Servicio[]>(STORAGE_KEYS.SERVICIOS, initialServicios);
    srvs = srvs.filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SERVICIOS, srvs);
    deleteFromFirestore(COLLECTIONS.SERVICIOS, id);
  },

  // TURNOS
  getTurnos: (empresaId: string): Turno[] => {
    const turnos = getLocal<Turno[]>(STORAGE_KEYS.TURNOS, initialTurnos);
    return turnos.filter(t => t.empresaId === empresaId);
  },

  saveTurno: (turno: Turno) => {
    const turnos = getLocal<Turno[]>(STORAGE_KEYS.TURNOS, initialTurnos);
    const idx = turnos.findIndex(t => t.id === turno.id);
    if (idx >= 0) {
      turnos[idx] = turno;
    } else {
      turnos.push(turno);
    }
    setLocal(STORAGE_KEYS.TURNOS, turnos);
    saveToFirestore(COLLECTIONS.TURNOS, turno);
  },

  deleteTurno: (id: string) => {
    let list = getLocal<Turno[]>(STORAGE_KEYS.TURNOS, initialTurnos);
    list = list.filter(t => t.id !== id);
    setLocal(STORAGE_KEYS.TURNOS, list);
    deleteFromFirestore(COLLECTIONS.TURNOS, id);
  },

  // PAGOS
  getPagos: (empresaId: string): Pago[] => {
    const pagos = getLocal<Pago[]>(STORAGE_KEYS.PAGOS, initialPagos);
    return pagos.filter(p => p.empresaId === empresaId);
  },

  savePago: (pago: Pago) => {
    const pagos = getLocal<Pago[]>(STORAGE_KEYS.PAGOS, initialPagos);
    pagos.push(pago);
    setLocal(STORAGE_KEYS.PAGOS, pagos);
    saveToFirestore(COLLECTIONS.PAGOS, pago);

    // Update Turno cobrado status if associated
    if (pago.turnoId) {
      const turnos = getLocal<Turno[]>(STORAGE_KEYS.TURNOS, initialTurnos);
      const turno = turnos.find(t => t.id === pago.turnoId);
      if (turno) {
        turno.cobrado = true;
        turno.pagoAsociadoId = pago.id;
        turno.estado = 'completado';
        setLocal(STORAGE_KEYS.TURNOS, turnos);
        saveToFirestore(COLLECTIONS.TURNOS, turno);
      }
    }

    // Update Caja Diaria movimientos
    const todayStr = new Date().toISOString().split('T')[0];
    const cajas = getLocal<CajaDiaria[]>(STORAGE_KEYS.CAJAS, initialCajas);
    let cajaToday = cajas.find(c => c.empresaId === pago.empresaId && c.fecha === todayStr);
    if (!cajaToday) {
      cajaToday = {
        id: `caja_${Date.now()}`,
        empresaId: pago.empresaId,
        fecha: todayStr,
        saldoInicial: 0,
        totalIngresos: 0,
        totalEgresos: 0,
        saldoFinal: 0,
        estado: 'abierta',
        movimientos: [],
        abiertaPor: pago.registradoPor
      };
      cajas.push(cajaToday);
    }

    cajaToday.movimientos.push({
      id: `mov_${Date.now()}`,
      tipo: 'ingreso',
      monto: pago.monto,
      concepto: `Pago registrado (${pago.metodoPago.toUpperCase()})`,
      metodoPago: pago.metodoPago,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      registradoPor: pago.registradoPor
    });

    cajaToday.totalIngresos += pago.monto;
    cajaToday.saldoFinal = (cajaToday.saldoInicial + cajaToday.totalIngresos) - cajaToday.totalEgresos;
    setLocal(STORAGE_KEYS.CAJAS, cajas);
    saveToFirestore(COLLECTIONS.CAJAS, cajaToday);
  },

  // CAJAS
  getCajas: (empresaId: string): CajaDiaria[] => {
    const cajas = getLocal<CajaDiaria[]>(STORAGE_KEYS.CAJAS, initialCajas);
    return cajas.filter(c => c.empresaId === empresaId);
  },

  getCajaHoy: (empresaId: string): CajaDiaria | undefined => {
    const todayStr = new Date().toISOString().split('T')[0];
    return StorageService.getCajas(empresaId).find(c => c.fecha === todayStr);
  },

  saveCaja: (caja: CajaDiaria) => {
    const cajas = getLocal<CajaDiaria[]>(STORAGE_KEYS.CAJAS, initialCajas);
    const idx = cajas.findIndex(c => c.id === caja.id);
    if (idx >= 0) {
      cajas[idx] = caja;
    } else {
      cajas.push(caja);
    }
    setLocal(STORAGE_KEYS.CAJAS, cajas);
    saveToFirestore(COLLECTIONS.CAJAS, caja);
  },

  // NOTIFICACIONES
  getNotificaciones: (empresaId: string): Notificacion[] => {
    const notifs = getLocal<Notificacion[]>(STORAGE_KEYS.NOTIFICACIONES, initialNotificaciones);
    return notifs.filter(n => n.empresaId === empresaId);
  },

  saveNotificacion: (notif: Notificacion) => {
    const notifs = getLocal<Notificacion[]>(STORAGE_KEYS.NOTIFICACIONES, initialNotificaciones);
    notifs.unshift(notif);
    setLocal(STORAGE_KEYS.NOTIFICACIONES, notifs);
    saveToFirestore(COLLECTIONS.NOTIFICACIONES, notif);
  }
};
