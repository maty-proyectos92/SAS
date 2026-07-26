import React, { createContext, useContext, useState, useEffect } from 'react';
import { Empresa } from '../types';
import { StorageService, subscribeToStorage } from '../services/storageService';

interface CompanyContextType {
  empresa: Empresa | null;
  empresas: Empresa[];
  activeEmpresaId: string;
  setActiveEmpresaId: (id: string) => void;
  switchCompany: (id: string) => void;
  updateEmpresaSettings: (empresa: Empresa) => void;
  refreshEmpresas: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>(() => StorageService.getEmpresas());
  const [activeEmpresaId, setActiveEmpresaIdState] = useState<string>(() => {
    const saved = localStorage.getItem('saas_turnos_active_empresa_id');
    return saved || (empresas[0]?.id || 'emp_01');
  });

  const [empresa, setEmpresa] = useState<Empresa | null>(() => {
    return StorageService.getEmpresaById(activeEmpresaId) || empresas[0] || null;
  });

  const refreshEmpresas = () => {
    const list = StorageService.getEmpresas();
    setEmpresas(list);
    const curr = list.find(e => e.id === activeEmpresaId) || list[0] || null;
    setEmpresa(curr);
  };

  useEffect(() => {
    const unsubscribe = subscribeToStorage(refreshEmpresas);
    return () => unsubscribe();
  }, [activeEmpresaId]);

  const setActiveEmpresaId = (id: string) => {
    localStorage.setItem('saas_turnos_active_empresa_id', id);
    setActiveEmpresaIdState(id);
    const found = StorageService.getEmpresaById(id);
    if (found) setEmpresa(found);
  };

  const updateEmpresaSettings = (updated: Empresa) => {
    StorageService.saveEmpresa(updated);
    refreshEmpresas();
  };

  return (
    <CompanyContext.Provider
      value={{
        empresa,
        empresas,
        activeEmpresaId,
        setActiveEmpresaId,
        switchCompany: setActiveEmpresaId,
        updateEmpresaSettings,
        refreshEmpresas
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within CompanyProvider');
  return context;
};
