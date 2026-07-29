import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { Scissors, ShieldCheck, Sparkles, Loader2, KeyRound, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithRole, loginWithEmail } = useAuth();
  const { switchCompany } = useCompany();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await loginWithEmail(email, password);
      if (!success) {
        setErrorMsg('Credenciales inválidas o perfil de usuario no encontrado.');
      }
    } catch (err: any) {
      console.error('Error logging in:', err);
      const code = err?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('El formato del correo electrónico no es válido.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Demasiados intentos fallidos. Por favor intenta más tarde.');
      } else {
        setErrorMsg(err?.message || 'Error al iniciar sesión. Verifica tus datos de acceso.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAndSubmit = async (demoEmail: string, demoCompanyId?: string, demoRole?: any) => {
    setEmail(demoEmail);
    setPassword('123456');
    setErrorMsg('');
    if (demoCompanyId) switchCompany(demoCompanyId);

    setIsSubmitting(true);
    try {
      const success = await loginWithEmail(demoEmail, '123456');
      if (!success && demoRole) {
        // Fallback para entono local si el usuario aún no existe en Auth
        loginWithRole(demoRole);
      }
    } catch (err) {
      // Fallback para entono local
      if (demoRole) loginWithRole(demoRole);
    } finally {
      setIsSubmitting(false);
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
          <p className="text-xs text-slate-400">Plataforma SaaS con Autenticación & Aislamiento Tenant Seguro</p>
        </div>

        {/* Form Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="usuario@empresa.com"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>

          {/* DEMO FAST ROLES BAR */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Acceso Rápido Demo / Pruebas
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => fillDemoAndSubmit('marcos@apexbarber.com', 'emp_01', 'dueno')}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-left flex items-center justify-between text-slate-200 transition-colors"
              >
                <div>
                  <div>👑 Dueño / CEO (Marcos)</div>
                  <div className="text-[10px] font-normal text-slate-400">marcos@apexbarber.com</div>
                </div>
                <span className="text-blue-400 font-mono text-[10px]">Apex Barber</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => fillDemoAndSubmit('lucia@apexbarber.com', 'emp_01', 'recepcionista')}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-left flex items-center justify-between text-slate-200 transition-colors"
              >
                <div>
                  <div>📋 Recepcionista (Lucía)</div>
                  <div className="text-[10px] font-normal text-slate-400">lucia@apexbarber.com</div>
                </div>
                <span className="text-blue-400 font-mono text-[10px]">Apex Barber</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => fillDemoAndSubmit('admin@turnosaas.com', 'emp_01', 'superadmin')}
                className="p-2.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800 text-xs font-bold text-left flex items-center justify-between text-purple-200 transition-colors"
              >
                <div>
                  <div>🛡️ SaaS Master SuperAdmin</div>
                  <div className="text-[10px] font-normal text-purple-300">admin@turnosaas.com</div>
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
