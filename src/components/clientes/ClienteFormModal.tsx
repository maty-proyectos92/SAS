import React, { useState, useEffect } from 'react';
import { Cliente } from '../../types';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storageService';
import { useCompany } from '../../contexts/CompanyContext';
import { getTodayString } from '../../utils/dateUtils';
import { User, Phone, Mail, MapPin, FileText, Check } from 'lucide-react';

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit?: Cliente | null;
  onSaved: () => void;
}

export const ClienteFormModal: React.FC<ClienteFormModalProps> = ({
  isOpen,
  onClose,
  clienteToEdit,
  onSaved
}) => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [camposPersonalizados, setCamposPersonalizados] = useState<Record<string, any>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (clienteToEdit) {
        setNombre(clienteToEdit.nombre);
        setApellido(clienteToEdit.apellido);
        setDni(clienteToEdit.dni);
        setEmail(clienteToEdit.email);
        setTelefono(clienteToEdit.telefono);
        setDireccion(clienteToEdit.direccion || '');
        setObservaciones(clienteToEdit.observaciones || '');
        setCamposPersonalizados(clienteToEdit.camposPersonalizados || {});
      } else {
        setNombre('');
        setApellido('');
        setDni('');
        setEmail('');
        setTelefono('');
        setDireccion('');
        setObservaciones('');
        setCamposPersonalizados({});
      }
      setError('');
    }
  }, [isOpen, clienteToEdit]);

  const handleCustomFieldChange = (nombreCampo: string, val: any) => {
    setCamposPersonalizados(prev => ({ ...prev, [nombreCampo]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      setError('Por favor ingresa nombre y teléfono.');
      return;
    }

    const clienteSaved: Cliente = {
      id: clienteToEdit ? clienteToEdit.id : `cli_${Date.now()}`,
      empresaId,
      nombre,
      apellido,
      dni,
      email,
      telefono,
      direccion,
      observaciones,
      camposPersonalizados,
      deudaTotal: clienteToEdit ? clienteToEdit.deudaTotal : 0,
      fechaCreacion: clienteToEdit ? clienteToEdit.fechaCreacion : getTodayString()
    };

    StorageService.saveCliente(clienteSaved);
    onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
      subtitle="Complete la ficha personal y campos configurados por el negocio"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" /> Nombre *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Gabriel"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" /> Apellido
            </label>
            <input
              type="text"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              placeholder="Ej. Sosa"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              DNI / CUID
            </label>
            <input
              type="text"
              value={dni}
              onChange={e => setDni(e.target.value)}
              placeholder="Ej. 38192834"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-500" /> Teléfono / WA *
            </label>
            <input
              type="text"
              required
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Ej. +5491155443322"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-500" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ejemplo@email.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" /> Dirección
          </label>
          <input
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            placeholder="Ej. Av. Corrientes 1234, CABA"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>

        {/* Dynamic Custom Fields Configured by Company */}
        {empresa?.camposPersonalizadosCliente && empresa.camposPersonalizadosCliente.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-500" /> Campos Personalizados de {empresa.nombre}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {empresa.camposPersonalizadosCliente.map(cp => (
                <div key={cp.id}>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    {cp.nombre} {cp.requerido && '*'}
                  </label>
                  {cp.tipo === 'seleccion' && cp.opciones ? (
                    <select
                      value={camposPersonalizados[cp.nombre] || ''}
                      onChange={e => handleCustomFieldChange(cp.nombre, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="">-- Seleccionar --</option>
                      {cp.opciones.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={cp.tipo === 'numero' ? 'number' : cp.tipo === 'fecha' ? 'date' : 'text'}
                      value={camposPersonalizados[cp.nombre] || ''}
                      onChange={e => handleCustomFieldChange(cp.nombre, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Observaciones Internas
          </label>
          <textarea
            rows={2}
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Preferencias del cliente, tratamientos anteriores, notas de atención..."
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
            Guardar Cliente
          </button>
        </div>
      </form>
    </Modal>
  );
};
