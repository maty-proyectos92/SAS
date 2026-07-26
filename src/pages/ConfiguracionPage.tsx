import React, { useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { Empresa, RolUsuario, CampoPersonalizadoDef, TipoCampoPersonalizado, PermisosRolesMap } from '../types';
import { 
  Settings, Building2, Clock, Palette, Shield, Plus, Trash2, Check, FileText, Lock 
} from 'lucide-react';

export const ConfiguracionPage: React.FC = () => {
  const { empresa, updateEmpresaSettings } = useCompany();
  const { tienePermiso } = useAuth();

  const [nombre, setNombre] = useState(empresa?.nombre || '');
  const [rutCuit, setRutCuit] = useState(empresa?.rutCuit || '');
  const [rubro, setRubro] = useState(empresa?.rubro || '');
  const [colorPrimario, setColorPrimario] = useState(empresa?.colorPrimario || '#3b82f6');
  const [moneda, setMoneda] = useState(empresa?.moneda || '$');
  const [zonaHoraria, setZonaHoraria] = useState(empresa?.zonaHoraria || 'America/Argentina/Buenos_Aires');
  const [impuestosPorcentaje, setImpuestosPorcentaje] = useState(empresa?.impuestosPorcentaje || 21);
  const [duracionMinimaTurno, setDuracionMinimaTurno] = useState(empresa?.duracionMinimaTurno || 30);
  const [duracionMaximaTurno, setDuracionMaximaTurno] = useState(empresa?.duracionMaximaTurno || 120);

  // Custom fields
  const [camposPersonalizados, setCamposPersonalizados] = useState<CampoPersonalizadoDef[]>(
    empresa?.camposPersonalizadosCliente || []
  );
  const [newCampoNombre, setNewCampoNombre] = useState('');
  const [newCampoTipo, setNewCampoTipo] = useState<TipoCampoPersonalizado>('texto');
  const [newCampoRequerido, setNewCampoRequerido] = useState(false);

  // Roles permissions matrix
  const [permisosRoles, setPermisosRoles] = useState<Record<RolUsuario, PermisosRolesMap>>(
    empresa?.permisosRoles || ({} as any)
  );

  const [activeTab, setActiveTab] = useState<'general' | 'horarios' | 'campos' | 'permisos'>('general');
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  if (!empresa) return null;

  const handleAddCustomField = () => {
    if (!newCampoNombre.trim()) return;
    const newField: CampoPersonalizadoDef = {
      id: `cp_${Date.now()}`,
      nombre: newCampoNombre,
      tipo: newCampoTipo,
      requerido: newCampoRequerido
    };
    setCamposPersonalizados(prev => [...prev, newField]);
    setNewCampoNombre('');
  };

  const handleRemoveCustomField = (id: string) => {
    setCamposPersonalizados(prev => prev.filter(f => f.id !== id));
  };

  const handleTogglePermission = (rolKey: RolUsuario, moduloKey: keyof PermisosRolesMap, accion: 'ver' | 'crear' | 'editar' | 'eliminar') => {
    setPermisosRoles(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy[rolKey]) return prev;
      if (!copy[rolKey][moduloKey]) return prev;

      copy[rolKey][moduloKey][accion] = !copy[rolKey][moduloKey][accion];
      return copy;
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedEmpresa: Empresa = {
      ...empresa,
      nombre,
      rutCuit,
      rubro,
      colorPrimario,
      moneda,
      zonaHoraria,
      impuestosPorcentaje,
      duracionMinimaTurno,
      duracionMaximaTurno,
      camposPersonalizadosCliente: camposPersonalizados,
      permisosRoles
    };

    updateEmpresaSettings(updatedEmpresa);
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  };

  const rolesList: { id: RolUsuario; label: string }[] = [
    { id: 'dueno', label: 'Dueño / CEO' },
    { id: 'admin', label: 'Administrador' },
    { id: 'recepcionista', label: 'Recepcionista' },
    { id: 'empleado', label: 'Empleado' },
    { id: 'supervisor', label: 'Supervisor' }
  ];

  const modulosList: { id: keyof PermisosRolesMap; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'turnos', label: 'Turnos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'empleados', label: 'Empleados' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'pagos', label: 'Caja & Pagos' },
    { id: 'reportes', label: 'Reportes' },
    { id: 'configuracion', label: 'Configuración' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" /> Configuración de Empresa ({empresa.nombre})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalice marca, colores, horarios, campos dinámicos de cliente y permisos por rol
          </p>
        </div>

        {tienePermiso('configuracion', 'editar') && (
          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Check className="w-4 h-4" /> Guardar Configuración
          </button>
        )}
      </div>

      {savedSuccessAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>¡Configuración guardada y aplicada exitosamente!</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl">
        {[
          { id: 'general', label: 'General & Marca', icon: Building2 },
          { id: 'horarios', label: 'Duraciones', icon: Clock },
          { id: 'campos', label: 'Campos Personalizados', icon: FileText },
          { id: 'permisos', label: 'Matriz de Permisos', icon: Shield }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: General */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Identidad de Marca & Moneda</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Nombre Fantasía de la Empresa *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                RUT / CUIT / NIF
              </label>
              <input
                type="text"
                value={rutCuit}
                onChange={e => setRutCuit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Rubro / Industria
              </label>
              <input
                type="text"
                value={rubro}
                onChange={e => setRubro(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-blue-500" /> Color Primario de Marca
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorPrimario}
                  onChange={e => setColorPrimario(e.target.value)}
                  className="w-10 h-9 rounded-lg cursor-pointer border-0"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{colorPrimario}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Símbolo de Moneda Local
              </label>
              <input
                type="text"
                value={moneda}
                onChange={e => setMoneda(e.target.value)}
                placeholder="$, USD, EUR, MXN"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Zona Horaria
              </label>
              <select
                value={zonaHoraria}
                onChange={e => setZonaHoraria(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires (GMT-3)</option>
                <option value="America/Santiago">America/Santiago (GMT-3)</option>
                <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Durations */}
      {activeTab === 'horarios' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Parámetros de Duración de Turnos</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Duración Mínima de Turno (Minutos)
              </label>
              <input
                type="number"
                step={15}
                min={15}
                value={duracionMinimaTurno}
                onChange={e => setDuracionMinimaTurno(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Duración Máxima de Turno (Minutos)
              </label>
              <input
                type="number"
                step={30}
                min={30}
                value={duracionMaximaTurno}
                onChange={e => setDuracionMaximaTurno(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Custom Fields Builder */}
      {activeTab === 'campos' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Diseñador de Campos Personalizados de Cliente</h3>
          <p className="text-xs text-slate-400">Agregue campos específicos que sus recepcionistas deberán completar en la ficha del cliente.</p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Agregar Nuevo Campo</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newCampoNombre}
                onChange={e => setNewCampoNombre(e.target.value)}
                placeholder="Nombre (ej. Tipo de Cabello, N° Ficha)"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
              />
              <select
                value={newCampoTipo}
                onChange={e => setNewCampoTipo(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="texto">Texto Libre</option>
                <option value="numero">Número</option>
                <option value="fecha">Fecha</option>
                <option value="booleano">Sí / No</option>
              </select>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Agregar Campo
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {camposPersonalizados.map(cp => (
              <div key={cp.id} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{cp.nombre}</span>
                  <span className="ml-2 text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400">
                    ({cp.tipo})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(cp.id)}
                  className="p-1 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Roles & Permissions Matrix */}
      {activeTab === 'permisos' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Matriz de Permisos por Rol</h3>
          <p className="text-xs text-slate-400">Configure qué acciones puede realizar cada rol dentro de la empresa.</p>

          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3">Módulo</th>
                {rolesList.map(r => (
                  <th key={r.id} className="pb-3 text-center">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {modulosList.map(m => (
                <tr key={m.id}>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{m.label}</td>
                  {rolesList.map(r => {
                    const isChecked = permisosRoles[r.id]?.[m.id]?.ver ?? true;
                    return (
                      <td key={r.id} className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(r.id, m.id, 'ver')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
