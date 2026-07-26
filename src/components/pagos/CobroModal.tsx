import React, { useState } from 'react';
import { Turno, Cliente, MetodoPago } from '../../types';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storageService';
import { useCompany } from '../../contexts/CompanyContext';
import { CreditCard, DollarSign, Check, Receipt } from 'lucide-react';

interface CobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  turno?: Turno | null;
  cliente?: Cliente | null;
  montoSugerido?: number;
  onSaved: () => void;
}

export const CobroModal: React.FC<CobroModalProps> = ({
  isOpen,
  onClose,
  turno,
  cliente,
  montoSugerido,
  onSaved
}) => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [monto, setMonto] = useState<number>(montoSugerido || turno?.precioTotal || 0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [observaciones, setObservaciones] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || monto <= 0) return;

    StorageService.savePago({
      id: `pago_${Date.now()}`,
      empresaId,
      clienteId: cliente?.id || turno?.clienteId || '',
      turnoId: turno?.id,
      monto,
      metodoPago,
      estado: 'completado',
      fecha: new Date().toISOString(),
      observaciones: observaciones || `Cobro efectuado para ${cliente?.nombre || 'Cliente'}`,
      registradoPor: 'Caja Operador'
    });

    onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Cobro & Recibo"
      subtitle="Ingrese el método de pago para registrar en la caja diaria"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">
            Total a Cobrar
          </div>
          <div className="text-2xl font-black text-blue-900 dark:text-white mt-1">
            {empresa?.moneda}{monto.toLocaleString()}
          </div>
          {turno && (
            <div className="text-xs text-blue-700 dark:text-blue-400 mt-1 flex items-center justify-center gap-1">
              <Receipt className="w-3.5 h-3.5" /> Turno del {turno.fecha} ({turno.horaInicio} hs)
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-blue-500" /> Monto Recibido ({empresa?.moneda})
          </label>
          <input
            type="number"
            min={1}
            value={monto}
            onChange={e => setMonto(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Método de Pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'efectivo', label: 'Efectivo 💵' },
              { id: 'tarjeta', label: 'Tarjeta 💳' },
              { id: 'transferencia', label: 'Transferencia 🏦' },
              { id: 'mercadopago', label: 'Mercado Pago 📱' }
            ].map(m => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMetodoPago(m.id as MetodoPago)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                  metodoPago === m.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Observaciones o N° Comprobante
          </label>
          <input
            type="text"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Ej. Operación #988234, Pago exacto"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>

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
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Confirmar y Emitir Cobro
          </button>
        </div>
      </form>
    </Modal>
  );
};
