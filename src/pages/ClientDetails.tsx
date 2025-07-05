import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Mail,
  FileText as DocumentIcon,
  Eye,
  TrendingUp
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ClientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleLogout = () => {
    navigate("/");
  };

  // Dados mock para o cliente específico
  const clientData = {
    id: "CLI-001",
    name: "TechCorp Ltda",
    type: "Pessoa Jurídica",
    document: "12.345.678/0001-90",
    phone: "(11) 3456-7890",
    email: "contato@techcorp.com.br",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
    projects: [
      {
        id: "PRJ-001",
        name: "E-commerce Moderno",
        status: "Em Andamento",
        startDate: "15/11/2024",
        currency: "BRL",
        value: 85000
      },
      {
        id: "PRJ-002",
        name: "Sistema ERP",
        status: "Finalizado", 
        startDate: "02/11/2024",
        currency: "BRL",
        value: 120000
      },
      {
        id: "PRJ-003",
        name: "App Mobile",
        status: "Em Pausa",
        startDate: "28/10/2024",
        currency: "BRL", 
        value: 65000
      }
    ],
    financial: {
      totalContracted: 270000,
      toReceive: 85000,
      received: 185000,
      receivedPercentage: 68
    },
    notes: "Cliente estratégico com grande potencial de expansão. Possui equipe técnica qualificada e sempre pontual nos pagamentos."
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
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
            <Button 
              variant="ghost" 
              onClick={() => navigate("/clients")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Clientes
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {clientData.name}
                </h1>
                <p className="text-muted-foreground">
                  Detalhes completos do cliente
                </p>
              </div>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar Cliente
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seção 1 - Informações Gerais */}
            <div className="lg:col-span-1">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium">{clientData.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DocumentIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">CNPJ</p>
                      <p className="font-medium font-mono">{clientData.document}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{clientData.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="font-medium">{clientData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{clientData.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seção 3 - Financeiro */}
              <Card className="shadow-card mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Contratado</span>
                      <span className="font-medium">{formatCurrency(clientData.financial.totalContracted)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Valor Recebido</span>
                      <span className="font-medium text-green-600">{formatCurrency(clientData.financial.received)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A Receber</span>
                      <span className="font-medium text-yellow-600">{formatCurrency(clientData.financial.toReceive)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso de Pagamento</span>
                      <span className="font-medium">{clientData.financial.receivedPercentage}%</span>
                    </div>
                    <Progress value={clientData.financial.receivedPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seção 2 - Projetos do Cliente */}
            <div className="lg:col-span-2">
              <Card className="shadow-card mb-6">
                <CardHeader>
                  <CardTitle>Projetos do Cliente</CardTitle>
                  <CardDescription>
                    Todos os projetos vinculados a este cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Projeto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Início</TableHead>
                        <TableHead>Moeda</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="w-32">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{project.startDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{project.currency}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(project.value)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Projeto
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Seção 4 - Observações Internas */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Observações Internas</CardTitle>
                  <CardDescription>
                    Anotações administrativas (visível apenas para administradores)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={clientData.notes}
                    onChange={() => {}}
                    className="min-h-32"
                    placeholder="Adicione observações sobre este cliente..."
                  />
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm">
                      Salvar Observações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDetails;