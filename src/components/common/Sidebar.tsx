import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  LayoutDashboard, Calendar, Clock, Users, UserCheck, 
  Scissors, CreditCard, Bell, BarChart3, Settings, Crown, X, CalendarCheck2, ChevronRight, Zap
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen = false, 
  onCloseMobile,
  isOpen = false,
  onClose
}) => {
  const { rol, tienePermiso } = useAuth();
  const { empresa } = useCompany();

  const handleClose = onCloseMobile || onClose || (() => {});
  const mobileOpen = isMobileOpen || isOpen;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: tienePermiso('dashboard', 'ver')
    },
    {
      to: '/agenda',
      label: 'Agenda',
      icon: Calendar,
      show: tienePermiso('agenda', 'ver')
    },
    {
      to: '/turnos',
      label: 'Turnos',
      icon: Clock,
      show: tienePermiso('turnos', 'ver')
    },
    {
      to: '/clientes',
      label: 'Clientes',
      icon: Users,
      show: tienePermiso('clientes', 'ver')
    },
    {
      to: '/empleados',
      label: 'Staff / Empleados',
      icon: UserCheck,
      show: tienePermiso('empleados', 'ver')
    },
    {
      to: '/servicios',
      label: 'Servicios',
      icon: Scissors,
      show: tienePermiso('servicios', 'ver')
    },
    {
      to: '/pagos',
      label: 'Caja & Cobros',
      icon: CreditCard,
      show: tienePermiso('pagos', 'ver')
    },
    {
      to: '/notificaciones',
      label: 'Notificaciones',
      icon: Bell,
      show: tienePermiso('notificaciones', 'ver')
    },
    {
      to: '/reportes',
      label: 'Reportes',
      icon: BarChart3,
      show: tienePermiso('reportes', 'ver')
    },
    {
      to: '/configuracion',
      label: 'Configuración',
      icon: Settings,
      show: tienePermiso('configuracion', 'ver')
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                ShiftHub <span className="text-blue-400 font-normal text-xs">SaaS</span>
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Active Badge */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div 
              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: empresa?.colorPrimario || '#3b82f6' }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{empresa?.nombre || 'Mi Empresa'}</div>
              <div className="text-[10px] text-slate-400 truncate font-medium">{empresa?.rubro || 'Workspace'}</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {navItems.filter(item => item.show).map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) handleClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}

          {/* SuperAdmin Master Panel Link */}
          {(rol === 'superadmin' || rol === 'dueno') && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Panel Global SaaS
              </div>
              <NavLink
                to="/superadmin"
                onClick={() => {
                  if (window.innerWidth < 1024) handleClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                      : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                  }`
                }
              >
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm font-semibold">Master Admin</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Plan Upgrade Bento Card Footer */}
        <div className="p-4">
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Plan Premium
              </p>
            </div>
            <p className="text-slate-300 text-xs mb-3">Gestión de sucursales e integraciones activas.</p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer">
              Actualizar Plan
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

