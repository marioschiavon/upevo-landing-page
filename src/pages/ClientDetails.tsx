import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
  TrendingUp,
  Loader2
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
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  client_type?: string;
  cpf?: string;
  cnpj?: string;
  birth_date?: string;
  gender?: string;
  state_registration?: string;
  trade_name?: string;
  responsible_person?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_active?: boolean;
  internal_notes?: string;
  created_at?: string;
  updated_at?: string;
  organization_id: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  start_date?: string;
  currency?: string;
  client_id: string;
}

interface Budget {
  id: string;
  project_id: string;
  total_value: number;
  status: string;
}

interface Payment {
  id: string;
  budget_id: string;
  value: number;
  status: string;
  paid_date?: string;
}

const ClientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (clientError) {
        console.error('Erro ao buscar cliente:', clientError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados do cliente"
        });
        return;
      }

      if (!clientData) {
        toast({
          variant: "destructive",
          title: "Cliente não encontrado",
          description: "O cliente especificado não foi encontrado"
        });
        navigate('/clients');
        return;
      }

      setClient(clientData);
      setEditFormData(clientData);

      // Buscar projetos do cliente
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', id);

      if (projectsError) {
        console.error('Erro ao buscar projetos:', projectsError);
      } else {
        setProjects(projectsData || []);
      }

      // Buscar orçamentos
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('*')
          .in('project_id', projectIds);

        if (budgetsError) {
          console.error('Erro ao buscar orçamentos:', budgetsError);
        } else {
          setBudgets(budgetsData || []);
        }

        // Buscar pagamentos
        if (budgetsData && budgetsData.length > 0) {
          const budgetIds = budgetsData.map(b => b.id);
          
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .in('budget_id', budgetIds);

          if (paymentsError) {
            console.error('Erro ao buscar pagamentos:', paymentsError);
          } else {
            setPayments(paymentsData || []);
          }
        }
      }
    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async () => {
    if (!client) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('clients')
        .update(editFormData)
        .eq('id', client.id);

      if (error) {
        console.error('Erro ao salvar cliente:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar as alterações"
        });
        return;
      }

      setClient({ ...client, ...editFormData });
      setIsEditModalOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async (notes: string) => {
    if (!client) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ internal_notes: notes })
        .eq('id', client.id);

      if (error) {
        console.error('Erro ao salvar observações:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar as observações"
        });
        return;
      }

      setClient({ ...client, internal_notes: notes });
      
      toast({
        title: "Sucesso",
        description: "Observações salvas com sucesso"
      });
    } catch (error) {
      console.error('Erro ao salvar observações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado"
      });
    }
  };

  const calculateFinancialSummary = () => {
    const totalContracted = budgets.reduce((sum, budget) => sum + Number(budget.total_value), 0);
    const received = payments
      .filter(payment => payment.status === 'pago' && payment.paid_date)
      .reduce((sum, payment) => sum + Number(payment.value), 0);
    const toReceive = totalContracted - received;
    const receivedPercentage = totalContracted > 0 ? Math.round((received / totalContracted) * 100) : 0;

    return {
      totalContracted,
      received,
      toReceive,
      receivedPercentage
    };
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
      case "finalizado":
        return "default";
      case "em_pausa":
        return "secondary";
      case "cancelado":
        return "destructive";
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDocumentLabel = () => {
    if (!client) return 'Documento';
    return client.client_type === 'Pessoa Jurídica' ? 'CNPJ' : 'CPF';
  };

  const getDocumentValue = () => {
    if (!client) return '-';
    return client.client_type === 'Pessoa Jurídica' 
      ? client.cnpj || '-' 
      : client.cpf || '-';
  };

  const financialSummary = calculateFinancialSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
          <div className="p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-12 w-96 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cliente não encontrado</h1>
          <p className="text-muted-foreground mb-4">O cliente especificado não existe</p>
          <Button onClick={() => navigate('/clients')}>
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
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
                  {client.name}
                </h1>
                <p className="text-muted-foreground">
                  Detalhes completos do cliente
                </p>
              </div>
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>
                      Atualize as informações do cliente
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="client_type">Tipo de Cliente</Label>
                      <Select 
                        value={editFormData.client_type || 'Pessoa Física'} 
                        onValueChange={(value) => setEditFormData({...editFormData, client_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                          <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editFormData.client_type === 'Pessoa Física' ? (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            value={editFormData.cpf || ''}
                            onChange={(e) => setEditFormData({...editFormData, cpf: e.target.value})}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="birth_date">Data de Nascimento</Label>
                          <Input
                            id="birth_date"
                            type="date"
                            value={editFormData.birth_date || ''}
                            onChange={(e) => setEditFormData({...editFormData, birth_date: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="gender">Sexo</Label>
                          <Select 
                            value={editFormData.gender || ''} 
                            onValueChange={(value) => setEditFormData({...editFormData, gender: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Feminino">Feminino</SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input
                            id="cnpj"
                            value={editFormData.cnpj || ''}
                            onChange={(e) => setEditFormData({...editFormData, cnpj: e.target.value})}
                            placeholder="00.000.000/0000-00"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="trade_name">Nome Fantasia</Label>
                          <Input
                            id="trade_name"
                            value={editFormData.trade_name || ''}
                            onChange={(e) => setEditFormData({...editFormData, trade_name: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="state_registration">Inscrição Estadual</Label>
                          <Input
                            id="state_registration"
                            value={editFormData.state_registration || ''}
                            onChange={(e) => setEditFormData({...editFormData, state_registration: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="responsible_person">Pessoa Responsável</Label>
                          <Input
                            id="responsible_person"
                            value={editFormData.responsible_person || ''}
                            onChange={(e) => setEditFormData({...editFormData, responsible_person: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={editFormData.phone || ''}
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={editFormData.address || ''}
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={editFormData.city || ''}
                          onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={editFormData.state || ''}
                          onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="zip_code">CEP</Label>
                        <Input
                          id="zip_code"
                          value={editFormData.zip_code || ''}
                          onChange={(e) => setEditFormData({...editFormData, zip_code: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={editFormData.notes || ''}
                        onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveClient} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                      <p className="font-medium">{client.client_type || 'Pessoa Física'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DocumentIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{getDocumentLabel()}</p>
                      <p className="font-medium font-mono">{getDocumentValue()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{client.phone || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="font-medium">{client.email || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">
                        {client.address ? 
                          `${client.address}${client.city ? `, ${client.city}` : ''}${client.state ? ` - ${client.state}` : ''}${client.zip_code ? `, ${client.zip_code}` : ''}` 
                          : '-'
                        }
                      </p>
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
                      <span className="font-medium">{formatCurrency(financialSummary.totalContracted)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Valor Recebido</span>
                      <span className="font-medium text-green-600">{formatCurrency(financialSummary.received)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A Receber</span>
                      <span className="font-medium text-yellow-600">{formatCurrency(financialSummary.toReceive)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso de Pagamento</span>
                      <span className="font-medium">{financialSummary.receivedPercentage}%</span>
                    </div>
                    <Progress value={financialSummary.receivedPercentage} className="h-2" />
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
                      {projects.length > 0 ? (
                        projects.map((project) => {
                          const projectBudgets = budgets.filter(b => b.project_id === project.id);
                          const totalValue = projectBudgets.reduce((sum, budget) => sum + Number(budget.total_value), 0);
                          
                          return (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium">{project.name}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(project.status)}>
                                  {project.status === 'em_andamento' ? 'Em Andamento' : 
                                   project.status === 'finalizado' ? 'Finalizado' :
                                   project.status === 'em_pausa' ? 'Em Pausa' : 
                                   project.status === 'cancelado' ? 'Cancelado' : project.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(project.start_date)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{project.currency || 'BRL'}</Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(totalValue)}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Projeto
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Nenhum projeto encontrado para este cliente
                          </TableCell>
                        </TableRow>
                      )}
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
                    value={client.internal_notes || ''}
                    onChange={(e) => setClient({...client, internal_notes: e.target.value})}
                    className="min-h-32"
                    placeholder="Adicione observações sobre este cliente..."
                  />
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveNotes(client.internal_notes || '')}
                    >
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