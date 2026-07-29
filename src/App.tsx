import React, { useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { AgendaPage } from './pages/AgendaPage';
import { TurnosPage } from './pages/TurnosPage';
import { ClientesPage } from './pages/ClientesPage';
import { EmpleadosPage } from './pages/EmpleadosPage';
import { ServiciosPage } from './pages/ServiciosPage';
import { PagosPage } from './pages/PagosPage';
import { NotificacionesPage } from './pages/NotificacionesPage';
import { ReportesPage } from './pages/ReportesPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { LoginPage } from './pages/LoginPage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, tienePermiso } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CompanyProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/agenda" element={<AgendaPage />} />
                      <Route path="/turnos" element={<TurnosPage />} />
                      <Route path="/clientes" element={<ClientesPage />} />
                      <Route path="/empleados" element={<EmpleadosPage />} />
                      <Route path="/servicios" element={<ServiciosPage />} />
                      <Route path="/pagos" element={<PagosPage />} />
                      <Route path="/notificaciones" element={<NotificacionesPage />} />
                      <Route path="/reportes" element={<ReportesPage />} />
                      <Route path="/configuracion" element={<ConfiguracionPage />} />
                      <Route path="/superadmin" element={<SuperAdminPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}
