import { Empresa, Usuario, Cliente, Empleado, CategoriaServicio, Servicio, Turno, Pago, CajaDiaria, Notificacion, PermisosRolesMap } from '../types';

const defaultPermisosModulo = { ver: true, crear: true, editar: true, eliminar: true };
const restrictedPermisosModulo = { ver: true, crear: false, editar: false, eliminar: false };

export const defaultPermisosRoles: Record<string, PermisosRolesMap> = {
  dueno: {
    dashboard: defaultPermisosModulo,
    agenda: defaultPermisosModulo,
    turnos: defaultPermisosModulo,
    clientes: defaultPermisosModulo,
    empleados: defaultPermisosModulo,
    servicios: defaultPermisosModulo,
    pagos: defaultPermisosModulo,
    reportes: defaultPermisosModulo,
    configuracion: defaultPermisosModulo,
    notificaciones: defaultPermisosModulo,
  },
  admin: {
    dashboard: defaultPermisosModulo,
    agenda: defaultPermisosModulo,
    turnos: defaultPermisosModulo,
    clientes: defaultPermisosModulo,
    empleados: defaultPermisosModulo,
    servicios: defaultPermisosModulo,
    pagos: defaultPermisosModulo,
    reportes: defaultPermisosModulo,
    configuracion: { ver: true, crear: true, editar: true, eliminar: false },
    notificaciones: defaultPermisosModulo,
  },
  recepcionista: {
    dashboard: defaultPermisosModulo,
    agenda: defaultPermisosModulo,
    turnos: defaultPermisosModulo,
    clientes: defaultPermisosModulo,
    empleados: { ver: true, crear: false, editar: false, eliminar: false },
    servicios: { ver: true, crear: false, editar: false, eliminar: false },
    pagos: defaultPermisosModulo,
    reportes: { ver: true, crear: false, editar: false, eliminar: false },
    configuracion: restrictedPermisosModulo,
    notificaciones: defaultPermisosModulo,
  },
  empleado: {
    dashboard: restrictedPermisosModulo,
    agenda: { ver: true, crear: true, editar: true, eliminar: false },
    turnos: { ver: true, crear: true, editar: true, eliminar: false },
    clientes: { ver: true, crear: true, editar: false, eliminar: false },
    empleados: restrictedPermisosModulo,
    servicios: restrictedPermisosModulo,
    pagos: restrictedPermisosModulo,
    reportes: restrictedPermisosModulo,
    configuracion: restrictedPermisosModulo,
    notificaciones: restrictedPermisosModulo,
  },
  supervisor: {
    dashboard: defaultPermisosModulo,
    agenda: defaultPermisosModulo,
    turnos: defaultPermisosModulo,
    clientes: defaultPermisosModulo,
    empleados: defaultPermisosModulo,
    servicios: defaultPermisosModulo,
    pagos: defaultPermisosModulo,
    reportes: defaultPermisosModulo,
    configuracion: restrictedPermisosModulo,
    notificaciones: defaultPermisosModulo,
  },
  superadmin: {
    dashboard: defaultPermisosModulo,
    agenda: defaultPermisosModulo,
    turnos: defaultPermisosModulo,
    clientes: defaultPermisosModulo,
    empleados: defaultPermisosModulo,
    servicios: defaultPermisosModulo,
    pagos: defaultPermisosModulo,
    reportes: defaultPermisosModulo,
    configuracion: defaultPermisosModulo,
    notificaciones: defaultPermisosModulo,
  }
};

