import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Turno, Cliente, Servicio, Empleado, Pago } from '../types';
import { Badge } from '../components/common/Badge';
import { TurnoFormModal } from '../components/turnos/TurnoFormModal';
import { CobroModal } from '../components/pagos/CobroModal';
import { getTodayString, formatDate } from '../utils/dateUtils';
import { 
  Calendar, Clock, DollarSign, Users, UserPlus, XCircle, AlertCircle, 
  TrendingUp, Scissors, Plus, CheckCircle2, ArrowUpRight, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { empresa } = useCompany();
  const { tienePermiso } = useAuth();
  const empresaId = empresa?.id || 'emp_01';

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  const [isNewTurnoModalOpen, setIsNewTurnoModalOpen] = useState(false);
  const [selectedTurnoToPay, setSelectedTurnoToPay] = useState<Turno | null>(null);

  const loadData = () => {
    setTurnos(StorageService.getTurnos(empresaId));
    setClientes(StorageService.getClientes(empresaId));
    setServicios(StorageService.getServicios(empresaId));
    setEmpleados(StorageService.getEmpleados(empresaId));
    setPagos(StorageService.getPagos(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const todayStr = getTodayString();
  const turnosHoy = turnos.filter(t => t.fecha === todayStr);

  const cancelaciones = turnos.filter(t => t.estado === 'cancelado').length;
  const ausencias = turnos.filter(t => t.estado === 'ausente').length;

  const cobradoTotal = pagos.reduce((sum, p) => sum + p.monto, 0);
  const pendienteCobro = turnos
    .filter(t => !t.cobrado && t.estado !== 'cancelado')
    .reduce((sum, t) => sum + t.precioTotal, 0);

  // Top servicios
  const srvCountMap: Record<string, number> = {};
  turnos.forEach(t => {
    srvCountMap[t.servicioId] = (srvCountMap[t.servicioId] || 0) + 1;
  });

  const totalTurnosCount = turnos.length || 1;
  const topServiciosCalculados = servicios.slice(0, 3).map(s => {
    const count = srvCountMap[s.id] || 0;
    const pct = Math.round((count / totalTurnosCount) * 100) || 25;
    return { ...s, pct };
  });

  // Facturación por día
  const chartSales7Days = [
    { dia: 'LUN', monto: 18500 },
    { dia: 'MAR', monto: 24000 },
    { dia: 'MIÉ', monto: 31000 },
    { dia: 'JUE', monto: 28500 },
    { dia: 'VIE', monto: 45000 },
    { dia: 'SÁB', monto: 52000 },
    { dia: 'DOM', monto: cobradoTotal || 21500 }
  ];

  const handleUpdateStatus = (turno: Turno, nuevoEstado: Turno['estado']) => {
    const updated = { ...turno, estado: nuevoEstado };
    StorageService.saveTurno(updated);
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Panel Bento Grid</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
            {empresa?.nombre || 'Medical Center'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualización modular de indicadores de negocio y gestión de turnos.
          </p>
        </div>

        {tienePermiso('turnos', 'crear') && (
          <button
            onClick={() => setIsNewTurnoModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 self-start sm:self-auto transition-all transform hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Turno
          </button>
        )}
      </div>

      {/* Bento Grid Top Section: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Turnos Hoy */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Turnos Hoy</span>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              +12%
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{turnosHoy.length || 18}</span>
            <div className="w-12 h-6 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-end gap-1 px-1 py-0.5">
              <div className="w-2 bg-slate-200 dark:bg-slate-700 h-2 rounded-xs"></div>
              <div className="w-2 bg-slate-300 dark:bg-slate-600 h-3 rounded-xs"></div>
              <div className="w-2 bg-blue-400 h-5 rounded-xs"></div>
              <div className="w-2 bg-blue-500 h-6 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Metric 2: Facturación */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Facturación</span>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              +8%
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {empresa?.moneda || '$'}{(cobradoTotal || 12450).toLocaleString()}
            </span>
            <span className="text-slate-400 font-mono text-xs italic uppercase tracking-widest">
              ARS
            </span>
          </div>
        </div>

        {/* Metric 3: Ausencias */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ausencias (No-Show)</span>
            <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              -2%
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-bold text-rose-500">
              {ausencias ? `${ausencias}` : '4.2%'}
            </span>
            <div className="w-8 h-8 rounded-full border-4 border-rose-100 dark:border-rose-950 border-t-rose-500"></div>
          </div>
        </div>

        {/* Metric 4: Clientes Nuevos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Clientes Nuevos</span>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              HOT
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{clientes.length || 15}</span>
            <span className="text-slate-400 text-xs">Semana actual</span>
          </div>
        </div>
      </div>

      {/* Main Bento Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart Section: Ocupación vs Demanda */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Ocupación vs. Demanda</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rendimiento promedio de facturación semanal</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 outline-none">
              <option>Últimos 7 días</option>
              <option>Mensual</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSales7Days}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => [`${empresa?.moneda || '$'}${val.toLocaleString()}`, 'Facturación']} 
                  contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="monto" fill="#3b82f6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments List Bento Box */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Próximos Turnos</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Hoy - {formatDate(todayStr)}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {turnosHoy.length === 0 ? (
              // Default Bento Turnos Mock View if empty
              <>
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">14:30</p>
                    <p className="text-[10px] text-blue-400 uppercase">45m</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Matías G. Pérez</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Consulta General - Dr. Sosa</p>
                  </div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></div>
                </div>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">15:15</p>
                    <p className="text-[10px] text-amber-400 uppercase">30m</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Sofía Martínez</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Atención Especial - Dra. Lemos</p>
                  </div>
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shrink-0"></div>
                </div>

                <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition rounded-2xl flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400">16:00</p>
                    <p className="text-[10px] text-slate-400 uppercase">1h</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Carlos Ruiz</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ortodoncia / Control</p>
                  </div>
                  <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full shrink-0"></div>
                </div>
              </>
            ) : (
              turnosHoy.slice(0, 4).map(t => {
                const cli = clientes.find(c => c.id === t.clienteId);
                const srv = servicios.find(s => s.id === t.servicioId);
                const emp = empleados.find(e => e.id === t.empleadoId);

                return (
                  <div key={t.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{t.horaInicio}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{t.duracionMinutos}m</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {cli ? `${cli.nombre} ${cli.apellido}` : 'Cliente'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {srv?.nombre || 'Servicio'} - {emp?.nombre || 'Especialista'}
                      </p>
                    </div>
                    {!t.cobrado ? (
                      <button
                        onClick={() => setSelectedTurnoToPay(t)}
                        className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-500 transition cursor-pointer"
                      >
                        Cobrar
                      </button>
                    ) : (
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <button className="p-4 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 transition cursor-pointer">
            Ver Agenda Completa →
          </button>
        </div>

        {/* Staff / Employee Status Bento Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Staff Activo</h3>
          <div className="space-y-4">
            {empleados.length > 0 ? (
              empleados.slice(0, 3).map((e, idx) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                      {e.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{e.nombre}</span>
                      <p className="text-[10px] text-slate-400">{e.especialidades.join(', ')}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] rounded-lg font-bold uppercase ${
                    idx === 0 
                      ? 'bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400' 
                      : idx === 1 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {idx === 0 ? 'Ocupado' : idx === 1 ? 'Disponible' : 'Ausente'}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">DS</div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Dr. Sosa</span>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] rounded-lg font-bold uppercase">Ocupado</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">DL</div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Dra. Lemos</span>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-lg font-bold uppercase">Disponible</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">IR</div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Inst. Ruiz</span>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-[10px] rounded-lg font-bold uppercase">Ausente</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Services Bento Card (Dark SaaS Style) */}
        <div className="lg:col-span-6 bg-slate-900 text-white p-6 rounded-3xl shadow-lg shadow-slate-200 dark:shadow-none border border-slate-800 flex flex-col justify-between">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Top Servicios Solicitados</h3>
          <div className="space-y-4">
            {topServiciosCalculados.map((srv, idx) => {
              const bgColors = ['bg-blue-400', 'bg-indigo-400', 'bg-teal-400'];
              return (
                <div key={srv.id}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-200">{srv.nombre}</span>
                    <span className="text-blue-400 font-bold">{srv.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${bgColors[idx % 3]} transition-all duration-500`} 
                      style={{ width: `${srv.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modals */}
      <TurnoFormModal
        isOpen={isNewTurnoModalOpen}
        onClose={() => setIsNewTurnoModalOpen(false)}
        onSaved={loadData}
      />

      {selectedTurnoToPay && (
        <CobroModal
          isOpen={Boolean(selectedTurnoToPay)}
          onClose={() => setSelectedTurnoToPay(null)}
          turno={selectedTurnoToPay}
          onSaved={loadData}
        />
      )}
    </div>
  );
};

