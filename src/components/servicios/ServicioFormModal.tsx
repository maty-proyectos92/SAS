import React, { useState, useEffect } from 'react';
import { Servicio, CategoriaServicio } from '../../types';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storageService';
import { useCompany } from '../../contexts/CompanyContext';
import { Scissors, Palette, Clock, DollarSign, Check } from 'lucide-react';

interface ServicioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicioToEdit?: Servicio | null;
  onSaved: () => void;
}

export const ServicioFormModal: React.FC<ServicioFormModalProps> = ({
  isOpen,
  onClose,
  servicioToEdit,
  onSaved
}) => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState(30);
  const [precio, setPrecio] = useState(10000);
  const [color, setColor] = useState('#3b82f6');
  const [disponibleOnline, setDisponibleOnline] = useState(true);
  const [descripcion, setDescripcion] = useState('');

  const [categorias, setCategorias] = useState<CategoriaServicio[]>([]);

  useEffect(() => {
    if (isOpen) {
      const cats = StorageService.getCategorias(empresaId);
      setCategorias(cats);

      if (servicioToEdit) {
        setNombre(servicioToEdit.nombre);
        setCategoriaId(servicioToEdit.categoriaId);
        setDuracionMinutos(servicioToEdit.duracionMinutos);
        setPrecio(servicioToEdit.precio);
        setColor(servicioToEdit.color || '#3b82f6');
        setDisponibleOnline(servicioToEdit.disponibleOnline);
        setDescripcion(servicioToEdit.descripcion || '');
      } else {
        setNombre('');
        setCategoriaId(cats[0]?.id || '');
        setDuracionMinutos(30);
        setPrecio(10000);
        setColor('#3b82f6');
        setDisponibleOnline(true);
        setDescripcion('');
      }
    }
  }, [isOpen, servicioToEdit, empresaId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const srvSaved: Servicio = {
      id: servicioToEdit ? servicioToEdit.id : `srv_${Date.now()}`,
      empresaId,
      categoriaId,
      nombre,
      duracionMinutos,
      precio,
      color,
      empleadosHabilitadosIds: servicioToEdit ? servicioToEdit.empleadosHabilitadosIds : [],
      disponibleOnline,
      descripcion
    };

    StorageService.saveServicio(srvSaved);
    onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={servicioToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
      subtitle="Nombre, categoría, precio, duración y canal de agendamiento"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-blue-500" /> Nombre del Servicio *
          </label>
          <input
            type="text"
            required
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Corte Executive & Peinado"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Categoría
            </label>
            <select
              value={categoriaId}
              onChange={e => setCategoriaId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-blue-500" /> Color de Identificación
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-9 rounded-lg cursor-pointer border-0"
              />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{color}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Duración (Minutos)
            </label>
            <input
              type="number"
              step={15}
              min={15}
              max={300}
              value={duracionMinutos}
              onChange={e => setDuracionMinutos(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-500" /> Precio ({empresa?.moneda})
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={precio}
              onChange={e => setPrecio(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={disponibleOnline}
              onChange={e => setDisponibleOnline(e.target.checked)}
              className="w-4 h-4 rounded-md text-blue-600"
            />
            Habilitado para reserva online por el cliente
          </label>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Descripción o Incluye
          </label>
          <textarea
            rows={2}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Detalles sobre lo que abarca el servicio..."
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
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Guardar Servicio
          </button>
        </div>
      </form>
    </Modal>
  );
};
