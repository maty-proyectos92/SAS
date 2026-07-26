import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Turno, Cliente, Servicio, Empleado, EstadoTurno } from '../types';
import { Badge } from '../components/common/Badge';
import { TurnoFormModal } from '../components/turnos/TurnoFormModal';
import { TurnoDetailModal } from '../components/turnos/TurnoDetailModal';
import { CobroModal } from '../components/pagos/CobroModal';
import { formatDate } from '../utils/dateUtils';
import { exportToCSV, printPDFReport } from '../utils/exportUtils';
import { 
  Clock, Search, Plus, Filter, Download, FileSpreadsheet, Printer, DollarSign, CheckCircle2 
} from 'lucide-react';

export const TurnosPage: React.FC = () => {
  const { empresa } = useCompany();
  const { tienePermiso } = useAuth();
  const empresaId = empresa?.id || 'emp_01';

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTurnoDetail, setSelectedTurnoDetail] = useState<Turno | null>(null);
  const [selectedTurnoToPay, setSelectedTurnoToPay] = useState<Turno | null>(null);

  const loadData = () => {
    setTurnos(StorageService.getTurnos(empresaId));
    setClientes(StorageService.getClientes(empresaId));
    setServicios(StorageService.getServicios(empresaId));
    setEmpleados(StorageService.getEmpleados(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const filteredTurnos = turnos.filter(t => {
    const cli = clientes.find(c => c.id === t.clienteId);
    const srv = servicios.find(s => s.id === t.servicioId);
    const emp = empleados.find(e => e.id === t.empleadoId);

    const matchSearch = 
      (cli?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cli?.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (srv?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fecha.includes(searchTerm);

    const matchEstado = filtroEstado === 'todos' || t.estado === filtroEstado;

    return matchSearch && matchEstado;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Cliente', 'Servicio', 'Empleado', 'Fecha', 'Hora', 'Estado', 'Monto', 'Cobrado'];
    const rows = filteredTurnos.map(t => {
      const cli = clientes.find(c => c.id === t.clienteId);
      const srv = servicios.find(s => s.id === t.servicioId);
      const emp = empleados.find(e => e.id === t.empleadoId);

      return [
        t.id,
        `${cli?.nombre || ''} ${cli?.apellido || ''}`,
        srv?.nombre || '',
        emp?.nombre || '',
        t.fecha,
        `${t.horaInicio} - ${t.horaFin}`,
        t.estado,
        t.precioTotal,
        t.cobrado ? 'Sí' : 'No'
      ];
    });

    exportToCSV(`turnos_${empresa?.nombre}_${new Date().toISOString().substring(0, 10)}`, headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Cliente', 'Servicio', 'Empleado', 'Fecha/Hora', 'Estado', 'Monto'];
    const rows = filteredTurnos.map(t => {
      const cli = clientes.find(c => c.id === t.clienteId);
      const srv = servicios.find(s => s.id === t.servicioId);
      const emp = empleados.find(e => e.id === t.empleadoId);

      return [
        `${cli?.nombre || ''} ${cli?.apellido || ''}`,
        srv?.nombre || '',
        emp?.nombre || '',
        `${formatDate(t.fecha)} ${t.horaInicio}hs`,
        t.estado.toUpperCase(),
        `${empresa?.moneda}${t.precioTotal}`
      ];
    });

    printPDFReport(`Listado de Turnos — ${empresa?.nombre}`, `Total de registros: ${filteredTurnos.length}`, headers, rows);
  };

  const getStatusBadge = (estado: Turno['estado']) => {
    switch (estado) {
      case 'confirmado': return <Badge variant="green" dot>Confirmado</Badge>;
      case 'pendiente': return <Badge variant="amber" dot>Pendiente</Badge>;
      case 'en_proceso': return <Badge variant="blue" dot>En Proceso</Badge>;
      case 'completado': return <Badge variant="emerald" dot>Completado</Badge>;
      case 'cancelado': return <Badge variant="red" dot>Cancelado</Badge>;
      case 'ausente': return <Badge variant="gray" dot>Ausente</Badge>;
      default: return <Badge variant="gray">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Gestión General de Turnos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Histórico completo, filtros por estado, búsqueda rápida y exportación
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" /> PDF
          </button>

          {tienePermiso('turnos', 'crear') && (
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nuevo Turno
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, servicio, especialista o fecha..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmado">Confirmados</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
            <option value="ausente">Ausentes</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <th className="pb-3 pl-2">Fecha / Hora</th>
              <th className="pb-3">Cliente</th>
              <th className="pb-3">Servicio</th>
              <th className="pb-3">Especialista</th>
              <th className="pb-3">Estado</th>
              <th className="pb-3">Monto Total</th>
              <th className="pb-3 text-right pr-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
            {filteredTurnos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No se encontraron turnos con los criterios ingresados.
                </td>
              </tr>
            ) : (
              filteredTurnos.map(t => {
                const cli = clientes.find(c => c.id === t.clienteId);
                const srv = servicios.find(s => s.id === t.servicioId);
                const emp = empleados.find(e => e.id === t.empleadoId);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDate(t.fecha)}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {t.horaInicio} - {t.horaFin} hs
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {cli?.nombre} {cli?.apellido}
                      <span className="block text-[10px] text-slate-400">{cli?.telefono}</span>
                    </td>
                    <td className="py-3">{srv?.nombre || 'Servicio'}</td>
                    <td className="py-3">{emp?.nombre || 'Especialista'}</td>
                    <td className="py-3">{getStatusBadge(t.estado)}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {empresa?.moneda}{t.precioTotal.toLocaleString()}
                      <span className={`block text-[10px] font-semibold ${t.cobrado ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {t.cobrado ? '✓ Cobrado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2 whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setSelectedTurnoDetail(t)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                      >
                        Ver Detalle
                      </button>
                      {!t.cobrado && (
                        <button
                          onClick={() => setSelectedTurnoToPay(t)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                        >
                          Cobrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <TurnoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={loadData}
      />

      {selectedTurnoDetail && (
        <TurnoDetailModal
          isOpen={Boolean(selectedTurnoDetail)}
          onClose={() => setSelectedTurnoDetail(null)}
          turno={selectedTurnoDetail}
          onSaved={loadData}
        />
      )}

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
