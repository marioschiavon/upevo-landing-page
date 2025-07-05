import React, { createContext, useContext, useState, useEffect } from 'react';

interface Organization {
  id: number;
  nome: string;
  tipo_organizacao: string;
  descricao?: string;
  projectCount: number;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization) => void;
  setOrganizations: (orgs: Organization[]) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Mock data para demonstração
const mockOrganizations: Organization[] = [
  {
    id: 1,
    nome: "UpevoTech Solutions",
    tipo_organizacao: "Desenvolvimento",
    descricao: "Empresa focada em desenvolvimento de software",
    projectCount: 5
  },
  {
    id: 2,
    nome: "Creative Agency",
    tipo_organizacao: "Marketing",
    descricao: "Agência de marketing digital",
    projectCount: 3
  },
  {
    id: 3,
    nome: "Consultoria Business",
    tipo_organizacao: "Consultoria",
    descricao: "Consultoria empresarial",
    projectCount: 2
  }
];

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(mockOrganizations[0]);
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);

  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      organizations,
      setCurrentOrganization,
      setOrganizations
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};