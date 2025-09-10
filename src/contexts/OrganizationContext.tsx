import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { isDemoMode, getMockData } from '@/lib/mockData';

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
    if (isDemoMode()) {
      const mockData = getMockData();
      if (mockData) {
        setOrganizations(mockData.organizations);
        setCurrentOrganization(mockData.organizations[0]);
        setLoading(false);
      }
      return;
    }

    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching organizations for user:', user.id);
      
      // First, get organizations where user is owner or member
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, description, category')
        .order('created_at', { ascending: false });

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
        setOrganizations([]);
        setCurrentOrganization(null);
        setLoading(false);
        return;
      }

      console.log('Organizations fetched:', orgData);

      if (!orgData || orgData.length === 0) {
        setOrganizations([]);
        setCurrentOrganization(null);
        setLoading(false);
        return;
      }

      // For each organization, get project count
      const orgsWithProjectCount = await Promise.all(
        orgData.map(async (org) => {
          const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id')
            .eq('organization_id', org.id);

          if (projectError) {
            console.error('Error fetching projects for org:', org.id, projectError);
            return {
              id: org.id,
              name: org.name,
              category: org.category || 'Não definido',
              description: org.description,
              projectCount: 0
            };
          }

          return {
            id: org.id,
            name: org.name,
            category: org.category || 'Não definido',
            description: org.description,
            projectCount: projects?.length || 0
          };
        })
      );

      console.log('Organizations with project counts:', orgsWithProjectCount);

      setOrganizations(orgsWithProjectCount);
      
      // Set current organization to first one if none selected
      if (orgsWithProjectCount.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgsWithProjectCount[0]);
        console.log('Set current organization to:', orgsWithProjectCount[0]);
      }
    } catch (error) {
      console.error('Error in fetchOrganizations:', error);
      setOrganizations([]);
      setCurrentOrganization(null);
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