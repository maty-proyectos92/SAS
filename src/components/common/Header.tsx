import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { RolUsuario } from '../../types';
import { 
  Building2, Sun, Moon, Bell, Shield, User, ChevronDown, Check, LogOut
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenMobileSidebar }) => {
  const { usuario, rol, cambiarRolSimulado, logout } = useAuth();
  const { empresa, empresas, setActiveEmpresaId } = useCompany();
  const { theme, toggleTheme } = useTheme();

  const handleToggle = onOpenMobileSidebar || onToggleSidebar || (() => {});

  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const rolesDisponibles: { id: RolUsuario; label: string }[] = [
    { id: 'dueno', label: 'Dueño / CEO' },
    { id: 'admin', label: 'Administrador' },
    { id: 'recepcionista', label: 'Recepcionista' },
    { id: 'empleado', label: 'Empleado / Especialista' },
    { id: 'supervisor', label: 'Supervisor' },
    { id: 'superadmin', label: 'SuperAdmin SaaS' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Tenant Pill Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          title="Menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Company Status Pill Selector */}
        <div className="relative">
          <div
            onClick={() => {
              setShowCompanyDropdown(!showCompanyDropdown);
              setShowRoleDropdown(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700/60"
          >
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs animate-pulse"
              style={{ backgroundColor: empresa?.colorPrimario || '#10b981' }}
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px] sm:max-w-xs">
              {empresa?.nombre || 'Seleccionar Empresa'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Company List Dropdown */}
          {showCompanyDropdown && (
            <div className="absolute left-0 mt-2 w-72 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Empresas del Sistema
              </div>
              <div className="max-h-64 overflow-y-auto px-2 space-y-1">
                {empresas.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      setActiveEmpresaId(emp.id);
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-2xl flex items-center justify-between text-xs text-left transition-all ${
                      emp.id === empresa?.id 
                        ? 'bg-blue-50 dark:bg-blue-950/40 font-bold text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: emp.colorPrimario }}
                      >
                        {emp.nombre.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">{emp.nombre}</div>
                        <div className="text-[10px] text-slate-400 truncate">{emp.rubro}</div>
                      </div>
                    </div>
                    {emp.id === empresa?.id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Simulator Role Selector Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowCompanyDropdown(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
            title="Simular rol de usuario"
          >
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span className="capitalize">{rol}</span>
            <ChevronDown className="w-3 h-3 text-blue-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50">
              <div className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Simulador de Rol
              </div>
              <div className="px-2 space-y-0.5">
                {rolesDisponibles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      cambiarRolSimulado(r.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs text-left flex items-center justify-between transition-colors ${
                      rol === r.id 
                        ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    {rol === r.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative cursor-pointer p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></div>
          <Bell className="w-5 h-5" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowCompanyDropdown(false);
              setShowRoleDropdown(false);
            }}
            className="flex items-center gap-3 cursor-pointer text-left"
          >
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {usuario?.nombre || 'Ricardo Mendoza'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tight font-semibold">
                {rol}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200 shadow-xs">
              {usuario?.nombre ? usuario.nombre.charAt(0) : 'R'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50">
              <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white">{usuario?.nombre || 'Usuario'}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{usuario?.email}</div>
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 capitalize mt-1">
                  Rol: {rol}
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
