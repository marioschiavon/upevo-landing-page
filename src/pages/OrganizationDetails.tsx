import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Building2,
  Users,
  FolderOpen,
  DollarSign,
  Edit,
  Calendar,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizations } = useOrganization();
  
  const organization = organizations.find(org => org.id === Number(id));

  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Organização não encontrada</h2>
          <Button onClick={() => navigate("/organizations")}>
            Voltar para Organizações
          </Button>
        </div>
      </div>
    );
  }

  // Mock data para demonstração
  const mockProjects = [
    {
      id: "PRJ-001",
      name: "Sistema de Gestão",
      status: "Em Andamento",
      startDate: "15/01/2024",
      currency: "BRL",
      progress: 75
    },
    {
      id: "PRJ-002", 
      name: "App Mobile",
      status: "Concluído",
      startDate: "10/12/2023",
      currency: "USD",
      progress: 100
    }
  ];

  const mockMembers = [
    { name: "João Silva", role: "Desenvolvedor", email: "joao@upevo.com" },
    { name: "Maria Santos", role: "Designer", email: "maria@upevo.com" },
    { name: "Pedro Costa", role: "Gerente", email: "pedro@upevo.com" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/organizations")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{organization.nome}</h1>
              <p className="text-muted-foreground">{organization.tipo_organizacao}</p>
            </div>
          </div>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Organização
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Informações Gerais */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome da Organização</label>
              <p className="text-foreground font-medium">{organization.nome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Área de Atuação</label>
              <p className="text-foreground font-medium">{organization.tipo_organizacao}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <p className="text-foreground">{organization.descricao || "Sem descrição disponível"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                E-mail
              </label>
              <p className="text-foreground">contato@{organization.nome.toLowerCase().replace(/\s+/g, '')}.com</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Telefone
              </label>
              <p className="text-foreground">(11) 9999-9999</p>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projetos</p>
                  <p className="text-2xl font-bold text-foreground">{organization.projectCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Membros</p>
                  <p className="text-2xl font-bold text-foreground">{mockMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-foreground">R$ 450K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criada em</p>
                  <p className="text-2xl font-bold text-foreground">Jan/2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projetos */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projetos da Organização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={project.status === "Concluído" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={project.progress} className="h-2" />
                          <p className="text-sm text-muted-foreground">{project.progress}%</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Membros */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membros da Organização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financeiro */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Valor Total Contratado</p>
                <p className="text-3xl font-bold text-foreground">R$ 450.000</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Valor Recebido</p>
                <p className="text-3xl font-bold text-green-600">R$ 320.000</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Valor a Receber</p>
                <p className="text-3xl font-bold text-yellow-600">R$ 130.000</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Progresso de Recebimento</span>
                <span className="text-sm font-medium text-foreground">71%</span>
              </div>
              <Progress value={71} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDetails;