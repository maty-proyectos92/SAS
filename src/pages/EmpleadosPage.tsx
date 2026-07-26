import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Empleado, Servicio } from '../types';
import { EmpleadoFormModal } from '../components/empleados/EmpleadoFormModal';
import { Badge } from '../components/common/Badge';
import { 
  UserCheck, Plus, Scissors, Clock, Calendar, Edit, Trash2, CheckCircle, XCircle 
} from 'lucide-react';

export const EmpleadosPage: React.FC = () => {
  const { empresa } = useCompany();
  const { tienePermiso } = useAuth();
  const empresaId = empresa?.id || 'emp_01';

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [empleadoToEdit, setEmpleadoToEdit] = useState<Empleado | null>(null);

  const loadData = () => {
    setEmpleados(StorageService.getEmpleados(empresaId));
    setServicios(StorageService.getServicios(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este empleado?')) {
      StorageService.deleteEmpleado(id);
      loadData();
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" /> Empleados & Horarios Laborales
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Especialidades, servicios habilitados, color de agenda y disponibilidad semanal
          </p>
        </div>

        {tienePermiso('empleados', 'crear') && (
          <button
            onClick={() => {
              setEmpleadoToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Nuevo Empleado
          </button>
        )}
      </div>

      {/* Employees Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empleados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs italic bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No hay empleados configurados en la empresa.
          </div>
        ) : (
          empleados.map(e => {
            const empServicios = servicios.filter(s => (e.serviciosAsignadosIds || []).includes(s.id));

            return (
              <div
                key={e.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Avatar & Name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-sm"
                        style={{ backgroundColor: e.colorAgenda || '#3b82f6' }}
                      >
                        {e.nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{e.nombre}</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{e.especialidad}</p>
                      </div>
                    </div>

                    <Badge variant={e.estado === 'activo' ? 'emerald' : 'gray'} dot>
                      {e.estado}
                    </Badge>
                  </div>

                  {/* Assigned Services */}
                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                      <Scissors className="w-3 h-3 text-blue-500" /> Servicios Asignados ({empServicios.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {empServicios.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {s.nombre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Hours preview */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-blue-500" /> Días Laborales
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {(e.horarios || []).filter(h => h.activo).map(h => (
                        <div key={h.dia} className="flex justify-between">
                          <span className="capitalize font-medium">{h.dia.substring(0, 3)}:</span>
                          <span className="font-bold">{h.apertura}-{h.cierre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
                  {tienePermiso('empleados', 'editar') && (
                    <button
                      onClick={() => {
                        setEmpleadoToEdit(e);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {tienePermiso('empleados', 'eliminar') && (
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      <EmpleadoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        empleadoToEdit={empleadoToEdit}
        onSaved={loadData}
      />
    </div>
  );
};
