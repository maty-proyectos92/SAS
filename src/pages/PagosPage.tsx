import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { CajaDiaria, Pago, Cliente } from '../types';
import { AperturaCierreCajaModal } from '../components/pagos/AperturaCierreCajaModal';
import { CobroModal } from '../components/pagos/CobroModal';
import { Badge } from '../components/common/Badge';
import { getTodayString, formatDateTime } from '../utils/dateUtils';
import { 
  CreditCard, DollarSign, Lock, Unlock, Plus, Minus, Receipt, Users, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export const PagosPage: React.FC = () => {
  const { empresa } = useCompany();
  const { tienePermiso } = useAuth();
  const empresaId = empresa?.id || 'emp_01';

  const [cajaHoy, setCajaHoy] = useState<CajaDiaria | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [isCajaModalOpen, setIsCajaModalOpen] = useState(false);
  const [modoCaja, setModoCaja] = useState<'apertura' | 'cierre' | 'movimiento'>('apertura');

  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
  const [selectedClienteToCobrar, setSelectedClienteToCobrar] = useState<Cliente | null>(null);

  const loadData = () => {
    const today = StorageService.getCajaHoy(empresaId);
    setCajaHoy(today || null);
    setPagos(StorageService.getPagos(empresaId));
    setClientes(StorageService.getClientes(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const clientesConDeuda = clientes.filter(c => c.deudaTotal > 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" /> Caja Diaria & Registro de Cobros
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Arqueo de caja, ingresos/egresos, pagos por tarjeta/efectivo/Mercado Pago y control de deuda
          </p>
        </div>

        {/* Cash Register Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {!cajaHoy || cajaHoy.estado === 'cerrada' ? (
            <button
              onClick={() => {
                setModoCaja('apertura');
                setIsCajaModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Unlock className="w-4 h-4" /> Abrir Caja Hoy
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setModoCaja('movimiento');
                  setIsCajaModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" /> Movimiento Caja
              </button>

              <button
                onClick={() => {
                  setModoCaja('cierre');
                  setIsCajaModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" /> Cerrar Caja & Arqueo
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cash Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Estado de Caja</span>
            {cajaHoy?.estado === 'abierta' ? (
              <Badge variant="emerald" dot>Abierta</Badge>
            ) : (
              <Badge variant="gray" dot>Cerrada</Badge>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {empresa?.moneda}{(cajaHoy?.saldoFinal || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Saldo Inicial: {empresa?.moneda}{(cajaHoy?.saldoInicial || 0).toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ingresos Totales Hoy</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            +{empresa?.moneda}{(cajaHoy?.totalIngresos || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Cobros acumulados
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Egresos / Gastos</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">
            -{empresa?.moneda}{(cajaHoy?.totalEgresos || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Insumos y gastos operativos
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Deuda Total Clientes</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {empresa?.moneda}{clientesConDeuda.reduce((a, b) => a + b.deudaTotal, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {clientesConDeuda.length} clientes con saldo pendiente
          </div>
        </div>
      </div>

      {/* Movements & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movements Log */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-500" /> Movimientos de Caja Diaria ({cajaHoy?.movimientos?.length || 0})
            </h3>
            <p className="text-xs text-slate-400">Auditoría detallada de operaciones en la jornada</p>
          </div>

          {!cajaHoy || cajaHoy.movimientos.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              No hay movimientos registrados en la caja de hoy.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cajaHoy.movimientos.map(m => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl font-black text-xs ${
                      m.tipo === 'ingreso' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'bg-red-50 text-red-700 dark:bg-red-950/40'
                    }`}>
                      {m.tipo === 'ingreso' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{m.concepto}</div>
                      <div className="text-[10px] text-slate-400">
                        {m.hora} hs • Método: <span className="uppercase font-semibold">{m.metodoPago}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`font-black text-sm ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {m.tipo === 'ingreso' ? '+' : '-'}{empresa?.moneda}{m.monto.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debtors List */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" /> Control de Deudores
            </h3>
            <p className="text-xs text-slate-400">Gestión y cobro de saldos impagos</p>
          </div>

          {clientesConDeuda.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              ¡Excelente! Ningún cliente registra deuda.
            </div>
          ) : (
            <div className="space-y-2">
              {clientesConDeuda.map(c => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{c.nombre} {c.apellido}</div>
                    <div className="text-[10px] text-red-600 font-bold mt-0.5">
                      Debe: {empresa?.moneda}{c.deudaTotal.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedClienteToCobrar(c);
                      setIsCobroModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] shadow-xs"
                  >
                    Cobrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AperturaCierreCajaModal
        isOpen={isCajaModalOpen}
        onClose={() => setIsCajaModalOpen(false)}
        cajaActual={cajaHoy}
        modo={modoCaja}
        onSaved={loadData}
      />

      {isCobroModalOpen && selectedClienteToCobrar && (
        <CobroModal
          isOpen={isCobroModalOpen}
          onClose={() => setIsCobroModalOpen(false)}
          cliente={selectedClienteToCobrar}
          montoSugerido={selectedClienteToCobrar.deudaTotal}
          onSaved={loadData}
        />
      )}
    </div>
  );
};