export const initialEmpresas: Empresa[] = [
  {
    id: 'emp_01',
    nombre: 'Apex Barber Club',
    rutCuit: '30-71829384-9',
    rubro: 'Barbería y Estética Masculina',
    colorPrimario: '#3b82f6',
    moneda: '$',
    zonaHoraria: 'America/Argentina/Buenos_Aires',
    impuestosPorcentaje: 21,
    duracionMinimaTurno: 30,
    duracionMaximaTurno: 120,
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    horarios: [
      { dia: 'lunes', activo: true, apertura: '09:00', cierre: '20:00', almuerzoInicio: '13:00', almuerzoFin: '14:00' },
      { dia: 'martes', activo: true, apertura: '09:00', cierre: '20:00', almuerzoInicio: '13:00', almuerzoFin: '14:00' },
      { dia: 'miercoles', activo: true, apertura: '09:00', cierre: '20:00', almuerzoInicio: '13:00', almuerzoFin: '14:00' },
      { dia: 'jueves', activo: true, apertura: '09:00', cierre: '20:00', almuerzoInicio: '13:00', almuerzoFin: '14:00' },
      { dia: 'viernes', activo: true, apertura: '09:00', cierre: '20:00', almuerzoInicio: '13:00', almuerzoFin: '14:00' },
      { dia: 'sabado', activo: true, apertura: '09:00', cierre: '19:00' },
      { dia: 'domingo', activo: false, apertura: '10:00', cierre: '14:00' }
    ],
    estadosCustomTurno: [
      { id: 'est_1', nombre: 'Pendiente', color: '#f59e0b', estadoOriginal: 'pendiente' },
      { id: 'est_2', nombre: 'Confirmado', color: '#10b981', estadoOriginal: 'confirmado' },
      { id: 'est_3', nombre: 'En Sillón', color: '#6366f1', estadoOriginal: 'en_proceso' },
      { id: 'est_4', nombre: 'Completado', color: '#059669', estadoOriginal: 'completado' },
      { id: 'est_5', nombre: 'Cancelado', color: '#ef4444', estadoOriginal: 'cancelado' },
      { id: 'est_6', nombre: 'No asistió', color: '#6b7280', estadoOriginal: 'ausente' },
    ],
    camposPersonalizadosCliente: [
      { id: 'cp_1', nombre: 'Tipo de Barba', tipo: 'seleccion', requerido: false, opciones: ['Corta', 'Larga', 'Candado', 'Afeitado'] },
      { id: 'cp_2', nombre: 'Alergias a productos', tipo: 'texto', requerido: false }
    ],
    permisosRoles: defaultPermisosRoles,
    estado: 'activa',
    createdAt: '2026-01-10'
  },
  {
    id: 'emp_02',
    nombre: 'Clinica Health & Dental',
    rutCuit: '33-65982143-4',
    rubro: 'Salud y Odontología',
    colorPrimario: '#0d9488',
    moneda: 'USD$',
    zonaHoraria: 'America/Santiago',
    impuestosPorcentaje: 19,
    duracionMinimaTurno: 30,
    duracionMaximaTurno: 90,
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    horarios: [
      { dia: 'lunes', activo: true, apertura: '08:00', cierre: '18:00', almuerzoInicio: '12:30', almuerzoFin: '13:30' },
      { dia: 'martes', activo: true, apertura: '08:00', cierre: '18:00', almuerzoInicio: '12:30', almuerzoFin: '13:30' },
      { dia: 'miercoles', activo: true, apertura: '08:00', cierre: '18:00', almuerzoInicio: '12:30', almuerzoFin: '13:30' },
      { dia: 'jueves', activo: true, apertura: '08:00', cierre: '18:00', almuerzoInicio: '12:30', almuerzoFin: '13:30' },
      { dia: 'viernes', activo: true, apertura: '08:00', cierre: '18:00', almuerzoInicio: '12:30', almuerzoFin: '13:30' },
      { dia: 'sabado', activo: false, apertura: '09:00', cierre: '13:00' },
      { dia: 'domingo', activo: false, apertura: '09:00', cierre: '13:00' }
    ],
    estadosCustomTurno: [
      { id: 'est_1', nombre: 'Pendiente', color: '#f59e0b', estadoOriginal: 'pendiente' },
      { id: 'est_2', nombre: 'Confirmado', color: '#10b981', estadoOriginal: 'confirmado' },
      { id: 'est_3', nombre: 'En Consulta', color: '#0284c7', estadoOriginal: 'en_proceso' },
      { id: 'est_4', nombre: 'Atendido', color: '#059669', estadoOriginal: 'completado' },
      { id: 'est_5', nombre: 'Cancelado', color: '#ef4444', estadoOriginal: 'cancelado' },
    ],
    camposPersonalizadosCliente: [
      { id: 'cp_dental_1', nombre: 'N° Ficha Clínica', tipo: 'texto', requerido: true },
      { id: 'cp_dental_2', nombre: 'Seguro Médico', tipo: 'texto', requerido: false }
    ],
    permisosRoles: defaultPermisosRoles,
    estado: 'activa',
    createdAt: '2026-02-01'
  }
];

