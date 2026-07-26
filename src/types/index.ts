export type RolUsuario = 'superadmin' | 'dueno' | 'admin' | 'recepcionista' | 'empleado' | 'supervisor';

export type EstadoTurno = 'pendiente' | 'confirmado' | 'en_proceso' | 'completado' | 'cancelado' | 'ausente';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago' | 'otro';

export type TipoCampoPersonalizado = 'texto' | 'numero' | 'fecha' | 'booleano' | 'seleccion';

export interface CampoPersonalizadoDef {
  id: string;
  nombre: string;
  tipo: TipoCampoPersonalizado;
  requerido: boolean;
  opciones?: string[]; // Para tipo seleccion
}

export interface PermisosModulo {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export interface PermisosRolesMap {
  dashboard: PermisosModulo;
  agenda: PermisosModulo;
  turnos: PermisosModulo;
  clientes: PermisosModulo;
  empleados: PermisosModulo;
  servicios: PermisosModulo;
  pagos: PermisosModulo;
  reportes: PermisosModulo;
  configuracion: PermisosModulo;
  notificaciones: PermisosModulo;
}

export interface HorarioAtencion {
  dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  activo: boolean;
  apertura: string; // "09:00"
  cierre: string;   // "19:00"
  almuerzoInicio?: string; // "13:00"
  almuerzoFin?: string;    // "14:00"
}

export interface Sucursal {
  id: string;
  empresaId: string;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: 'activa' | 'inactiva';
}

export interface Empresa {
  id: string;
  nombre: string;
  slug?: string;
  rutCuit: string;
  rubro: string; // e.g. "Barbería", "Medicina", "Estética", "Consultoría", "Gimnasio"
  logoUrl?: string;
  colorPrimario: string;
  moneda: string; // "$", "USD", "EUR", "MXN"
  zonaHoraria: string;
  impuestosPorcentaje: number;
  duracionMinimaTurno: number; // en minutos (15, 30, etc.)
  duracionMaximaTurno: number; // en minutos
  diasLaborales: string[]; // ["lunes", "martes", ...]
  horarios: HorarioAtencion[];
  estadosCustomTurno: { id: string; nombre: string; color: string; estadoOriginal: EstadoTurno }[];
  camposPersonalizadosCliente: CampoPersonalizadoDef[];
  permisosRoles: Record<RolUsuario, PermisosRolesMap>;
  estado: 'activa' | 'suspendida';
  createdAt: string;
}

export interface Usuario {
  id: string;
  empresaId: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  avatarUrl?: string;
  telefono?: string;
  sucursalId?: string;
  estado: 'activo' | 'inactivo';
}

export interface Cliente {
  id: string;
  empresaId: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  direccion?: string;
  observaciones?: string;
  camposPersonalizados?: Record<string, any>;
  deudaTotal: number;
  fechaCreacion: string;
}

export interface Empleado {
  id: string;
  empresaId: string;
  sucursalId?: string;
  nombre: string;
  especialidad: string;
  horarios: HorarioAtencion[];
  serviciosAsignadosIds: string[];
  colorAgenda: string;
  estado: 'activo' | 'inactivo';
  fotoUrl?: string;
}

export interface CategoriaServicio {
  id: string;
  empresaId: string;
  nombre: string;
  descripcion?: string;
  color: string;
}

export interface Servicio {
  id: string;
  empresaId: string;
  categoriaId: string;
  nombre: string;
  duracionMinutos: number;
  precio: number;
  color: string;
  empleadosHabilitadosIds: string[];
  disponibleOnline: boolean;
  descripcion?: string;
}

export interface Turno {
  id: string;
  empresaId: string;
  sucursalId?: string;
  clienteId: string;
  servicioId: string;
  empleadoId: string;
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  duracionMinutos: number;
  estado: EstadoTurno;
  observaciones?: string;
  precioTotal: number;
  pagoAsociadoId?: string;
  cobrado: boolean;
  creadoPor: string;
  createdAt: string;
}

export interface MovimientoCaja {
  id: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  concepto: string;
  metodoPago: MetodoPago;
  hora: string;
  registradoPor: string;
}

export interface CajaDiaria {
  id: string;
  empresaId: string;
  fecha: string; // YYYY-MM-DD
  saldoInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoFinal: number;
  estado: 'abierta' | 'cerrada';
  movimientos: MovimientoCaja[];
  abiertaPor: string;
  cerradaPor?: string;
}

export interface Pago {
  id: string;
  empresaId: string;
  clienteId: string;
  turnoId?: string;
  monto: number;
  metodoPago: MetodoPago;
  estado: 'completado' | 'anulado';
  fecha: string; // ISO string or YYYY-MM-DD
  observaciones?: string;
  registradoPor: string;
}

export interface Notificacion {
  id: string;
  empresaId: string;
  tipo: 'email' | 'whatsapp' | 'sms' | 'push';
  destinatario: string;
  mensaje: string;
  estado: 'enviado' | 'pendiente' | 'fallido';
  fechaEnvio: string;
  turnoId?: string;
  clienteNombre?: string;
}
