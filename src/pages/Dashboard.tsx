import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Building2, 
  BarChart3, 
  Wallet, 
  Bell, 
  Calendar, 
  FileText, 
  Headphones, 
  Settings, 
  LogOut,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  // Dados mock para o dashboard
  const summaryData = [
    { title: "Total de Projetos", value: "24", change: "+12%", trend: "up", color: "bg-blue-500" },
    { title: "Total de Tarefas", value: "156", change: "+8%", trend: "up", color: "bg-purple-500" },
    { title: "Valor a Vencer", value: "R$ 85.200", change: "-3%", trend: "down", color: "bg-yellow-500" },
    { title: "Valor Recebido", value: "R$ 142.800", change: "+15%", trend: "up", color: "bg-green-500" },
    { title: "Tarefas Concluídas Hoje", value: "12", change: "+25%", trend: "up", color: "bg-gray-500" },
  ];

  const chartData = [
    { month: 'Jan', valorRecebido: 120000, valorVencer: 85000, tarefasConcluidas: 45 },
    { month: 'Fev', valorRecebido: 135000, valorVencer: 92000, tarefasConcluidas: 52 },
    { month: 'Mar', valorRecebido: 142800, valorVencer: 85200, tarefasConcluidas: 48 },
    { month: 'Abr', valorRecebido: 128000, valorVencer: 76000, tarefasConcluidas: 55 },
    { month: 'Mai', valorRecebido: 155000, valorVencer: 88000, tarefasConcluidas: 62 },
    { month: 'Jun', valorRecebido: 168000, valorVencer: 95000, tarefasConcluidas: 58 },
  ];

  const highPriorityTasks = [
    { project: "App E-commerce", task: "Implementar gateway de pagamento", priority: "Alta" },
    { project: "Sistema ERP", task: "Correção de bugs críticos", priority: "Crítica" },
    { project: "Landing Page", task: "Otimização SEO", priority: "Alta" },
    { project: "App Mobile", task: "Testes de performance", priority: "Alta" },
  ];

  const projectStatus = [
    { name: "App E-commerce", progress: 85, status: "Andamento", deadline: "15/12/2024", responsible: "João Silva" },
    { name: "Sistema ERP", progress: 92, status: "Concluído", deadline: "10/12/2024", responsible: "Maria Santos" },
    { name: "Landing Page", progress: 45, status: "Andamento", deadline: "20/12/2024", responsible: "Pedro Lima" },
    { name: "App Mobile", progress: 0, status: "Pausado", deadline: "30/12/2024", responsible: "Ana Costa" },
  ];

  const recentActivities = [
    { action: "Tarefa concluída", description: "Gateway de pagamento implementado", time: "2 horas atrás" },
    { action: "Novo projeto", description: "Sistema de CRM iniciado", time: "1 dia atrás" },
    { action: "Suporte", description: "Chamado #1245 resolvido", time: "2 dias atrás" },
    { action: "Reunião", description: "Alinhamento de projeto concluído", time: "3 dias atrás" },
  ];

  const upcomingAppointments = [
    { title: "Reunião com cliente", date: "Hoje, 14:00" },
    { title: "Review de projeto", date: "Amanhã, 10:00" },
    { title: "Apresentação final", date: "15/12, 16:00" },
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true, path: "/dashboard" },
    { icon: FolderOpen, label: "Projetos", path: "/projects" },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: Building2, label: "Organização" },
    { icon: BarChart3, label: "Relatórios" },
    { icon: Wallet, label: "Financeiro" },
    { icon: Bell, label: "Avisos" },
    { icon: Calendar, label: "Agenda" },
    { icon: FileText, label: "Contratos" },
    { icon: Headphones, label: "Suporte" },
    { icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r shadow-card">
        <div className="p-6">
          <img 
            src="/lovable-uploads/e20659b7-17a3-4fba-a781-da7aeb501e68.png" 
            alt="Upevolution Logo" 
            className="h-8"
          />
        </div>
        
        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                item.active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground mt-8"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Visão geral dos seus projetos e atividades
            </p>
          </div>

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
            {/* High Priority Tasks */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Tarefas com Alta Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {highPriorityTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.project}</p>
                      <p className="text-sm text-muted-foreground">{task.task}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === 'Crítica' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                      <Button size="sm">Ver Tarefa</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                  Status dos Projetos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectStatus.map((project, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant={
                        project.status === 'Concluído' ? 'default' : 
                        project.status === 'Pausado' ? 'secondary' : 'outline'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Prazo: {project.deadline}</span>
                      <span>{project.responsible}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activities */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Últimas Atividades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Próximos Compromissos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">{appointment.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Currency Exchange */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-yellow-500" />
                  Cotações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">USD/BRL</span>
                    <span className="font-medium">R$ 5,25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">EUR/BRL</span>
                    <span className="font-medium">R$ 5,68</span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">Valor recebido em USD</p>
                    <p className="text-lg font-bold text-primary">$ 27,200</p>
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