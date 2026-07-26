import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Notificacion, Turno, Cliente } from '../types';
import { Badge } from '../components/common/Badge';
import { formatDateTime } from '../utils/dateUtils';
import { 
  Bell, MessageSquare, Mail, Smartphone, Send, CheckCircle2, Clock, Sparkles 
} from 'lucide-react';

export const NotificacionesPage: React.FC = () => {
  const { empresa } = useCompany();
  const empresaId = empresa?.id || 'emp_01';

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [selectedTipo, setSelectedTipo] = useState<'whatsapp' | 'email' | 'sms' | 'push'>('whatsapp');
  const [plantillaWA, setPlantillaWA] = useState(
    'Hola {cliente}! Te recordamos tu turno reservado en {empresa} para el día {fecha} a las {hora} hs. ¡Te esperamos!'
  );
  const [testNumber, setTestNumber] = useState('+5491155443322');
  const [sentMessageAlert, setSentMessageAlert] = useState('');

  const loadData = () => {
    setNotificaciones(StorageService.getNotificaciones(empresaId));
    setTurnos(StorageService.getTurnos(empresaId));
    setClientes(StorageService.getClientes(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const handleSendReminderTest = (e: React.FormEvent) => {
    e.preventDefault();

    const msgFormatted = plantillaWA
      .replace('{cliente}', 'Gabriel Sosa')
      .replace('{empresa}', empresa?.nombre || 'Mi Empresa')
      .replace('{fecha}', 'Hoy')
      .replace('{hora}', '16:00');

    const newNotif: Notificacion = {
      id: `not_${Date.now()}`,
      empresaId,
      tipo: selectedTipo,
      destinatario: testNumber,
      mensaje: msgFormatted,
      estado: 'enviado',
      fechaEnvio: new Date().toISOString(),
      clienteNombre: 'Gabriel Sosa (Prueba)'
    };

    StorageService.saveNotificacion(newNotif);
    setSentMessageAlert(`Recordatorio de prueba enviado exitosamente a ${testNumber}`);
    setTimeout(() => setSentMessageAlert(''), 4000);
    loadData();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" /> Plantillas & Recordatorios Automáticos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuración de notificaciones por WhatsApp, Email, SMS y Push para reducir ausentismos (No Show)
          </p>
        </div>
      </div>

      {/* Simulator and Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Config Editor */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Editor de Plantilla
            </h3>
            <p className="text-xs text-slate-400">Personalice el mensaje automático para clientes</p>
          </div>

          {sentMessageAlert && (
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sentMessageAlert}</span>
            </div>
          )}

          <div className="flex gap-2">
            {[
              { id: 'whatsapp', label: 'WhatsApp 📱' },
              { id: 'email', label: 'Email ✉️' },
              { id: 'sms', label: 'SMS 💬' },
              { id: 'push', label: 'Push 🔔' }
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => setSelectedTipo(ch.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedTipo === ch.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Contenido del Mensaje
            </label>
            <textarea
              rows={4}
              value={plantillaWA}
              onChange={e => setPlantillaWA(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
            <div className="text-[10px] text-slate-400 mt-1">
              Variables dinámicas disponibles: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600">{'{cliente}'}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600">{'{empresa}'}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600">{'{fecha}'}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600">{'{hora}'}</code>
            </div>
          </div>

          <form onSubmit={handleSendReminderTest} className="pt-2 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testNumber}
                onChange={e => setTestNumber(e.target.value)}
                placeholder="Teléfono o Email de prueba..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Probar Envió
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Screen */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              Simulador Visual de Mensaje Recibido
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-emerald-400">✓ {empresa?.nombre} (Oficial)</span>
                <span>Ahora</span>
              </div>
              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {plantillaWA
                  .replace('{cliente}', 'Gabriel Sosa')
                  .replace('{empresa}', empresa?.nombre || 'Mi Empresa')
                  .replace('{fecha}', '26/07/2026')
                  .replace('{hora}', '16:30')}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-300">
            💡 <strong>Configuración automática:</strong> Los recordatorios se despachan automáticamente 2 horas y 24 horas antes de cada turno.
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" /> Historial de Envíos
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {notificaciones.length === 0 ? (
            <div className="py-6 text-center text-slate-400 italic">No hay historial de notificaciones.</div>
          ) : (
            notificaciones.map(n => (
              <div key={n.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {n.clienteNombre || 'Cliente'} ({n.destinatario})
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">{n.mensaje}</div>
                </div>
                <div className="text-right">
                  <Badge variant="green" dot>{n.estado}</Badge>
                  <div className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.fechaEnvio)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
