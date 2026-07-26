import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Empresa } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Building2, Plus, ShieldCheck, Power, Trash2, ArrowRight, Activity, Users, Globe 
} from 'lucide-react';

export const SuperAdminPage: React.FC = () => {
  const { switchCompany } = useCompany();
  const { user } = useAuth();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isNewEmpresaModalOpen, setIsNewEmpresaModalOpen] = useState(false);

  // New Empresa Form State
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [rubro, setRubro] = useState('Peluquería / Barbería');
  const [color, setColor] = useState('#3b82f6');
  const [moneda, setMoneda] = useState('$');

  const loadData = () => {
    setEmpresas(StorageService.getEmpresas());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, []);

  const handleCreateEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const newEmpresaId = `emp_${Date.now()}`;
    const newEmpresa: Empresa = {
      id: newEmpresaId,
      nombre,
      slug: slug || nombre.toLowerCase().replace(/\s+/g, '-'),
      rutCuit: '20-12345678-9',
      rubro,
      colorPrimario: color,
      moneda,
      zonaHoraria: 'America/Argentina/Buenos_Aires',
      impuestosPorcentaje: 21,
      duracionMinimaTurno: 30,
      duracionMaximaTurno: 120,
      diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
      horarios: [
        { dia: 'lunes', activo: true, apertura: '09:00', cierre: '19:00' },
        { dia: 'martes', activo: true, apertura: '09:00', cierre: '19:00' },
        { dia: 'miercoles', activo: true, apertura: '09:00', cierre: '19:00' },
        { dia: 'jueves', activo: true, apertura: '09:00', cierre: '19:00' },
        { dia: 'viernes', activo: true, apertura: '09:00', cierre: '19:00' },
        { dia: 'sabado', activo: true, apertura: '09:00', cierre: '17:00' }
      ],
      estadosCustomTurno: [],
      estado: 'activa',
      createdAt: new Date().toISOString(),
      camposPersonalizadosCliente: [],
      permisosRoles: {
        dueno: { dashboard: { ver: true, crear: true, editar: true, eliminar: true }, agenda: { ver: true, crear: true, editar: true, eliminar: true }, turnos: { ver: true, crear: true, editar: true, eliminar: true }, clientes: { ver: true, crear: true, editar: true, eliminar: true }, empleados: { ver: true, crear: true, editar: true, eliminar: true }, servicios: { ver: true, crear: true, editar: true, eliminar: true }, pagos: { ver: true, crear: true, editar: true, eliminar: true }, notificaciones: { ver: true, crear: true, editar: true, eliminar: true }, reportes: { ver: true, crear: true, editar: true, eliminar: true }, configuracion: { ver: true, crear: true, editar: true, eliminar: true } },
        admin: { dashboard: { ver: true, crear: true, editar: true, eliminar: true }, agenda: { ver: true, crear: true, editar: true, eliminar: true }, turnos: { ver: true, crear: true, editar: true, eliminar: true }, clientes: { ver: true, crear: true, editar: true, eliminar: true }, empleados: { ver: true, crear: true, editar: true, eliminar: true }, servicios: { ver: true, crear: true, editar: true, eliminar: true }, pagos: { ver: true, crear: true, editar: true, eliminar: true }, notificaciones: { ver: true, crear: true, editar: true, eliminar: true }, reportes: { ver: true, crear: true, editar: true, eliminar: true }, configuracion: { ver: true, crear: true, editar: true, eliminar: true } },
        recepcionista: { dashboard: { ver: true, crear: false, editar: false, eliminar: false }, agenda: { ver: true, crear: true, editar: true, eliminar: false }, turnos: { ver: true, crear: true, editar: true, eliminar: false }, clientes: { ver: true, crear: true, editar: true, eliminar: false }, empleados: { ver: true, crear: false, editar: false, eliminar: false }, servicios: { ver: true, crear: false, editar: false, eliminar: false }, pagos: { ver: true, crear: true, editar: true, eliminar: false }, notificaciones: { ver: true, crear: true, editar: true, eliminar: false }, reportes: { ver: false, crear: false, editar: false, eliminar: false }, configuracion: { ver: false, crear: false, editar: false, eliminar: false } },
        empleado: { dashboard: { ver: true, crear: false, editar: false, eliminar: false }, agenda: { ver: true, crear: true, editar: false, eliminar: false }, turnos: { ver: true, crear: false, editar: false, eliminar: false }, clientes: { ver: true, crear: false, editar: false, eliminar: false }, empleados: { ver: false, crear: false, editar: false, eliminar: false }, servicios: { ver: true, crear: false, editar: false, eliminar: false }, pagos: { ver: false, crear: false, editar: false, eliminar: false }, notificaciones: { ver: false, crear: false, editar: false, eliminar: false }, reportes: { ver: false, crear: false, editar: false, eliminar: false }, configuracion: { ver: false, crear: false, editar: false, eliminar: false } },
        supervisor: { dashboard: { ver: true, crear: true, editar: true, eliminar: false }, agenda: { ver: true, crear: true, editar: true, eliminar: false }, turnos: { ver: true, crear: true, editar: true, eliminar: false }, clientes: { ver: true, crear: true, editar: true, eliminar: false }, empleados: { ver: true, crear: false, editar: false, eliminar: false }, servicios: { ver: true, crear: false, editar: false, eliminar: false }, pagos: { ver: true, crear: true, editar: false, eliminar: false }, notificaciones: { ver: true, crear: true, editar: false, eliminar: false }, reportes: { ver: true, crear: false, editar: false, eliminar: false }, configuracion: { ver: false, crear: false, editar: false, eliminar: false } },
        superadmin: { dashboard: { ver: true, crear: true, editar: true, eliminar: true }, agenda: { ver: true, crear: true, editar: true, eliminar: true }, turnos: { ver: true, crear: true, editar: true, eliminar: true }, clientes: { ver: true, crear: true, editar: true, eliminar: true }, empleados: { ver: true, crear: true, editar: true, eliminar: true }, servicios: { ver: true, crear: true, editar: true, eliminar: true }, pagos: { ver: true, crear: true, editar: true, eliminar: true }, notificaciones: { ver: true, crear: true, editar: true, eliminar: true }, reportes: { ver: true, crear: true, editar: true, eliminar: true }, configuracion: { ver: true, crear: true, editar: true, eliminar: true } }
      }
    };

    StorageService.saveEmpresa(newEmpresa);
    setIsNewEmpresaModalOpen(false);
    setNombre('');
    loadData();
  };

  const handleToggleEstado = (empresaItem: Empresa) => {
    const nuevoEstado = empresaItem.estado === 'activa' ? 'suspendida' : 'activa';
    StorageService.saveEmpresa({ ...empresaItem, estado: nuevoEstado });
    loadData();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Panel Administrador SaaS Master
          </div>
          <h1 className="text-2xl font-black mt-1 tracking-tight">Gestión Multiempresa & Tenants</h1>
          <p className="text-xs text-slate-300 mt-1">
            Plataforma central para alta de empresas, suspensión de cuentas y supervisión global
          </p>
        </div>

        <button
          onClick={() => setIsNewEmpresaModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar Nueva Empresa
        </button>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Total Empresas Registradas</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{empresas.length}</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Empresas Activas</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {empresas.filter(e => e.estado === 'activa').length}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Aislamiento Multitenant</div>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2">
            100% Aislado mediante empresaId en Firestore
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-500" /> Directorio de Empresas (Tenants)
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {empresas.map(e => (
            <div key={e.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{ backgroundColor: e.colorPrimario || '#3b82f6' }}
                >
                  {e.nombre.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    {e.nombre}
                    <Badge variant={e.estado === 'activa' ? 'emerald' : 'red'}>
                      {e.estado}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Rubro: <span className="font-semibold text-slate-700 dark:text-slate-300">{e.rubro}</span> • ID: <code className="text-blue-500">{e.id}</code>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => switchCompany(e.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 flex items-center gap-1"
                >
                  Inspeccionar <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggleEstado(e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 ${
                    e.estado === 'activa' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {e.estado === 'activa' ? 'Suspender' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Empresa Modal */}
      <Modal
        isOpen={isNewEmpresaModalOpen}
        onClose={() => setIsNewEmpresaModalOpen(false)}
        title="Dar de Alta Nueva Empresa (SaaS Tenant)"
        maxWidth="md"
      >
        <form onSubmit={handleCreateEmpresa} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Barbería Capital, Spa Relax"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Rubro o Tipo de Negocio
            </label>
            <input
              type="text"
              value={rubro}
              onChange={e => setRubro(e.target.value)}
              placeholder="Ej. Estética, Consultorio Médico, Canchas de Pádel"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Color Primario
              </label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-10 rounded-xl cursor-pointer border-0"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Símbolo Moneda
              </label>
              <input
                type="text"
                value={moneda}
                onChange={e => setMoneda(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsNewEmpresaModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md"
            >
              Crear Empresa Tenant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
