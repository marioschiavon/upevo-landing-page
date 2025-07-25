import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BudgetsTable } from "@/components/financial/BudgetsTable";
import { PaymentsTable } from "@/components/financial/PaymentsTable";
import { FinancialFilters } from "@/components/financial/FinancialFilters";
import { FinancialSummary } from "@/components/financial/FinancialSummary";
import { FinancialCharts } from "@/components/financial/FinancialCharts";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { NewProjectModal } from "@/components/forms/NewProjectModal";
import { NewBudgetModal } from "@/components/forms/NewBudgetModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Loader2 } from "lucide-react";

export interface FinancialFilters {
  clientId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

const Financial = () => {
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filters, setFilters] = useState<FinancialFilters>({});
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      fetchData();
    }
  }, [filters, currentOrganization]);

  const fetchData = async () => {
    if (!currentOrganization) return;
    
    try {
      setLoading(true);
      
      // Fetch budgets with proper client information
      let budgetsQuery = supabase
        .from('budgets')
        .select(`
          *,
          projects (
            id,
            name
          ),
          clients (
            id,
            name
          )
        `)
        .eq('organization_id', currentOrganization.id);

      if (filters.clientId) {
        budgetsQuery = budgetsQuery.eq('projects.client_id', filters.clientId);
      }
      if (filters.projectId) {
        budgetsQuery = budgetsQuery.eq('project_id', filters.projectId);
      }
      if (filters.status && filters.status !== 'todos') {
        budgetsQuery = budgetsQuery.eq('status', filters.status);
      }
      if (filters.startDate) {
        budgetsQuery = budgetsQuery.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        budgetsQuery = budgetsQuery.lte('created_at', filters.endDate);
      }

      const { data: budgetsData, error: budgetsError } = await budgetsQuery;
      
      if (budgetsError) throw budgetsError;

      // Fetch payments with filters using direct organization filter
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          *,
          projects(name, client_id),
          budgets(description, client_id)
        `)
        .eq('organization_id', currentOrganization.id);

      if (filters.clientId) {
        paymentsQuery = paymentsQuery.eq('projects.client_id', filters.clientId);
      }
      if (filters.projectId) {
        paymentsQuery = paymentsQuery.eq('project_id', filters.projectId);
      }
      if (filters.status && filters.status !== 'todos') {
        paymentsQuery = paymentsQuery.eq('status', filters.status);
      }
      if (filters.startDate) {
        paymentsQuery = paymentsQuery.gte('due_date', filters.startDate);
      }
      if (filters.endDate) {
        paymentsQuery = paymentsQuery.lte('due_date', filters.endDate);
      }

      const { data: paymentsData, error: paymentsError } = await paymentsQuery;
      
      if (paymentsError) throw paymentsError;

      // Fetch clients and projects for filters (filtered by current organization)
      const [clientsResult, projectsResult] = await Promise.all([
        supabase.from('clients').select('id, name').eq('organization_id', currentOrganization.id).order('name'),
        supabase.from('projects').select('id, name, client_id').eq('organization_id', currentOrganization.id).order('name')
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (projectsResult.error) throw projectsResult.error;

      setBudgets(budgetsData || []);
      setPayments(paymentsData || []);
      setClients(clientsResult.data || []);
      setProjects(projectsResult.data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientCreated = () => {
    fetchData();
    toast({
      title: "Cliente cadastrado",
      description: "O cliente foi cadastrado com sucesso!",
    });
  };

  const handleProjectCreated = () => {
    fetchData();
    toast({
      title: "Projeto cadastrado",
      description: "O projeto foi cadastrado com sucesso!",
    });
  };

  const handleBudgetCreated = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeItem="financial" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeItem="financial" />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Financeiro Geral</h1>
              <p className="text-muted-foreground">Gerencie orçamentos e pagamentos</p>
            </div>
            <OrganizationDropdown />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button onClick={() => setIsNewClientModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
            <Button 
              onClick={() => setIsNewProjectModalOpen(true)}
              disabled={clients.length === 0 || !currentOrganization}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </div>

          <FinancialFilters 
            filters={filters}
            onFiltersChange={setFilters}
            clients={clients}
            projects={projects}
          />
          
          <FinancialSummary payments={payments} />
          
          <FinancialCharts payments={payments} />
          
          <Tabs defaultValue="budgets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="budgets" className="space-y-4">
              <BudgetsTable 
                budgets={budgets} 
                onUpdate={fetchData}
                onNewBudget={() => setIsNewBudgetModalOpen(true)}
              />
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              <PaymentsTable payments={payments} onUpdate={fetchData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSuccess={handleClientCreated}
        organizations={currentOrganization ? [currentOrganization] : []}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSuccess={handleProjectCreated}
        organizations={currentOrganization ? [currentOrganization] : []}
      />

      <NewBudgetModal
        isOpen={isNewBudgetModalOpen}
        onClose={() => setIsNewBudgetModalOpen(false)}
        onSuccess={handleBudgetCreated}
      />
    </div>
  );
};

export default Financial;