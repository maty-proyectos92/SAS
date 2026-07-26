import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Servicio, CategoriaServicio } from '../types';
import { ServicioFormModal } from '../components/servicios/ServicioFormModal';
import { Modal } from '../components/common/Modal';
import { 
  Scissors, Plus, Clock, DollarSign, FolderPlus, Globe, Edit, Trash2, Check 
} from 'lucide-react';

export const ServiciosPage: React.FC = () => {
  const { empresa } = useCompany();
  const { tienePermiso } = useAuth();
  const empresaId = empresa?.id || 'emp_01';

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<CategoriaServicio[]>([]);

  const [isSrvModalOpen, setIsSrvModalOpen] = useState(false);
  const [servicioToEdit, setServicioToEdit] = useState<Servicio | null>(null);

  // New Category inline modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catNombre, setCatNombre] = useState('');
  const [catColor, setCatColor] = useState('#3b82f6');

  const loadData = () => {
    setServicios(StorageService.getServicios(empresaId));
    setCategorias(StorageService.getCategorias(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNombre.trim()) return;

    StorageService.saveCategoria({
      id: `cat_${Date.now()}`,
      empresaId,
      nombre: catNombre,
      color: catColor
    });

    setCatNombre('');
    setIsCatModalOpen(false);
    loadData();
  };

  const handleDeleteServicio = (id: string) => {
    if (window.confirm('¿Eliminar este servicio?')) {
      StorageService.deleteServicio(id);
      loadData();
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-blue-500" /> Servicios & Categorías
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Catálogo de prestaciones, precios, duración y disponibilidad para agenda online
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tienePermiso('servicios', 'crear') && (
            <>
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5 text-blue-500" /> Nueva Categoría
              </button>

              <button
                onClick={() => {
                  setServicioToEdit(null);
                  setIsSrvModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Nuevo Servicio
              </button>
            </>
          )}
        </div>
      </div>

      {/* Services grouped by Categories */}
      <div className="space-y-6">
        {categorias.map(cat => {
          const catServicios = servicios.filter(s => s.categoriaId === cat.id);

          return (
            <div key={cat.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <h2 className="text-base font-black text-slate-900 dark:text-white">{cat.nombre}</h2>
                <span className="text-xs font-semibold text-slate-400">({catServicios.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catServicios.length === 0 ? (
                  <div className="col-span-full py-6 px-4 text-slate-400 text-xs italic bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    No hay servicios registrados en esta categoría.
                  </div>
                ) : (
                  catServicios.map(s => (
                    <div
                      key={s.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: s.color || cat.color }} />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.nombre}</h3>
                          </div>
                          {s.disponibleOnline && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 text-[10px] font-bold flex items-center gap-1 border border-blue-200">
                              <Globe className="w-3 h-3" /> Online
                            </span>
                          )}
                        </div>

                        {s.descripcion && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                            {s.descripcion}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-blue-500" /> {s.duracionMinutos} min
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {empresa?.moneda}{s.precio.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
                        {tienePermiso('servicios', 'editar') && (
                          <button
                            onClick={() => {
                              setServicioToEdit(s);
                              setIsSrvModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {tienePermiso('servicios', 'eliminar') && (
                          <button
                            onClick={() => handleDeleteServicio(s.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Servicio Form Modal */}
      <ServicioFormModal
        isOpen={isSrvModalOpen}
        onClose={() => setIsSrvModalOpen(false)}
        servicioToEdit={servicioToEdit}
        onSaved={loadData}
      />

      {/* New Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Crear Nueva Categoría"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveCat} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              value={catNombre}
              onChange={e => setCatNombre(e.target.value)}
              placeholder="Ej. Tratamientos Faciales"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Color de Etiqueta
            </label>
            <input
              type="color"
              value={catColor}
              onChange={e => setCatColor(e.target.value)}
              className="w-full h-10 rounded-xl cursor-pointer border-0"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
