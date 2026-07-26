import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Turno, Cliente, Servicio, Empleado, Pago } from '../types';
import { formatDate } from '../utils/dateUtils';
import { exportToCSV, printPDFReport } from '../utils/exportUtils';
import { 
  BarChart3, FileSpreadsheet, Printer, Calendar, Users, Scissors, DollarSign, Filter 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

export const ReportesPage: React.FC = () => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  const [filtroEmpleado, setFiltroEmpleado] = useState('todos');
  const [filtroServicio, setFiltroServicio] = useState('todos');

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

  const turnosFiltrados = turnos.filter(t => {
    if (filtroEmpleado !== 'todos' && t.empleadoId !== filtroEmpleado) return false;
    if (filtroServicio !== 'todos' && t.servicioId !== filtroServicio) return false;
    return true;
  });

  const totalFacturado = turnosFiltrados
    .filter(t => t.estado === 'completado' || t.cobrado)
    .reduce((a, b) => a + b.precioTotal, 0);

  // Group performance by employee
  const empPerformance = empleados.map(e => {
    const eTurnos = turnosFiltrados.filter(t => t.empleadoId === e.id);
    const eFact = eTurnos.filter(t => t.cobrado || t.estado === 'completado').reduce((a, b) => a + b.precioTotal, 0);
    return {
      nombre: e.nombre,
      turnos: eTurnos.length,
      facturacion: eFact
    };
  });

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Cliente', 'Servicio', 'Empleado', 'Estado', 'Monto'];
    const rows = turnosFiltrados.map(t => {
      const c = clientes.find(cli => cli.id === t.clienteId);
      const s = servicios.find(srv => srv.id === t.servicioId);
      const e = empleados.find(emp => emp.id === t.empleadoId);

      return [
        t.fecha,
        `${c?.nombre || ''} ${c?.apellido || ''}`,
        s?.nombre || '',
        e?.nombre || '',
        t.estado,
        t.precioTotal
      ];
    });

    exportToCSV(`reporte_${empresa?.nombre}`, headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Fecha', 'Cliente', 'Servicio', 'Especialista', 'Monto'];
    const rows = turnosFiltrados.map(t => {
      const c = clientes.find(cli => cli.id === t.clienteId);
      const s = servicios.find(srv => srv.id === t.servicioId);
      const e = empleados.find(emp => emp.id === t.empleadoId);

      return [
        formatDate(t.fecha),
        `${c?.nombre || ''} ${c?.apellido || ''}`,
        s?.nombre || '',
        e?.nombre || '',
        `${empresa?.moneda}${t.precioTotal}`
      ];
    });

    printPDFReport(
      `Reporte de Gestión y Facturación — ${empresa?.nombre}`,
      `Total Facturado: ${empresa?.moneda}${totalFacturado.toLocaleString()} (${turnosFiltrados.length} turnos)`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Reportes & Analítica de Negocio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generador de informes por profesional, servicio, producción y facturación
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Exportar CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir Reporte PDF
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filtrar por:</span>
        </div>

        <select
          value={filtroEmpleado}
          onChange={e => setFiltroEmpleado(e.target.value)}
          className="w-full sm:w-52 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
        >
          <option value="todos">👥 Todos los Especialistas</option>
          {empleados.map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>

        <select
          value={filtroServicio}
          onChange={e => setFiltroServicio(e.target.value)}
          className="w-full sm:w-52 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
        >
          <option value="todos">✂️ Todos los Servicios</option>
          {servicios.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Total Turnos Evaluados</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{turnosFiltrados.length}</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Facturación Generada</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {empresa?.moneda}{totalFacturado.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Promedio por Turno</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {empresa?.moneda}{turnosFiltrados.length ? Math.round(totalFacturado / turnosFiltrados.length).toLocaleString() : 0}
          </div>
        </div>
      </div>

      {/* Employee Production Chart */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Rendimiento y Facturación por Especialista
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={empPerformance}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: any) => [`${empresa?.moneda}${val.toLocaleString()}`, 'Facturación']} />
              <Bar dataKey="facturacion" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
