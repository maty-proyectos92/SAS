import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Cliente, Turno } from '../types';
import { ClienteFormModal } from '../components/clientes/ClienteFormModal';
import { CobroModal } from '../components/pagos/CobroModal';
import { formatDate } from '../utils/dateUtils';
import { 
  Users, Search, Plus, Phone, Mail, MapPin, FileText, DollarSign, Clock, Edit, Trash2 
} from 'lucide-react';

export const ClientesPage: React.FC = () => {
  const { empresa } = useCompany();
  const { tienePermiso } = useAuth();
  const empresaId = empresa?.id || 'emp_01';

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [clienteToPayDebt, setClienteToPayDebt] = useState<Cliente | null>(null);

  const loadData = () => {
    setClientes(StorageService.getClientes(empresaId));
    setTurnos(StorageService.getTurnos(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm) ||
    c.dni.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
      StorageService.deleteCliente(id);
      loadData();
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Fichas de Clientes & Histórico
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Información personal, campos personalizados del negocio y control de deuda
          </p>
        </div>

        {tienePermiso('clientes', 'crear') && (
          <button
            onClick={() => {
              setClienteToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, apellido, DNI o teléfono..."
          className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs italic bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No se encontraron clientes registrados.
          </div>
        ) : (
          filteredClientes.map(c => {
            const cliTurnos = turnos.filter(t => t.clienteId === c.id);

            return (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
              >
                <div>
                  {/* Top Name & Debt Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {c.nombre} {c.apellido}
                      </h3>
                      <p className="text-[11px] text-slate-400">Cliente desde {formatDate(c.fechaCreacion)}</p>
                    </div>

                    {c.deudaTotal > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 text-xs font-black">
                        Deuda: {empresa?.moneda}{c.deudaTotal.toLocaleString()}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold">
                        Al día
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{c.telefono}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.direccion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{c.direccion}</span>
                      </div>
                    )}
                  </div>

                  {/* Custom Fields values */}
                  {c.camposPersonalizados && Object.keys(c.camposPersonalizados).length > 0 && (
                    <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">
                        Campos Personalizados
                      </div>
                      {Object.entries(c.camposPersonalizados).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-400">{k}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Turnos History Summary */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {cliTurnos.length} turnos agendados
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {c.deudaTotal > 0 && (
                    <button
                      onClick={() => setClienteToPayDebt(c)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Cobrar Deuda
                    </button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {tienePermiso('clientes', 'editar') && (
                      <button
                        onClick={() => {
                          setClienteToEdit(c);
                          setIsFormModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {tienePermiso('clientes', 'eliminar') && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      <ClienteFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        clienteToEdit={clienteToEdit}
        onSaved={loadData}
      />

      {clienteToPayDebt && (
        <CobroModal
          isOpen={Boolean(clienteToPayDebt)}
          onClose={() => setClienteToPayDebt(null)}
          cliente={clienteToPayDebt}
          montoSugerido={clienteToPayDebt.deudaTotal}
          onSaved={loadData}
        />
      )}
    </div>
  );
};
