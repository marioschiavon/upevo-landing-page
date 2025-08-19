import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";

import { 
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Building2,
  FolderOpen,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, AreaChart, Area } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";

type TimeFilter = '30dias' | '6meses' | 'anoAtual';
type HoursTimeFilter = 'semana' | 'mes' | 'ano';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('anoAtual');
  const [hoursTimeFilter, setHoursTimeFilter] = useState<HoursTimeFilter>('mes');
  const [usersMap, setUsersMap] = useState<Map<string, any>>(new Map());
  const [allUsersInLogs, setAllUsersInLogs] = useState<string[]>([]);
  const [userColors, setUserColors] = useState<Map<string, string>>(new Map());
  const [dashboardData, setDashboardData] = useState({
    totalProjects: 0,
    totalClients: 0,
    totalReceived: 0,
    totalPending: 0,
    approvedBudgets: 0
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [hoursWorkedData, setHoursWorkedData] = useState<any[]>([]);
  const [projectTimeData, setProjectTimeData] = useState<any[]>([]);
  const [projectColors, setProjectColors] = useState<Map<string, string>>(new Map());
  const [allProjectsInLogs, setAllProjectsInLogs] = useState<string[]>([]);
  const [organizationTimeLogs, setOrganizationTimeLogs] = useState<any[]>([]);
  const [previousMonthData, setPreviousMonthData] = useState({
    totalProjects: 0,
    totalClients: 0,
    totalReceived: 0,
    totalPending: 0,
    approvedBudgets: 0
  });

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
      
      // Get current month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Get previous month dates
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      // Fetch summary data
      const [projectsRes, clientsRes, paymentsRes, budgetsRes, timeLogsRes] = await Promise.all([
        supabase.from('projects').select('id, name, status, created_at').eq('organization_id', currentOrganization.id),
        supabase.from('clients').select('id, created_at').eq('organization_id', currentOrganization.id),
        supabase.from('payments').select('*').eq('organization_id', currentOrganization.id),
        supabase.from('budgets').select('*').eq('organization_id', currentOrganization.id).eq('status', 'aprovado'),
        supabase
          .from('time_logs')
          .select(`
            duration_minutes,
            start_time,
            project_id,
            user_id
          `)
          .not('end_time', 'is', null)
          .not('duration_minutes', 'is', null)
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (timeLogsRes.error) throw timeLogsRes.error;

      // Get unique project IDs and user IDs from time logs
      const projectIds = [...new Set((timeLogsRes.data || []).map(log => log.project_id))];
      const userIds = [...new Set((timeLogsRes.data || []).map(log => log.user_id))];

      // Fetch projects and users data separately
      const [projectsDataRes, usersDataRes] = await Promise.all([
        projectIds.length > 0 
          ? supabase.from('projects').select('id, organization_id, name').in('id', projectIds)
          : Promise.resolve({ data: [], error: null }),
        userIds.length > 0
          ? supabase.from('users').select('id, name').in('id', userIds)
          : Promise.resolve({ data: [], error: null })
      ]);

      if (projectsDataRes.error) throw projectsDataRes.error;
      if (usersDataRes.error) throw usersDataRes.error;

      // Create lookup maps
      const projectsMap = new Map((projectsDataRes.data || []).map(p => [p.id, p]));
      const usersMapData = new Map((usersDataRes.data || []).map(u => [u.id, u]));
      setUsersMap(usersMapData);

      // Filter time logs for current organization and process hours worked data by user
      const organizationTimeLogs = (timeLogsRes.data || []).filter(log => {
        const project = projectsMap.get(log.project_id);
        return project?.organization_id === currentOrganization.id;
      });

      setOrganizationTimeLogs(organizationTimeLogs);

      // Generate project time data
      generateProjectTimeData(organizationTimeLogs, projectsMap);

      // Current month calculations
      const totalReceived = paymentsRes.data?.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.value), 0) || 0;
      const totalPending = paymentsRes.data?.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.value), 0) || 0;

      // Previous month calculations
      const prevProjects = projectsRes.data?.filter(p => new Date(p.created_at) <= previousMonthEnd).length || 0;
      const prevClients = clientsRes.data?.filter(c => new Date(c.created_at) <= previousMonthEnd).length || 0;
      const prevReceived = paymentsRes.data?.filter(p => 
        p.status === 'pago' && 
        new Date(p.paid_date || p.due_date) <= previousMonthEnd
      ).reduce((sum, p) => sum + Number(p.value), 0) || 0;
      const prevPending = paymentsRes.data?.filter(p => 
        p.status === 'pendente' && 
        new Date(p.due_date) <= previousMonthEnd
      ).reduce((sum, p) => sum + Number(p.value), 0) || 0;
      const prevBudgets = budgetsRes.data?.filter(b => new Date(b.created_at) <= previousMonthEnd).length || 0;

      setDashboardData({
        totalProjects: projectsRes.data?.length || 0,
        totalClients: clientsRes.data?.length || 0,
        totalReceived,
        totalPending,
        approvedBudgets: budgetsRes.data?.length || 0
      });

      setPreviousMonthData({
        totalProjects: prevProjects,
        totalClients: prevClients,
        totalReceived: prevReceived,
        totalPending: prevPending,
        approvedBudgets: prevBudgets
      });

      setProjects(projectsRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      // Error handled via toast - removed console log for production security
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate project time chart data
  const generateProjectTimeData = (timeLogs: any[], projectsMap: Map<string, any>) => {
    const now = new Date();
    const data = [];
    const projectsInPeriod = new Set<string>();

    // Generate daily data for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      const periodData: any = { date: dayLabel };
      
      timeLogs.forEach(log => {
        const logDate = new Date(log.start_time);
        if (logDate.toDateString() === date.toDateString()) {
          const project = projectsMap.get(log.project_id);
          const projectName = project?.name || 'Projeto Desconhecido';
          projectsInPeriod.add(projectName);
          
          const hours = (Number(log.duration_minutes) || 0) / 60;
          periodData[projectName] = (periodData[projectName] || 0) + hours;
        }
      });

      data.push(periodData);
    }
    
    // Generate colors for projects
    const projects = Array.from(projectsInPeriod);
    setAllProjectsInLogs(projects);
    
    const colors = new Map<string, string>();
    projects.forEach((projectName, index) => {
      // Generate HSL colors with good contrast
      const hue = (index * 137.5) % 360; // Golden angle for good distribution
      const saturation = 65 + (index % 3) * 10; // Vary saturation slightly
      const lightness = 45 + (index % 2) * 10; // Vary lightness slightly
      colors.set(projectName, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
    });
    setProjectColors(colors);
    
    setProjectTimeData(data);
  };

  // Generate hours worked chart data based on time filter
  const generateHoursChartData = (period: HoursTimeFilter, usersMapData: Map<string, any>) => {
    const now = new Date();
    const data = [];
    const usersInPeriod = new Set<string>();

    if (period === 'semana') {
      // Generate daily data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayLabel = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        const periodData: any = { period: dayLabel };
        
        organizationTimeLogs.forEach(log => {
          const logDate = new Date(log.start_time);
          if (logDate.toDateString() === date.toDateString()) {
            const user = usersMapData.get(log.user_id);
            const userName = user?.name || 'Usuário Desconhecido';
            usersInPeriod.add(userName);
            
            const hours = (Number(log.duration_minutes) || 0) / 60;
            periodData[userName] = (periodData[userName] || 0) + hours;
          }
        });

        data.push(periodData);
      }
    } else if (period === 'mes') {
      // Generate daily data for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        const periodData: any = { period: dayLabel };
        
        organizationTimeLogs.forEach(log => {
          const logDate = new Date(log.start_time);
          if (logDate.toDateString() === date.toDateString()) {
            const user = usersMapData.get(log.user_id);
            const userName = user?.name || 'Usuário Desconhecido';
            usersInPeriod.add(userName);
            
            const hours = (Number(log.duration_minutes) || 0) / 60;
            periodData[userName] = (periodData[userName] || 0) + hours;
          }
        });

        data.push(periodData);
      }
    } else {
      // Generate monthly data for current year
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        const periodData: any = { period: monthName };
        
        organizationTimeLogs.forEach(log => {
          const logDate = new Date(log.start_time);
          if (logDate.getMonth() === i && logDate.getFullYear() === now.getFullYear()) {
            const user = usersMapData.get(log.user_id);
            const userName = user?.name || 'Usuário Desconhecido';
            usersInPeriod.add(userName);
            
            const hours = (Number(log.duration_minutes) || 0) / 60;
            periodData[userName] = (periodData[userName] || 0) + hours;
          }
        });

        data.push(periodData);
      }
    }
    
    // Generate colors for users
    const users = Array.from(usersInPeriod);
    setAllUsersInLogs(users);
    
    const colors = new Map<string, string>();
    users.forEach((userName, index) => {
      // Generate HSL colors with good contrast
      const hue = (index * 137.5) % 360; // Golden angle for good distribution
      const saturation = 65 + (index % 3) * 10; // Vary saturation slightly
      const lightness = 45 + (index % 2) * 10; // Vary lightness slightly
      colors.set(userName, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
    });
    setUserColors(colors);
    
    return data;
  };

  // Update hours chart data when filter or logs change
  useEffect(() => {
    if (organizationTimeLogs.length > 0 && usersMap.size > 0) {
      const chartData = generateHoursChartData(hoursTimeFilter, usersMap);
      setHoursWorkedData(chartData);
    } else {
      setHoursWorkedData([]);
      setAllUsersInLogs([]);
      setUserColors(new Map());
    }
  }, [organizationTimeLogs, hoursTimeFilter, usersMap]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    const formattedChange = Math.abs(change).toFixed(1);
    return change >= 0 ? `+${formattedChange}%` : `-${formattedChange}%`;
  };

  const getTrend = (current: number, previous: number) => {
    return current >= previous ? "up" : "down";
  };

  const summaryData = [
    { 
      title: "Total de Projetos", 
      value: dashboardData.totalProjects.toString(), 
      change: calculatePercentageChange(dashboardData.totalProjects, previousMonthData.totalProjects), 
      trend: getTrend(dashboardData.totalProjects, previousMonthData.totalProjects), 
      icon: FolderOpen
    },
    { 
      title: "Total de Clientes", 
      value: dashboardData.totalClients.toString(), 
      change: calculatePercentageChange(dashboardData.totalClients, previousMonthData.totalClients), 
      trend: getTrend(dashboardData.totalClients, previousMonthData.totalClients), 
      icon: Users
    },
    { 
      title: "Valor Pendente", 
      value: formatCurrency(dashboardData.totalPending), 
      change: calculatePercentageChange(dashboardData.totalPending, previousMonthData.totalPending), 
      trend: getTrend(dashboardData.totalPending, previousMonthData.totalPending), 
      icon: Clock
    },
    { 
      title: "Valor Recebido", 
      value: formatCurrency(dashboardData.totalReceived), 
      change: calculatePercentageChange(dashboardData.totalReceived, previousMonthData.totalReceived), 
      trend: getTrend(dashboardData.totalReceived, previousMonthData.totalReceived), 
      icon: DollarSign
    },
    { 
      title: "Orçamentos Aprovados", 
      value: dashboardData.approvedBudgets.toString(), 
      change: calculatePercentageChange(dashboardData.approvedBudgets, previousMonthData.approvedBudgets), 
      trend: getTrend(dashboardData.approvedBudgets, previousMonthData.approvedBudgets), 
      icon: CheckCircle
    },
  ];

  // Generate chart data based on selected time filter
  const generateChartData = (period: TimeFilter) => {
    const now = new Date();
    const data = [];

    if (period === '30dias') {
      // Generate daily data for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        const dayPayments = payments.filter(payment => {
          const paymentDate = new Date(payment.due_date);
          return paymentDate.toDateString() === date.toDateString();
        });

        const valorRecebido = dayPayments.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.value), 0);
        const valorVencer = dayPayments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.value), 0);

        data.push({
          month: dayLabel,
          valorRecebido,
          valorVencer
        });
      }
    } else if (period === '6meses') {
      // Generate monthly data for last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        const monthPayments = payments.filter(payment => {
          const paymentDate = new Date(payment.due_date);
          return paymentDate.getMonth() === date.getMonth() && paymentDate.getFullYear() === date.getFullYear();
        });

        const valorRecebido = monthPayments.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.value), 0);
        const valorVencer = monthPayments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.value), 0);

        data.push({
          month: monthName,
          valorRecebido,
          valorVencer
        });
      }
    } else {
      // Generate monthly data for current year
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        const monthPayments = payments.filter(payment => {
          const paymentDate = new Date(payment.due_date);
          return paymentDate.getMonth() === i && paymentDate.getFullYear() === now.getFullYear();
        });

        const valorRecebido = monthPayments.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.value), 0);
        const valorVencer = monthPayments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.value), 0);

        data.push({
          month: monthName,
          valorRecebido,
          valorVencer
        });
      }
    }
    
    return data;
  };

  const chartData = generateChartData(timeFilter);

  // Show loading while organization context is loading
  if (orgLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex">
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
            {summaryData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="flex items-center mt-2">
                      {item.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">vs mês anterior</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Chart */}
          <Card className="shadow-card mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Visão Geral Financeira</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={timeFilter === '30dias' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeFilter('30dias')}
                  >
                    30 dias
                  </Button>
                  <Button 
                    variant={timeFilter === '6meses' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeFilter('6meses')}
                  >
                    6 meses
                  </Button>
                  <Button 
                    variant={timeFilter === 'anoAtual' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeFilter('anoAtual')}
                  >
                    Ano atual
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="valorRecebido" stackId="1" stroke="hsl(var(--chart-2))" fill="url(#colorReceived)" />
                  <Area type="monotone" dataKey="valorVencer" stackId="1" stroke="hsl(var(--chart-4))" fill="url(#colorPending)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Hours Worked Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-purple" />
                    Horas Trabalhadas
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={hoursTimeFilter === 'semana' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setHoursTimeFilter('semana')}
                    >
                      Semana
                    </Button>
                    <Button 
                      variant={hoursTimeFilter === 'mes' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setHoursTimeFilter('mes')}
                    >
                      Mês
                    </Button>
                    <Button 
                      variant={hoursTimeFilter === 'ano' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setHoursTimeFilter('ano')}
                    >
                      Ano
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hoursWorkedData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hoursWorkedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis 
                        tickFormatter={(value) => {
                          const minutes = Math.round(value * 60);
                          return `${minutes}min`;
                        }} 
                        domain={[0, (dataMax: number) => {
                          const maxMinutes = Math.ceil(dataMax * 60);
                          return Math.ceil(maxMinutes / 15) * 15 / 60; // Round up to nearest 15min interval in hours
                        }]}
                        tickCount={8}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          const minutes = Math.round(value * 60);
                          return [`${minutes}min`, name];
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px'
                        }}
                      />
                      {allUsersInLogs.map((userName, index) => (
                        <Line
                          key={userName}
                          type="monotone"
                          dataKey={userName}
                          stroke={userColors.get(userName)}
                          strokeWidth={2}
                          dot={{ fill: userColors.get(userName), strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: userColors.get(userName), strokeWidth: 2 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhum registro de tempo encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Os dados aparecerão quando houver cronômetros iniciados e parados nos projetos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Time Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-brand-orange" />
                  Tempo por Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectTimeData.length > 0 && allProjectsInLogs.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projectTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => {
                          const minutes = Math.round(value * 60);
                          return `${minutes}min`;
                        }} 
                        domain={[0, (dataMax: number) => {
                          const maxMinutes = Math.ceil(dataMax * 60);
                          return Math.ceil(maxMinutes / 15) * 15 / 60; // Round up to nearest 15min interval in hours
                        }]}
                        tickCount={8}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          const minutes = Math.round(value * 60);
                          return [`${minutes}min`, name];
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px'
                        }}
                      />
                      {allProjectsInLogs.map((projectName, index) => (
                        <Line
                          key={projectName}
                          type="monotone"
                          dataKey={projectName}
                          stroke={projectColors.get(projectName)}
                          strokeWidth={2}
                          dot={{ fill: projectColors.get(projectName), strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: projectColors.get(projectName), strokeWidth: 2 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhum tempo registrado por projeto</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Os dados aparecerão quando houver tempo trabalhado nos projetos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
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
                          project.status === 'concluido' ? 'success' : 
                          project.status === 'pausado' ? 'neutral' : 'outline'
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
                  <Clock className="h-5 w-5 text-primary-glow" />
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
                        <Badge variant={payment.status === 'pago' ? 'success' : 'neutral'}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Organization Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-accent" />
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