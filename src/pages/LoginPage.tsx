import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { StorageService } from '../services/storageService';
import { Scissors, Lock, UserCheck, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithRole, loginWithEmail } = useAuth();
  const { switchCompany, empresas } = useCompany();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor ingresa un correo electrónico.');
      return;
    }
    const success = loginWithEmail(email, password);
    if (!success) {
      setErrorMsg('Credenciales inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">TurnoSaaS Multi-Empresa</h1>
          <p className="text-xs text-slate-400">Plataforma SaaS de Gestión de Agenda, Clientes & Caja</p>
        </div>

        {/* Form Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* DEMO FAST ROLES BAR */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Acceso Rápido Demo (Roles RBAC)
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchCompany('emp_01');
                  loginWithRole('dueno');
                }}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-left flex items-center justify-between text-slate-200 transition-colors"
              >
                <div>
                  <div>👑 Dueño / CEO (Gastón)</div>
                  <div className="text-[10px] font-normal text-slate-400">Acceso total a métricas, caja y configuración</div>
                </div>
                <span className="text-blue-400 font-mono text-[10px]">Peluquería Luxe</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchCompany('emp_01');
                  loginWithRole('recepcionista');
                }}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-left flex items-center justify-between text-slate-200 transition-colors"
              >
                <div>
                  <div>📋 Recepcionista (Ana)</div>
                  <div className="text-[10px] font-normal text-slate-400">Gestión rápida de agenda y caja rápida</div>
                </div>
                <span className="text-blue-400 font-mono text-[10px]">Peluquería Luxe</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchCompany('emp_01');
                  loginWithRole('empleado');
                }}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-left flex items-center justify-between text-slate-200 transition-colors"
              >
                <div>
                  <div>✂️ Especialista (Carlos)</div>
                  <div className="text-[10px] font-normal text-slate-400">Ver únicamente sus turnos agendados</div>
                </div>
                <span className="text-blue-400 font-mono text-[10px]">Peluquería Luxe</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchCompany('emp_02');
                  loginWithRole('dueno');
                }}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-left flex items-center justify-between text-slate-200 transition-colors"
              >
                <div>
                  <div>🏢 Propietaria Tenant 2 (Valeria)</div>
                  <div className="text-[10px] font-normal text-slate-400">Probar aislamiento multi-tenant</div>
                </div>
                <span className="text-purple-400 font-mono text-[10px]">Spa & Estética Serene</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginWithRole('superadmin');
                }}
                className="p-2.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800 text-xs font-bold text-left flex items-center justify-between text-purple-200 transition-colors"
              >
                <div>
                  <div>🛡️ SaaS Master SuperAdmin</div>
                  <div className="text-[10px] font-normal text-purple-300">Crear nuevas empresas y gestionar tenants</div>
                </div>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
