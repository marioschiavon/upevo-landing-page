import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetsTable } from "@/components/financial/BudgetsTable";
import { PaymentsTable } from "@/components/financial/PaymentsTable";
import { FinancialFilters } from "@/components/financial/FinancialFilters";
import { FinancialSummary } from "@/components/financial/FinancialSummary";
import { FinancialCharts } from "@/components/financial/FinancialCharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [filters, setFilters] = useState<FinancialFilters>({});

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch budgets with filters
      let budgetsQuery = supabase
        .from('budgets')
        .select(`
          *,
          projects!budgets_project_id_fkey(name, client_id),
          projects!budgets_project_id_fkey.clients!projects_client_id_fkey(name)
        `);

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

      // Fetch payments with filters
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          *,
          projects!payments_project_id_fkey(name, client_id),
          projects!payments_project_id_fkey.clients!projects_client_id_fkey(name),
          budgets!payments_budget_id_fkey(description)
        `);

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

      // Fetch clients and projects for filters
      const [clientsResult, projectsResult] = await Promise.all([
        supabase.from('clients').select('id, name').order('name'),
        supabase.from('projects').select('id, name, client_id').order('name')
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
              <BudgetsTable budgets={budgets} onUpdate={fetchData} />
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              <PaymentsTable payments={payments} onUpdate={fetchData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Financial;