
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";
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
  AlertCircle,
  Loader2
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
import { NewProjectModal } from "@/components/forms/NewProjectModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";

interface Project {
  id: string;
  name: string;
  client_name: string | null;
  start_date: string | null;
  currency: string;
  status: string;
  created_at: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (currentOrganization) {
      fetchProjects();
    }
  }, [currentOrganization]);

  const fetchProjects = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          start_date,
          currency,
          status,
          created_at,
          clients (
            name
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = data?.map(project => ({
        id: project.id,
        name: project.name,
        client_name: project.clients ? project.clients.name : null,
        start_date: project.start_date,
        currency: project.currency || 'BRL',
        status: project.status,
        created_at: project.created_at,
      })) || [];

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
    toast({
      title: "Projeto cadastrado",
      description: "O projeto foi cadastrado com sucesso!",
    });
  };

  const handleLogout = () => {
    navigate("/");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definida";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluido':
        return 'Concluído';
      case 'pausado':
        return 'Pausado';
      default:
        return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "concluido":
        return "default";
      case "pausado":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderOpen, label: "Projetos", active: true },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: Building2, label: "Organização", path: "/organizations" },
    { icon: BarChart3, label: "Relatórios" },
    { icon: Wallet, label: "Financeiro" },
    { icon: Bell, label: "Avisos" },
    { icon: Calendar, label: "Agenda" },
    { icon: FileText, label: "Contratos" },
    { icon: Headphones, label: "Suporte" },
    { icon: Settings, label: "Configurações" },
  ];

  if (!currentOrganization) {
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

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando organização...</p>
          </div>
        </main>
      </div>
    );
  }

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
        {/* Header com dropdown de organização */}
        <header className="bg-card border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
              <p className="text-muted-foreground">Aqui você visualiza todos os projetos ativos. Projetos são gerados a partir de orçamentos aprovados.</p>
            </div>
            <OrganizationDropdown />
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <Button 
              className="mb-6" 
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
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
          {loading ? (
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando projetos...</p>
              </CardContent>
            </Card>
          ) : sortedProjects.length > 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Projeto</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Moeda</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FolderIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{project.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={!project.client_name ? "text-muted-foreground italic" : ""}>
                            {project.client_name || "Sem cliente"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(project.start_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.currency}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                                Ver Detalhes
                              </DropdownMenuItem>
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
                <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Tente ajustar os filtros de busca." : "Crie o primeiro projeto desta organização."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsNewProjectModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSuccess={handleProjectCreated}
        organizations={currentOrganization ? [{ id: currentOrganization.id, name: currentOrganization.name }] : []}
      />
    </div>
  );
};

export default Projects;
