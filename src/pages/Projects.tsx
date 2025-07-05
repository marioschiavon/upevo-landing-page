import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Search,
  MoreHorizontal,
  Plus,
  FolderOpen as FolderIcon,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Projects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const handleLogout = () => {
    navigate("/");
  };

  // Dados mock para projetos
  const projectsData = [
    {
      id: "PRJ-001",
      name: "E-commerce Moderno",
      client: "TechCorp Ltda",
      startDate: "15/11/2024",
      currency: "BRL",
      status: "Em Andamento",
      progress: 65,
      statusColor: "bg-blue-500"
    },
    {
      id: "PRJ-002", 
      name: "Sistema ERP",
      client: "IndustrialMax",
      startDate: "02/11/2024",
      currency: "USD",
      status: "Finalizado",
      progress: 100,
      statusColor: "bg-green-500"
    },
    {
      id: "PRJ-003",
      name: "App Mobile Delivery",
      client: "FoodExpress",
      startDate: "28/10/2024", 
      currency: "BRL",
      status: "Em Pausa",
      progress: 35,
      statusColor: "bg-yellow-500"
    },
    {
      id: "PRJ-004",
      name: "Portal Corporativo",
      client: "GlobalTech Solutions",
      startDate: "20/10/2024",
      currency: "EUR",
      status: "Em Andamento",
      progress: 80,
      statusColor: "bg-purple-500"
    }
  ];

  const filteredProjects = projectsData.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderOpen, label: "Projetos", active: true },
    { icon: Users, label: "Clientes" },
    { icon: Building2, label: "Organização" },
    { icon: BarChart3, label: "Relatórios" },
    { icon: Wallet, label: "Financeiro" },
    { icon: Bell, label: "Avisos" },
    { icon: Calendar, label: "Agenda" },
    { icon: FileText, label: "Contratos" },
    { icon: Headphones, label: "Suporte" },
    { icon: Settings, label: "Configurações" },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "default";
      case "Em Pausa":
        return "secondary";
      default:
        return "outline";
    }
  };

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
              Projetos
            </h1>
            <p className="text-muted-foreground mb-6">
              Aqui você visualiza todos os projetos ativos. Projetos são gerados a partir de orçamentos aprovados.
            </p>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button disabled className="mb-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Somente após aprovação de orçamento</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por projeto ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="oldest">Mais Antigos</SelectItem>
                <SelectItem value="alphabetical">Ordem Alfabética</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Table */}
          {filteredProjects.length > 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome do Projeto</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Moeda</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-mono text-sm">{project.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FolderIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{project.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{project.client}</TableCell>
                        <TableCell>{project.startDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.currency}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="w-16 h-2" />
                            <span className="text-sm text-muted-foreground">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                              <DropdownMenuItem>Editar Projeto</DropdownMenuItem>
                              <DropdownMenuItem>Relatório</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            // Empty State
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum projeto criado ainda</h3>
                <p className="text-muted-foreground">
                  Os projetos aparecem aqui após aprovação de um orçamento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;