export const initialUsuarios: Usuario[] = [
  {
    id: 'usr_super',
    empresaId: 'emp_01',
    email: 'admin@turnosaas.com',
    nombre: 'Carlos SaaS SuperAdmin',
    rol: 'superadmin',
    estado: 'activo'
  },
  {
    id: 'usr_dueno1',
    empresaId: 'emp_01',
    email: 'marcos@apexbarber.com',
    nombre: 'Marcos Rivas (Dueño)',
    rol: 'dueno',
    estado: 'activo',
    telefono: '+5491144332211'
  },
  {
    id: 'usr_rec1',
    empresaId: 'emp_01',
    email: 'lucia@apexbarber.com',
    nombre: 'Lucía Gómez (Recepción)',
    rol: 'recepcionista',
    estado: 'activo'
  },
  {
    id: 'usr_emp1',
    empresaId: 'emp_01',
    email: 'franco@apexbarber.com',
    nombre: 'Franco Silva (Estilista)',
    rol: 'empleado',
    estado: 'activo'
  },
  {
    id: 'usr_dueno2',
    empresaId: 'emp_02',
    email: 'dr.mendoza@healthdental.com',
    nombre: 'Dr. Alejandro Mendoza (Director)',
    rol: 'dueno',
    estado: 'activo'
  }
];

export const initialClientes: Cliente[] = [
  {
    id: 'cli_01',
    empresaId: 'emp_01',
    nombre: 'Gabriel',
    apellido: 'Sosa',
    dni: '38192834',
    email: 'gabriel.sosa@gmail.com',
    telefono: '+5491155443322',
    direccion: 'Av. Corrientes 1234',
    observaciones: 'Prefiere corte degradado bajo y cera mate',
    camposPersonalizados: { 'Tipo de Barba': 'Corta', 'Alergias a productos': 'Ninguna' },
    deudaTotal: 0,
    fechaCreacion: '2026-03-01'
  },
  {
    id: 'cli_02',
    empresaId: 'emp_01',
    nombre: 'Martín',
    apellido: 'Pereyra',
    dni: '41029384',
    email: 'martin.pereyra@hotmail.com',
    telefono: '+5491199887766',
    direccion: 'Calle Florida 890',
    observaciones: 'Suele venir los viernes',
    camposPersonalizados: { 'Tipo de Barba': 'Candado' },
    deudaTotal: 2500,
    fechaCreacion: '2026-03-15'
  },
  {
    id: 'cli_03',
    empresaId: 'emp_01',
    nombre: 'Diego',
    apellido: 'Fernández',
    dni: '35889012',
    email: 'diego.f@yahoo.com',
    telefono: '+5491133221100',
    direccion: 'Belgrano 450',
    deudaTotal: 0,
    fechaCreacion: '2026-04-02'
  },
  {
    id: 'cli_04',
    empresaId: 'emp_02',
    nombre: 'Valeria',
    apellido: 'Rossi',
    dni: '18992019',
    email: 'valeria.rossi@gmail.com',
    telefono: '+56987654321',
    camposPersonalizados: { 'N° Ficha Clínica': 'F-88902', 'Seguro Médico': 'OSDE 310' },
    deudaTotal: 0,
    fechaCreacion: '2026-03-10'
  }
];

