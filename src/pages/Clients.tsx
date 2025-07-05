import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Eye,
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

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("all");

  const handleLogout = () => {
    navigate("/");
  };

  // Dados mock para clientes
  const clientsData = [
    {
      id: "CLI-001",
      name: "TechCorp Ltda",
      document: "12.345.678/0001-90",
      phone: "(11) 3456-7890",
      email: "contato@techcorp.com.br",
      projectCount: 3,
      type: "juridica"
    },
    {
      id: "CLI-002", 
      name: "João Silva Santos",
      document: "123.456.789-00",
      phone: "(11) 98765-4321",
      email: "joao.silva@email.com",
      projectCount: 1,
      type: "fisica"
    },
    {
      id: "CLI-003",
      name: "IndustrialMax S/A",
      document: "98.765.432/0001-10",
      phone: "(11) 2345-6789", 
      email: "comercial@industrialmax.com.br",
      projectCount: 2,
      type: "juridica"
    },
    {
      id: "CLI-004",
      name: "Maria Oliveira Costa",
      document: "987.654.321-00",
      phone: "(11) 91234-5678",
      email: "maria.costa@email.com",
      projectCount: 1,
      type: "fisica"
    },
    {
      id: "CLI-005",
      name: "GlobalTech Solutions",
      document: "11.222.333/0001-44",
      phone: "(11) 3333-4444",
      email: "info@globaltech.com",
      projectCount: 4,
      type: "juridica"
    }
  ];

  const filteredClients = clientsData.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.document.includes(searchTerm);
    const matchesType = clientType === "all" || client.type === clientType;
    return matchesSearch && matchesType;
  });

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderOpen, label: "Projetos", path: "/projects" },
    { icon: Users, label: "Clientes", active: true },
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
              Clientes
            </h1>
            <p className="text-muted-foreground mb-6">
              Gerencie todos os seus clientes e visualize informações detalhadas.
            </p>
            
            <Button className="mb-6">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou CNPJ/CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={clientType} onValueChange={setClientType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="fisica">Pessoa Física</SelectItem>
                <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clients Table */}
          {filteredClients.length > 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome do Cliente</TableHead>
                      <TableHead>CNPJ/CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Projetos</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-mono text-sm">{client.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">{client.name}</span>
                              <div className="text-xs text-muted-foreground">
                                {client.type === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{client.document}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.projectCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
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
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground">
                  Ajuste os filtros ou adicione um novo cliente.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Clients;