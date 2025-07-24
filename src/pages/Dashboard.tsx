import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";
import { Sidebar } from "@/components/shared/Sidebar";
import { 
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProjects: 0,
    totalClients: 0,
    totalReceived: 0,
    totalPending: 0,
    approvedBudgets: 0
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrganization) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [currentOrganization]);

  const fetchDashboardData = async () => {
    if (!currentOrganization) return;
    
    try {
      setLoading(true);
      
      // Fetch summary data
      const [projectsRes, clientsRes, paymentsRes, budgetsRes] = await Promise.all([
        supabase.from('projects').select('id, name, status, created_at').eq('organization_id', currentOrganization.id),
        supabase.from('clients').select('id').eq('organization_id', currentOrganization.id),
        supabase.from('payments').select('*').eq('organization_id', currentOrganization.id),
        supabase.from('budgets').select('*').eq('organization_id', currentOrganization.id).eq('status', 'aprovado')
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (budgetsRes.error) throw budgetsRes.error;

      const totalReceived = paymentsRes.data?.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.value), 0) || 0;
      const totalPending = paymentsRes.data?.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.value), 0) || 0;

      setDashboardData({
        totalProjects: projectsRes.data?.length || 0,
        totalClients: clientsRes.data?.length || 0,
        totalReceived,
        totalPending,
        approvedBudgets: budgetsRes.data?.length || 0
      });

      setProjects(projectsRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const summaryData = [
    { 
      title: "Total de Projetos", 
      value: dashboardData.totalProjects.toString(), 
      change: "+0%", 
      trend: "up", 
      color: "bg-blue-500" 
    },
    { 
      title: "Total de Clientes", 
      value: dashboardData.totalClients.toString(), 
      change: "+0%", 
      trend: "up", 
      color: "bg-purple-500" 
    },
    { 
      title: "Valor Pendente", 
      value: formatCurrency(dashboardData.totalPending), 
      change: "+0%", 
      trend: "up", 
      color: "bg-yellow-500" 
    },
    { 
      title: "Valor Recebido", 
      value: formatCurrency(dashboardData.totalReceived), 
      change: "+0%", 
      trend: "up", 
      color: "bg-green-500" 
    },
    { 
      title: "Orçamentos Aprovados", 
      value: dashboardData.approvedBudgets.toString(), 
      change: "+0%", 
      trend: "up", 
      color: "bg-gray-500" 
    },
  ];

  // Generate chart data from last 6 months of payments
  const generateChartData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.due_date);
        return paymentDate.getMonth() === date.getMonth() && paymentDate.getFullYear() === date.getFullYear();
      });

      const valorRecebido = monthPayments.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.value), 0);
      const valorVencer = monthPayments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.value), 0);

      months.push({
        month: monthName,
        valorRecebido,
        valorVencer
      });
    }
    
    return months;
  };

  const chartData = generateChartData();

  // Show loading while organization context is loading
  if (orgLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeItem="dashboard" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show message if no organization is selected
  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeItem="dashboard" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma organização selecionada</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar em uma organização para visualizar o dashboard.
            </p>
            <Button onClick={() => navigate("/organizations")}>
              Ir para Organizações
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeItem="dashboard" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header com dropdown de organização */}
        <header className="bg-card border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Visão geral dos projetos e atividades - {currentOrganization.name}
              </p>
            </div>
            <OrganizationDropdown />
          </div>
        </header>

        <div className="p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {summaryData.map((item, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {item.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      item.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card className="shadow-card mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Visão Geral Financeira</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">30 dias</Button>
                  <Button variant="outline" size="sm">6 meses</Button>
                  <Button variant="default" size="sm">Ano atual</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F39C12" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F39C12" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="valorRecebido" stackId="1" stroke="#4ECDC4" fill="url(#colorReceived)" />
                  <Area type="monotone" dataKey="valorVencer" stackId="1" stroke="#F39C12" fill="url(#colorPending)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Projects */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Projetos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length > 0 ? (
                  projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          project.status === 'concluido' ? 'default' : 
                          project.status === 'pausado' ? 'secondary' : 'outline'
                        }>
                          {project.status === 'em_andamento' ? 'Em Andamento' :
                           project.status === 'concluido' ? 'Concluído' :
                           project.status === 'pausado' ? 'Pausado' : project.status}
                        </Badge>
                        <Button size="sm" onClick={() => navigate(`/projects/${project.id}`)}>
                          Ver Projeto
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum projeto encontrado</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate("/projects")}
                    >
                      Criar Primeiro Projeto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Pagamentos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payments.length > 0 ? (
                  payments.slice(0, 4).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.description || 'Pagamento'}</p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{formatCurrency(Number(payment.value))}</p>
                        <Badge variant={payment.status === 'pago' ? 'default' : 'secondary'}>
                          {payment.status === 'pago' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate("/financial")}
                    >
                      Ver Financeiro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/projects")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Criar Novo Projeto
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/clients")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Adicionar Cliente
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/financial")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Financeiro
                </Button>
              </CardContent>
            </Card>

            {/* Organization Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Informações da Organização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{currentOrganization.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentOrganization.description || "Sem descrição"}
                  </p>
                </div>
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Projetos</p>
                      <p className="font-medium">{dashboardData.totalProjects}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clientes</p>
                      <p className="font-medium">{dashboardData.totalClients}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;