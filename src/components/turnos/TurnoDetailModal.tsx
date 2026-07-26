import React, { useState } from 'react';
import { Turno, EstadoTurno } from '../../types';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storageService';
import { useCompany } from '../../contexts/CompanyContext';
import { formatDate } from '../../utils/dateUtils';
import { CobroModal } from '../pagos/CobroModal';
import { User, Scissors, Calendar, Clock, DollarSign, Check, X, Trash2, Receipt } from 'lucide-react';

interface TurnoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  turno: Turno;
  onSaved: () => void;
}

export const TurnoDetailModal: React.FC<TurnoDetailModalProps> = ({
  isOpen,
  onClose,
  turno,
  onSaved
}) => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const clientes = StorageService.getClientes(empresaId);
  const servicios = StorageService.getServicios(empresaId);
  const empleados = StorageService.getEmpleados(empresaId);

  const cliente = clientes.find(c => c.id === turno.clienteId);
  const servicio = servicios.find(s => s.id === turno.servicioId);
  const empleado = empleados.find(e => e.id === turno.empleadoId);

  const [showCobro, setShowCobro] = useState(false);

  const handleEstadoChange = (nuevoEstado: EstadoTurno) => {
    StorageService.saveTurno({ ...turno, estado: nuevoEstado });
    onSaved();
  };

  const handleDelete = () => {
    if (window.confirm('¿Seguro que deseas eliminar este turno permanentemente?')) {
      StorageService.deleteTurno(turno.id);
      onSaved();
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalles de la Reserva"
        subtitle={`Turno #${turno.id.substring(4)}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Main Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {cliente?.nombre} {cliente?.apellido}
                </span>
              </div>
              <span className="text-xs text-slate-500">{cliente?.telefono}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Servicio:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{servicio?.nombre}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Especialista:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{empleado?.nombre}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fecha & Hora:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(turno.fecha)} ({turno.horaInicio} - {turno.horaFin} hs)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Precio Total:</span>
                <span className="font-black text-blue-600 dark:text-blue-400">
                  {empresa?.moneda}{turno.precioTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {turno.observaciones && (
              <div className="text-xs p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
                <strong>Notas:</strong> {turno.observaciones}
              </div>
            )}
          </div>

          {/* Quick Actions Status Change */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Cambiar Estado del Turno
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'confirmado', label: 'Confirmado', color: 'bg-emerald-600' },
                { id: 'en_proceso', label: 'En Sillón', color: 'bg-indigo-600' },
                { id: 'completado', label: 'Completado', color: 'bg-blue-600' },
                { id: 'cancelado', label: 'Cancelado', color: 'bg-red-600' },
                { id: 'ausente', label: 'Ausente', color: 'bg-slate-600' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => handleEstadoChange(st.id as EstadoTurno)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold text-white transition-opacity ${st.color} ${
                    turno.estado === st.id ? 'ring-2 ring-offset-1 ring-slate-900 font-black' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status & Action */}
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                Estado de Cobro
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                {turno.cobrado ? '✓ Abonado e ingresado a caja' : 'Pendiente de pago'}
              </div>
            </div>

            {!turno.cobrado ? (
              <button
                onClick={() => setShowCobro(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" /> Cobrar Ahora
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                ✓ Cobrado
              </span>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleDelete}
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar Turno
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold dark:bg-slate-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {showCobro && (
        <CobroModal
          isOpen={showCobro}
          onClose={() => setShowCobro(false)}
          turno={turno}
          cliente={cliente}
          onSaved={() => {
            onSaved();
            onClose();
          }}
        />
      )}
    </>
  );
};