export const initialEmpleados: Empleado[] = [
  {
    id: 'emp_b1',
    empresaId: 'emp_01',
    nombre: 'Franco Silva',
    especialidad: 'Master Barber & Hair Stylist',
    colorAgenda: '#3b82f6',
    estado: 'activo',
    serviciosAsignadosIds: ['srv_01', 'srv_02', 'srv_03'],
    horarios: [
      { dia: 'lunes', activo: true, apertura: '09:00', cierre: '19:00' },
      { dia: 'martes', activo: true, apertura: '09:00', cierre: '19:00' },
      { dia: 'miercoles', activo: true, apertura: '09:00', cierre: '19:00' },
      { dia: 'jueves', activo: true, apertura: '09:00', cierre: '19:00' },
      { dia: 'viernes', activo: true, apertura: '09:00', cierre: '19:00' },
      { dia: 'sabado', activo: true, apertura: '09:00', cierre: '17:00' }
    ]
  },
  {
    id: 'emp_b2',
    empresaId: 'emp_01',
    nombre: 'Enzo Benítez',
    especialidad: 'Barba Tradicional y Navaja',
    colorAgenda: '#10b981',
    estado: 'activo',
    serviciosAsignadosIds: ['srv_01', 'srv_02'],
    horarios: [
      { dia: 'lunes', activo: true, apertura: '10:00', cierre: '20:00' },
      { dia: 'martes', activo: true, apertura: '10:00', cierre: '20:00' },
      { dia: 'miercoles', activo: true, apertura: '10:00', cierre: '20:00' },
      { dia: 'jueves', activo: true, apertura: '10:00', cierre: '20:00' },
      { dia: 'viernes', activo: true, apertura: '10:00', cierre: '20:00' },
      { dia: 'sabado', activo: true, apertura: '10:00', cierre: '18:00' }
    ]
  },
  {
    id: 'emp_d1',
    empresaId: 'emp_02',
    nombre: 'Dra. María Paz Riquelme',
    especialidad: 'Odontología Estética & Ortodoncia',
    colorAgenda: '#0d9488',
    estado: 'activo',
    serviciosAsignadosIds: ['srv_med_1'],
    horarios: [
      { dia: 'lunes', activo: true, apertura: '08:00', cierre: '16:00' },
      { dia: 'miercoles', activo: true, apertura: '08:00', cierre: '16:00' },
      { dia: 'viernes', activo: true, apertura: '08:00', cierre: '16:00' }
    ]
  }
];

export const initialCategorias: CategoriaServicio[] = [
  { id: 'cat_01', empresaId: 'emp_01', nombre: 'Cortes & Cabello', color: '#3b82f6', descripcion: 'Servicios capilares masculinos' },
  { id: 'cat_02', empresaId: 'emp_01', nombre: 'Barbería & Ritual', color: '#10b981', descripcion: 'Tratamientos de barba y toalla caliente' },
  { id: 'cat_03', empresaId: 'emp_01', nombre: 'Combos VIP', color: '#8b5cf6', descripcion: 'Servicios integrales con bebida incluida' },
  { id: 'cat_med_1', empresaId: 'emp_02', nombre: 'Consulta & Limpieza', color: '#0d9488' }
];

export const initialServicios: Servicio[] = [
  {
    id: 'srv_01',
    empresaId: 'emp_01',
    categoriaId: 'cat_01',
    nombre: 'Corte de Cabello Executive',
    duracionMinutos: 30,
    precio: 12000,
    color: '#3b82f6',
    empleadosHabilitadosIds: ['emp_b1', 'emp_b2'],
    disponibleOnline: true,
    descripcion: 'Incluye lavado, diseño de corte, peinado con pomada mate y bebida de cortesía.'
  },
  {
    id: 'srv_02',
    empresaId: 'emp_01',
    categoriaId: 'cat_02',
    nombre: 'Ritual de Barba & Toalla Caliente',
    duracionMinutos: 30,
    precio: 9500,
    color: '#10b981',
    empleadosHabilitadosIds: ['emp_b1', 'emp_b2'],
    disponibleOnline: true,
    descripcion: 'Perfilado a navaja, aceites esenciales, toalla aromatizada y vapor de ozono.'
  },
  {
    id: 'srv_03',
    empresaId: 'emp_01',
    categoriaId: 'cat_03',
    nombre: 'Combo Apex Full (Corte + Barba)',
    duracionMinutos: 60,
    precio: 18500,
    color: '#8b5cf6',
    empleadosHabilitadosIds: ['emp_b1'],
    disponibleOnline: true,
    descripcion: 'Experiencia completa de 60 minutos con café gourmet o whisky.'
  },
  {
    id: 'srv_med_1',
    empresaId: 'emp_02',
    categoriaId: 'cat_med_1',
    nombre: 'Limpieza Dental Ultrasonido',
    duracionMinutos: 45,
    precio: 45000,
    color: '#0d9488',
    empleadosHabilitadosIds: ['emp_d1'],
    disponibleOnline: true
  }
];

const todayStr = new Date().toISOString().split('T')[0];

