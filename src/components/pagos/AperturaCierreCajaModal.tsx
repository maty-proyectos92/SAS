import React, { useState } from 'react';
import { CajaDiaria } from '../../types';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storageService';
import { useCompany } from '../../contexts/CompanyContext';
import { getTodayString } from '../../utils/dateUtils';
import { Lock, Unlock, DollarSign, Check } from 'lucide-react';

interface AperturaCierreCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cajaActual?: CajaDiaria | null;
  modo: 'apertura' | 'cierre' | 'movimiento';
  onSaved: () => void;
}

export const AperturaCierreCajaModal: React.FC<AperturaCierreCajaModalProps> = ({
  isOpen,
  onClose,
  cajaActual,
  modo,
  onSaved
}) => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [saldoInicial, setSaldoInicial] = useState<number>(15000);
  const [tipoMov, setTipoMov] = useState<'ingreso' | 'egreso'>('egreso');
  const [montoMov, setMontoMov] = useState<number>(1000);
  const [conceptoMov, setConceptoMov] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = getTodayString();

    if (modo === 'apertura') {
      const nuevaCaja: CajaDiaria = {
        id: `caja_${Date.now()}`,
        empresaId,
        fecha: todayStr,
        saldoInicial,
        totalIngresos: 0,
        totalEgresos: 0,
        saldoFinal: saldoInicial,
        estado: 'abierta',
        movimientos: [],
        abiertaPor: 'Operador Caja'
      };
      StorageService.saveCaja(nuevaCaja);
    } else if (modo === 'cierre' && cajaActual) {
      const cajaCerrada: CajaDiaria = {
        ...cajaActual,
        estado: 'cerrada',
        cerradaPor: 'Operador Caja'
      };
      StorageService.saveCaja(cajaCerrada);
    } else if (modo === 'movimiento' && cajaActual) {
      const nuevoMov = {
        id: `mov_${Date.now()}`,
        tipo: tipoMov,
        monto: montoMov,
        concepto: conceptoMov || (tipoMov === 'ingreso' ? 'Ingreso vario' : 'Gasto operativo'),
        metodoPago: 'efectivo' as const,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        registradoPor: 'Operador Caja'
      };

      const movs = [...cajaActual.movimientos, nuevoMov];
      const totalIng = movs.filter(m => m.tipo === 'ingreso').reduce((a, b) => a + b.monto, 0);
      const totalEgr = movs.filter(m => m.tipo === 'egreso').reduce((a, b) => a + b.monto, 0);

      const updatedCaja: CajaDiaria = {
        ...cajaActual,
        movimientos: movs,
        totalIngresos: totalIng,
        totalEgresos: totalEgr,
        saldoFinal: (cajaActual.saldoInicial + totalIng) - totalEgr
      };
      StorageService.saveCaja(updatedCaja);
    }

    onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        modo === 'apertura' ? 'Apertura de Caja Diaria' :
        modo === 'cierre' ? 'Cierre & Arqueo de Caja' : 'Registrar Ingreso / Egreso'
      }
      subtitle="Control de flujo de fondos y saldo en caja"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {modo === 'apertura' && (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5 text-emerald-500" /> Saldo Inicial de Apertura ({empresa?.moneda})
            </label>
            <input
              type="number"
              min={0}
              value={saldoInicial}
              onChange={e => setSaldoInicial(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
            />
          </div>
        )}

        {modo === 'cierre' && cajaActual && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-red-500" /> Arqueo de Caja Hoy
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900">
                <span className="text-slate-500">Saldo Inicial:</span>
                <div className="font-bold">{empresa?.moneda}{cajaActual.saldoInicial.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900">
                <span className="text-slate-500">Ingresos Totales:</span>
                <div className="font-bold text-emerald-600">+{empresa?.moneda}{cajaActual.totalIngresos.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900">
                <span className="text-slate-500">Egresos Totales:</span>
                <div className="font-bold text-red-600">-{empresa?.moneda}{cajaActual.totalEgresos.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-800 dark:text-emerald-300 font-bold">Saldo Final Esperado:</span>
                <div className="font-black text-sm text-emerald-900 dark:text-white">
                  {empresa?.moneda}{cajaActual.saldoFinal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {modo === 'movimiento' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoMov('ingreso')}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  tipoMov === 'ingreso' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                + Ingreso Vario
              </button>
              <button
                type="button"
                onClick={() => setTipoMov('egreso')}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  tipoMov === 'egreso' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                - Egreso / Gasto
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" /> Monto ({empresa?.moneda})
              </label>
              <input
                type="number"
                min={1}
                value={montoMov}
                onChange={e => setMontoMov(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Concepto / Motivo
              </label>
              <input
                type="text"
                value={conceptoMov}
                onChange={e => setConceptoMov(e.target.value)}
                placeholder="Ej. Compra de cafe, Insumos de toalla, Cobro adicional"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </>
        )}

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
            {modo === 'apertura' ? 'Abrir Caja' : modo === 'cierre' ? 'Confirmar Cierre' : 'Guardar Movimiento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
