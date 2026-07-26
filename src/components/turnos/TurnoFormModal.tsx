import React, { useState, useEffect } from 'react';
import { Turno, Cliente, Servicio, Empleado, EstadoTurno } from '../../types';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storageService';
import { useCompany } from '../../contexts/CompanyContext';
import { addMinutesToTime, generateTimeSlots, getTodayString } from '../../utils/dateUtils';
import { AlertTriangle, Clock, Calendar, User, Scissors, Check, Plus } from 'lucide-react';

interface TurnoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnoToEdit?: Turno | null;
  initialDate?: string;
  initialTime?: string;
  initialEmpleadoId?: string;
  onSaved: () => void;
}

export const TurnoFormModal: React.FC<TurnoFormModalProps> = ({
  isOpen,
  onClose,
  turnoToEdit,
  initialDate,
  initialTime,
  initialEmpleadoId,
  onSaved
}) => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [fecha, setFecha] = useState(initialDate || getTodayString());
  const [horaInicio, setHoraInicio] = useState(initialTime || '09:00');
  const [estado, setEstado] = useState<EstadoTurno>('pendiente');
  const [observaciones, setObservaciones] = useState('');
  const [cobrarAhora, setCobrarAhora] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago'>('efectivo');

  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Quick New Client inline state
  const [showQuickNewClient, setShowQuickNewClient] = useState(false);
  const [newCliNombre, setNewCliNombre] = useState('');
  const [newCliApellido, setNewCliApellido] = useState('');
  const [newCliTelefono, setNewCliTelefono] = useState('');

  useEffect(() => {
    if (isOpen) {
      const cliList = StorageService.getClientes(empresaId);
      const srvList = StorageService.getServicios(empresaId);
      const empList = StorageService.getEmpleados(empresaId);

      setClientes(cliList);
      setServicios(srvList);
      setEmpleados(empList);

      if (turnoToEdit) {
        setClienteId(turnoToEdit.clienteId);
        setServicioId(turnoToEdit.servicioId);
        setEmpleadoId(turnoToEdit.empleadoId);
        setFecha(turnoToEdit.fecha);
        setHoraInicio(turnoToEdit.horaInicio);
        setEstado(turnoToEdit.estado);
        setObservaciones(turnoToEdit.observaciones || '');
      } else {
        setClienteId(cliList[0]?.id || '');
        setServicioId(srvList[0]?.id || '');
        setEmpleadoId(initialEmpleadoId || empList[0]?.id || '');
        setFecha(initialDate || getTodayString());
        setHoraInicio(initialTime || '09:00');
        setEstado('pendiente');
        setObservaciones('');
        setCobrarAhora(false);
      }
      setError('');
      setCollisionWarning(null);
    }
  }, [isOpen, turnoToEdit, initialDate, initialTime, initialEmpleadoId, empresaId]);

  const selectedServicio = servicios.find(s => s.id === servicioId);
  const duracion = selectedServicio?.duracionMinutos || 30;
  const precioTotal = selectedServicio?.precio || 0;
  const horaFin = addMinutesToTime(horaInicio, duracion);

  // Validate collision whenever fecha, horaInicio, duracion, or empleadoId changes
  useEffect(() => {
    if (!empleadoId || !fecha || !horaInicio) return;

    const existingTurnos = StorageService.getTurnos(empresaId);
    const endMinutesNew = parseHHmm(horaFin);
    const startMinutesNew = parseHHmm(horaInicio);

    const collision = existingTurnos.find(t => {
      if (t.id === turnoToEdit?.id) return false; // ignore self
      if (t.empleadoId !== empleadoId || t.fecha !== fecha || t.estado === 'cancelado') return false;

      const startExist = parseHHmm(t.horaInicio);
      const endExist = parseHHmm(t.horaFin);

      // Overlap check
      return (startMinutesNew < endExist && endMinutesNew > startExist);
    });

    if (collision) {
      setCollisionWarning(`¡Atención! El empleado ya tiene un turno reservado de ${collision.horaInicio} a ${collision.horaFin} hs.`);
    } else {
      setCollisionWarning(null);
    }
  }, [fecha, horaInicio, duracion, empleadoId, empresaId, turnoToEdit]);

  function parseHHmm(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliNombre || !newCliTelefono) return;

    const newCli: Cliente = {
      id: `cli_${Date.now()}`,
      empresaId,
      nombre: newCliNombre,
      apellido: newCliApellido,
      dni: '',
      email: '',
      telefono: newCliTelefono,
      deudaTotal: 0,
      fechaCreacion: getTodayString()
    };

    StorageService.saveCliente(newCli);
    setClientes(prev => [newCli, ...prev]);
    setClienteId(newCli.id);
    setShowQuickNewClient(false);
    setNewCliNombre('');
    setNewCliApellido('');
    setNewCliTelefono('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !servicioId || !empleadoId) {
      setError('Por favor completa cliente, servicio y empleado.');
      return;
    }

    if (collisionWarning) {
      setError('No se puede guardar un turno en un horario superpuesto.');
      return;
    }

    const newTurno: Turno = {
      id: turnoToEdit ? turnoToEdit.id : `tur_${Date.now()}`,
      empresaId,
      clienteId,
      servicioId,
      empleadoId,
      fecha,
      horaInicio,
      horaFin,
      duracionMinutos: duracion,
      estado: cobrarAhora ? 'completado' : estado,
      observaciones,
      precioTotal,
      cobrado: cobrarAhora ? true : (turnoToEdit?.cobrado || false),
      creadoPor: 'Usuario Activo',
      createdAt: turnoToEdit ? turnoToEdit.createdAt : new Date().toISOString()
    };

    StorageService.saveTurno(newTurno);

    if (cobrarAhora) {
      StorageService.savePago({
        id: `pago_${Date.now()}`,
        empresaId,
        clienteId,
        turnoId: newTurno.id,
        monto: precioTotal,
        metodoPago,
        estado: 'completado',
        fecha: new Date().toISOString(),
        observaciones: `Cobro directo al agendar turno`,
        registradoPor: 'Caja Directa'
      });
    }

    onSaved();
    onClose();
  };

  const slots = generateTimeSlots(
    empresa?.horarios?.[0]?.apertura || '08:00',
    empresa?.horarios?.[0]?.cierre || '20:00',
    15
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={turnoToEdit ? 'Editar Turno' : 'Agendar Nuevo Turno'}
      subtitle="Complete los detalles de la reserva y asignación"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {collisionWarning && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{collisionWarning}</span>
          </div>
        )}

        {/* Cliente Selection with Quick Add */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" /> Cliente
            </label>
            <button
              type="button"
              onClick={() => setShowQuickNewClient(!showQuickNewClient)}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Nuevo Cliente
            </button>
          </div>

          {showQuickNewClient ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 mb-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Alta Rápida de Cliente</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre *"
                  value={newCliNombre}
                  onChange={e => setNewCliNombre(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={newCliApellido}
                  onChange={e => setNewCliApellido(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Teléfono / WhatsApp *"
                  value={newCliTelefono}
                  onChange={e => setNewCliTelefono(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={handleCreateQuickClient}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <select
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="">-- Seleccionar Cliente --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellido} ({c.telefono || 'Sin tel'})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Servicio Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-blue-500" /> Servicio
            </label>
            <select
              value={servicioId}
              onChange={e => setServicioId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              {servicios.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.duracionMinutos} min - {empresa?.moneda}{s.precio})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" /> Empleado Asignado
            </label>
            <select
              value={empleadoId}
              onChange={e => setEmpleadoId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              {empleados.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.especialidad})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date, Time Slot & Calculated Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Hora Inicio
            </label>
            <select
              value={horaInicio}
              onChange={e => setHoraInicio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              {slots.map(s => (
                <option key={s} value={s}>
                  {s} hs
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hora Fin Estimada
            </label>
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white">
              {horaFin} hs ({duracion} min)
            </div>
          </div>
        </div>

        {/* Estado & Observaciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Estado del Turno
            </label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value as EstadoTurno)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Precio a Cobrar
            </label>
            <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-bold text-sm">
              {empresa?.moneda}{precioTotal.toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Observaciones o Notas
          </label>
          <input
            type="text"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Ej. Trae su propio diseño, prefiere café sin azúcar"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>

        {/* Quick Payment Options */}
        {!turnoToEdit?.cobrado && (
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <input
                type="checkbox"
                checked={cobrarAhora}
                onChange={e => setCobrarAhora(e.target.checked)}
                className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              Cobrar ahora e ingresar pago a Caja Diaria
            </label>

            {cobrarAhora && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Método:</span>
                <select
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta Débito/Crédito</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="mercadopago">Mercado Pago / QR</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {turnoToEdit ? 'Guardar Cambios' : 'Confirmar Reserva'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
