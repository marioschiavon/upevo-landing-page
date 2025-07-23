import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Organization {
  id: string;
  name: string;
  category: string;
  description?: string;
  projectCount: number;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization) => void;
  setOrganizations: (orgs: Organization[]) => void;
  refreshOrganizations: () => Promise<void>;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrganizations = async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get organizations where user is owner or member
      const { data: orgData, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          description,
          category,
          projects!inner(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organizations:', error);
        return;
      }

      const transformedOrgs = orgData?.map(org => ({
        id: org.id,
        name: org.name,
        category: org.category || 'Não definido',
        description: org.description,
        projectCount: org.projects?.length || 0
      })) || [];

      setOrganizations(transformedOrgs);
      
      // Set current organization to first one if none selected
      if (transformedOrgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(transformedOrgs[0]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      organizations,
      setCurrentOrganization,
      setOrganizations,
      refreshOrganizations,
      loading
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