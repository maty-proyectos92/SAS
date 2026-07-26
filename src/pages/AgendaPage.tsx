import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService, subscribeToStorage } from '../services/storageService';
import { Turno, Empleado, Servicio, Cliente } from '../types';
import { TurnoFormModal } from '../components/turnos/TurnoFormModal';
import { TurnoDetailModal } from '../components/turnos/TurnoDetailModal';
import { 
  getTodayString, generateTimeSlots, getWeekDays, formatDate, addMinutesToTime, dayjs 
} from '../utils/dateUtils';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, User, Scissors, Clock, AlertTriangle 
} from 'lucide-react';

export const AgendaPage: React.FC = () => {
  const { empresa } = useCompany();
  const { tienePermiso } = useAuth();
  const empresaId = empresa?.id || 'emp_01';

  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [filtroEmpleadoId, setFiltroEmpleadoId] = useState<string>('todos');

  // Modal triggers
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [slotPreset, setSlotPreset] = useState<{ date: string; time: string; empId?: string } | null>(null);
  const [selectedTurnoDetail, setSelectedTurnoDetail] = useState<Turno | null>(null);

  const loadData = () => {
    setTurnos(StorageService.getTurnos(empresaId));
    setEmpleados(StorageService.getEmpleados(empresaId));
    setServicios(StorageService.getServicios(empresaId));
    setClientes(StorageService.getClientes(empresaId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return () => unsubscribe();
  }, [empresaId]);

  const filteredEmpleados = filtroEmpleadoId === 'todos' 
    ? empleados 
    : empleados.filter(e => e.id === filtroEmpleadoId);

  const timeSlots = generateTimeSlots('09:00', '19:00', 30);
  const weekDays = getWeekDays(selectedDate);

  const handlePrev = () => {
    if (vista === 'dia') {
      setSelectedDate(dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'));
    } else if (vista === 'semana') {
      setSelectedDate(dayjs(selectedDate).subtract(1, 'week').format('YYYY-MM-DD'));
    } else {
      setSelectedDate(dayjs(selectedDate).subtract(1, 'month').format('YYYY-MM-DD'));
    }
  };

  const handleNext = () => {
    if (vista === 'dia') {
      setSelectedDate(dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD'));
    } else if (vista === 'semana') {
      setSelectedDate(dayjs(selectedDate).add(1, 'week').format('YYYY-MM-DD'));
    } else {
      setSelectedDate(dayjs(selectedDate).add(1, 'month').format('YYYY-MM-DD'));
    }
  };

  const handleSlotClick = (dateStr: string, timeStr: string, empId?: string) => {
    if (!tienePermiso('agenda', 'crear')) return;
    setSlotPreset({ date: dateStr, time: timeStr, empId });
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" /> Agenda Interactiva Multi-Empleado
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Vista dinámica por día, semana o mes con prevención automática de doble reserva
          </p>
        </div>

        {/* Date Navigation & View Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Buttons */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
            <button
              onClick={() => setVista('dia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                vista === 'dia' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setVista('semana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                vista === 'semana' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setVista('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                vista === 'mes' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mes
            </button>
          </div>

          {/* Date Picker & Nav */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(getTodayString())}
              className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Hoy
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2">
              {formatDate(selectedDate, 'DD MMMM YYYY')}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Empleado */}
          <select
            value={filtroEmpleadoId}
            onChange={e => setFiltroEmpleadoId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="todos">👥 Todos los Especialistas</option>
            {empleados.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>

          {/* New Turno Button */}
          {tienePermiso('agenda', 'crear') && (
            <button
              onClick={() => {
                setSlotPreset(null);
                setIsFormModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Agendar
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        {/* WEEK VIEW */}
        {vista === 'semana' && (
          <div className="min-w-[800px]">
            {/* Header Days Row */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 pb-2 text-center text-xs font-bold">
              <div className="text-slate-400 py-2">Hora</div>
              {weekDays.map(day => (
                <div 
                  key={day.dateStr} 
                  className={`py-2 rounded-xl ${
                    day.isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="capitalize">{day.dayName}</div>
                  <div className="text-sm font-black">{day.dayNumber}</div>
                </div>
              ))}
            </div>

            {/* Time Slots Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-8 min-h-[52px]">
                  {/* Time label */}
                  <div className="text-[11px] font-semibold text-slate-400 py-2 text-center flex items-center justify-center border-r border-slate-100 dark:border-slate-800">
                    {time}
                  </div>

                  {/* Days cells */}
                  {weekDays.map(day => {
                    const dayTurnos = turnos.filter(t => {
                      if (t.fecha !== day.dateStr) return false;
                      if (filtroEmpleadoId !== 'todos' && t.empleadoId !== filtroEmpleadoId) return false;
                      return t.horaInicio === time;
                    });

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => dayTurnos.length === 0 && handleSlotClick(day.dateStr, time)}
                        className={`border-r border-slate-100 dark:border-slate-800/60 p-1 relative transition-colors cursor-pointer group ${
                          dayTurnos.length === 0 ? 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20' : ''
                        }`}
                      >
                        {dayTurnos.length === 0 ? (
                          <div className="opacity-0 group-hover:opacity-100 h-full flex items-center justify-center text-[10px] text-blue-500 font-bold">
                            + Agendar
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {dayTurnos.map(t => {
                              const cli = clientes.find(c => c.id === t.clienteId);
                              const srv = servicios.find(s => s.id === t.servicioId);
                              const emp = empleados.find(e => e.id === t.empleadoId);

                              return (
                                <div
                                  key={t.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTurnoDetail(t);
                                  }}
                                  className="p-1.5 rounded-xl text-white text-[11px] shadow-sm font-semibold truncate transition-transform hover:scale-[1.02] cursor-pointer"
                                  style={{ backgroundColor: emp?.colorAgenda || '#3b82f6' }}
                                >
                                  <div className="font-bold truncate">{cli?.nombre} {cli?.apellido}</div>
                                  <div className="text-[9px] opacity-90 truncate">{srv?.nombre}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DAY VIEW (Column per employee) */}
        {vista === 'dia' && (
          <div className="min-w-[700px]">
            <div className="grid border-b border-slate-200 dark:border-slate-800 pb-2 text-center text-xs font-bold"
                 style={{ gridTemplateColumns: `80px repeat(${filteredEmpleados.length}, minmax(0, 1fr))` }}>
              <div className="text-slate-400 py-2">Hora</div>
              {filteredEmpleados.map(emp => (
                <div key={emp.id} className="py-2 px-2 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emp.colorAgenda }} />
                  <span className="text-slate-900 dark:text-white font-bold">{emp.nombre}</span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {timeSlots.map(time => (
                <div key={time} className="grid min-h-[52px]" style={{ gridTemplateColumns: `80px repeat(${filteredEmpleados.length}, minmax(0, 1fr))` }}>
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center border-r border-slate-100 dark:border-slate-800">
                    {time}
                  </div>

                  {filteredEmpleados.map(emp => {
                    const empSlotTurnos = turnos.filter(t => 
                      t.fecha === selectedDate && t.empleadoId === emp.id && t.horaInicio === time
                    );

                    return (
                      <div
                        key={emp.id}
                        onClick={() => empSlotTurnos.length === 0 && handleSlotClick(selectedDate, time, emp.id)}
                        className={`border-r border-slate-100 dark:border-slate-800/60 p-1 transition-colors cursor-pointer group ${
                          empSlotTurnos.length === 0 ? 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20' : ''
                        }`}
                      >
                        {empSlotTurnos.length === 0 ? (
                          <div className="opacity-0 group-hover:opacity-100 h-full flex items-center justify-center text-[10px] text-blue-500 font-bold">
                            + Agendar
                          </div>
                        ) : (
                          empSlotTurnos.map(t => {
                            const cli = clientes.find(c => c.id === t.clienteId);
                            const srv = servicios.find(s => s.id === t.servicioId);

                            return (
                              <div
                                key={t.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTurnoDetail(t);
                                }}
                                className="p-2 rounded-xl text-white text-xs font-semibold shadow-sm cursor-pointer"
                                style={{ backgroundColor: emp.colorAgenda }}
                              >
                                <div className="font-bold leading-tight">{cli?.nombre} {cli?.apellido}</div>
                                <div className="text-[10px] opacity-90">{srv?.nombre} ({t.duracionMinutos}m)</div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {vista === 'mes' && (
          <div className="p-4 text-center">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-4">
              Vista mensual resumida ({formatDate(selectedDate, 'MMMM YYYY')})
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="font-bold text-xs text-slate-400 py-1">{d}</div>
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${selectedDate.substring(0, 8)}${String(dayNum).padStart(2, '0')}`;
                const count = turnos.filter(t => t.fecha === dStr).length;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDate(dStr);
                      setVista('dia');
                    }}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-all flex flex-col items-center justify-between min-h-[70px]"
                  >
                    <span className="text-xs font-black text-slate-800 dark:text-white">{dayNum}</span>
                    {count > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                        {count} turnos
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Libre</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <TurnoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialDate={slotPreset?.date}
        initialTime={slotPreset?.time}
        initialEmpleadoId={slotPreset?.empId}
        onSaved={loadData}
      />

      {/* Detail Modal */}
      {selectedTurnoDetail && (
        <TurnoDetailModal
          isOpen={Boolean(selectedTurnoDetail)}
          onClose={() => setSelectedTurnoDetail(null)}
          turno={selectedTurnoDetail}
          onSaved={loadData}
        />
      )}
    </div>
  );
};
