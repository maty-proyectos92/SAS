import React, { useState, useEffect } from 'react';
import { Empleado, Servicio, HorarioAtencion } from '../../types';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storageService';
import { useCompany } from '../../contexts/CompanyContext';
import { User, Scissors, Palette, Clock, Check } from 'lucide-react';

interface EmpleadoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoToEdit?: Empleado | null;
  onSaved: () => void;
}

export const EmpleadoFormModal: React.FC<EmpleadoFormModalProps> = ({
  isOpen,
  onClose,
  empleadoToEdit,
  onSaved
}) => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [colorAgenda, setColorAgenda] = useState('#3b82f6');
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo');
  const [serviciosAsignadosIds, setServiciosAsignadosIds] = useState<string[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const defaultHorarios: HorarioAtencion[] = [
    { dia: 'lunes', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'martes', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'miercoles', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'jueves', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'viernes', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'sabado', activo: true, apertura: '09:00', cierre: '18:00' },
    { dia: 'domingo', activo: false, apertura: '10:00', cierre: '14:00' }
  ];

  const [horarios, setHorarios] = useState<HorarioAtencion[]>(defaultHorarios);

  useEffect(() => {
    if (isOpen) {
      const srvs = StorageService.getServicios(empresaId);
      setServicios(srvs);

      if (empleadoToEdit) {
        setNombre(empleadoToEdit.nombre);
        setEspecialidad(empleadoToEdit.especialidad);
        setColorAgenda(empleadoToEdit.colorAgenda || '#3b82f6');
        setEstado(empleadoToEdit.estado);
        setServiciosAsignadosIds(empleadoToEdit.serviciosAsignadosIds || []);
        setHorarios(empleadoToEdit.horarios?.length ? empleadoToEdit.horarios : defaultHorarios);
      } else {
        setNombre('');
        setEspecialidad('');
        setColorAgenda('#3b82f6');
        setEstado('activo');
        setServiciosAsignadosIds(srvs.map(s => s.id));
        setHorarios(defaultHorarios);
      }
    }
  }, [isOpen, empleadoToEdit, empresaId]);

  const toggleServicio = (srvId: string) => {
    setServiciosAsignadosIds(prev => 
      prev.includes(srvId) ? prev.filter(id => id !== srvId) : [...prev, srvId]
    );
  };

  const handleHorarioChange = (idx: number, field: keyof HorarioAtencion, value: any) => {
    const updated = [...horarios];
    updated[idx] = { ...updated[idx], [field]: value };
    setHorarios(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const empSaved: Empleado = {
      id: empleadoToEdit ? empleadoToEdit.id : `emp_${Date.now()}`,
      empresaId,
      nombre,
      especialidad,
      colorAgenda,
      estado,
      serviciosAsignadosIds,
      horarios
    };

    StorageService.saveEmpleado(empSaved);
    onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={empleadoToEdit ? 'Editar Empleado / Especialista' : 'Nuevo Empleado'}
      subtitle="Especialidad, servicios habilitados, color de agenda y horarios"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" /> Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Franco Silva"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Especialidad / Cargo
            </label>
            <input
              type="text"
              value={especialidad}
              onChange={e => setEspecialidad(e.target.value)}
              placeholder="Ej. Hair Stylist & Barber"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-blue-500" /> Color Distintivo en Agenda
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorAgenda}
                onChange={e => setColorAgenda(e.target.value)}
                className="w-10 h-9 rounded-lg cursor-pointer border-0"
              />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{colorAgenda}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Estado
            </label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo / Licencia</option>
            </select>
          </div>
        </div>

        {/* Services Assignment */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-blue-500" /> Servicios Habilitados
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {servicios.map(srv => {
              const isChecked = serviciosAsignadosIds.includes(srv.id);
              return (
                <label
                  key={srv.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                    isChecked ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 font-semibold text-blue-900 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span>{srv.nombre} ({srv.duracionMinutos} min)</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleServicio(srv.id)}
                    className="w-4 h-4 rounded-md text-blue-600"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Weekly Schedule Settings */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" /> Horario Laboral Semanal
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            {horarios.map((h, idx) => (
              <div key={h.dia} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 w-28 capitalize font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={h.activo}
                    onChange={e => handleHorarioChange(idx, 'activo', e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm text-blue-600"
                  />
                  {h.dia}
                </label>
                {h.activo ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={h.apertura}
                      onChange={e => handleHorarioChange(idx, 'apertura', e.target.value)}
                      className="px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px]"
                    />
                    <span className="text-slate-400 text-[10px]">a</span>
                    <input
                      type="time"
                      value={h.cierre}
                      onChange={e => handleHorarioChange(idx, 'cierre', e.target.value)}
                      className="px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px]"
                    />
                  </div>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 italic">No Laboral</span>
                )}
              </div>
            ))}
          </div>
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
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Guardar Empleado
          </button>
        </div>
      </form>
    </Modal>
  );
};