export const initialTurnos: Turno[] = [
  {
    id: 'tur_01',
    empresaId: 'emp_01',
    clienteId: 'cli_01',
    servicioId: 'srv_01',
    empleadoId: 'emp_b1',
    fecha: todayStr,
    horaInicio: '09:30',
    horaFin: '10:00',
    duracionMinutos: 30,
    estado: 'confirmado',
    observaciones: 'Cliente puntual',
    precioTotal: 12000,
    cobrado: true,
    pagoAsociadoId: 'pago_01',
    creadoPor: 'Lucía Gómez',
    createdAt: `${todayStr}T08:00:00Z`
  },
  {
    id: 'tur_02',
    empresaId: 'emp_01',
    clienteId: 'cli_02',
    servicioId: 'srv_03',
    empleadoId: 'emp_b1',
    fecha: todayStr,
    horaInicio: '11:00',
    horaFin: '12:00',
    duracionMinutos: 60,
    estado: 'pendiente',
    precioTotal: 18500,
    cobrado: false,
    creadoPor: 'Lucía Gómez',
    createdAt: `${todayStr}T08:30:00Z`
  },
  {
    id: 'tur_03',
    empresaId: 'emp_01',
    clienteId: 'cli_03',
    servicioId: 'srv_02',
    empleadoId: 'emp_b2',
    fecha: todayStr,
    horaInicio: '15:00',
    horaFin: '15:30',
    duracionMinutos: 30,
    estado: 'completado',
    precioTotal: 9500,
    cobrado: true,
    pagoAsociadoId: 'pago_02',
    creadoPor: 'Marcos Rivas',
    createdAt: `${todayStr}T09:00:00Z`
  }
];

export const initialPagos: Pago[] = [
  {
    id: 'pago_01',
    empresaId: 'emp_01',
    clienteId: 'cli_01',
    turnoId: 'tur_01',
    monto: 12000,
    metodoPago: 'mercadopago',
    estado: 'completado',
    fecha: `${todayStr}T09:35:00Z`,
    observaciones: 'Abonado con QR',
    registradoPor: 'Lucía Gómez'
  },
  {
    id: 'pago_02',
    empresaId: 'emp_01',
    clienteId: 'cli_03',
    turnoId: 'tur_03',
    monto: 9500,
    metodoPago: 'efectivo',
    estado: 'completado',
    fecha: `${todayStr}T15:35:00Z`,
    observaciones: 'Pago exacto',
    registradoPor: 'Marcos Rivas'
  }
];

export const initialCajas: CajaDiaria[] = [
  {
    id: 'caja_today',
    empresaId: 'emp_01',
    fecha: todayStr,
    saldoInicial: 15000,
    totalIngresos: 21500,
    totalEgresos: 3000,
    saldoFinal: 33500,
    estado: 'abierta',
    abiertaPor: 'Lucía Gómez',
    movimientos: [
      { id: 'mov_1', tipo: 'ingreso', monto: 12000, concepto: 'Pago Turno Gabriel Sosa', metodoPago: 'mercadopago', hora: '09:35', registradoPor: 'Lucía Gómez' },
      { id: 'mov_2', tipo: 'egreso', monto: 3000, concepto: 'Compra insumos limpieza y toallas', metodoPago: 'efectivo', hora: '11:15', registradoPor: 'Marcos Rivas' },
      { id: 'mov_3', tipo: 'ingreso', monto: 9500, concepto: 'Pago Turno Diego Fernández', metodoPago: 'efectivo', hora: '15:35', registradoPor: 'Marcos Rivas' }
    ]
  }
];

export const initialNotificaciones: Notificacion[] = [
  {
    id: 'not_1',
    empresaId: 'emp_01',
    tipo: 'whatsapp',
    destinatario: '+5491155443322',
    mensaje: 'Hola Gabriel! Te recordamos tu turno hoy a las 09:30 hs en Apex Barber Club.',
    estado: 'enviado',
    fechaEnvio: `${todayStr}T07:30:00Z`,
    clienteNombre: 'Gabriel Sosa'
  },
  {
    id: 'not_2',
    empresaId: 'emp_01',
    tipo: 'email',
    destinatario: 'martin.pereyra@hotmail.com',
    mensaje: 'Hola Martín, confirmación de reserva para Combo Apex Full a las 11:00 hs.',
    estado: 'enviado',
    fechaEnvio: `${todayStr}T08:00:00Z`,
    clienteNombre: 'Martín Pereyra'
  }
];
