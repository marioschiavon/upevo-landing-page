import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, FileText, Calendar, Eye, Copy, Edit, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectFinancialTabProps {
  project: any;
  onUpdate: () => void;
}

interface Budget {
  id: string;
  type: string;
  description: string;
  total_value: number;
  status: string;
  delivery_days: number;
  currency: string;
  created_at: string;
}

interface Payment {
  id: string;
  description: string;
  value: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  created_at: string;
}

export const ProjectFinancialTab = ({ project, onUpdate }: ProjectFinancialTabProps) => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [project.id]);

  const fetchFinancialData = async () => {
    try {
      // Buscar orçamentos
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (budgetsError) throw budgetsError;

      // Buscar pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('project_id', project.id)
        .order('due_date', { ascending: true });

      if (paymentsError) throw paymentsError;

      setBudgets(budgetsData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
      case 'pago':
        return 'secondary';
      case 'aguardando':
      case 'pendente':
        return 'default';
      case 'recusado':
      case 'vencido':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'aguardando': 'Aguardando',
      'aprovado': 'Aprovado',
      'recusado': 'Recusado',
      'pendente': 'Pendente',
      'pago': 'Pago',
      'parcial': 'Parcial',
      'vencido': 'Vencido',
    };
    return labels[status] || status;
  };

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const getTotalApproved = () => {
    return budgets
      .filter(budget => budget.status === 'aprovado')
      .reduce((acc, budget) => acc + Number(budget.total_value), 0);
  };

  const getTotalReceived = () => {
    return payments
      .filter(payment => payment.status === 'pago')
      .reduce((acc, payment) => acc + Number(payment.value), 0);
  };

  const getTotalPending = () => {
    return payments
      .filter(payment => payment.status === 'pendente')
      .reduce((acc, payment) => acc + Number(payment.value), 0);
  };

  const pendingPayments = payments.filter(p => p.status === 'pendente');
  const receivedPayments = payments.filter(p => p.status === 'pago');

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Aprovado</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(getTotalApproved(), budgets[0]?.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(getTotalReceived(), budgets[0]?.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(getTotalPending(), budgets[0]?.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas Financeiras */}
      <Card className="shadow-card">
        <Tabs defaultValue="budgets">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="budgets" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Orçamentos
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pagamentos
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="budgets" className="mt-0">
              {budgets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {budget.type === 'inicial' ? 'Inicial' : 'Adicional'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{budget.description || 'Orçamento'}</p>
                            <p className="text-xs text-muted-foreground">ID: {budget.id.slice(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(budget.total_value, budget.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(budget.status)}>
                            {getStatusLabel(budget.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {budget.delivery_days ? `${budget.delivery_days} dias` : '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
                  <p className="text-muted-foreground">
                    Os orçamentos aparecerão aqui quando forem criados para este projeto.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <div className="space-y-6">
                {/* Pagamentos Pendentes */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Pagamentos a Receber ({pendingPayments.length})
                  </h3>
                  
                  {pendingPayments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{payment.description}</p>
                                <p className="text-xs text-muted-foreground">ID: {payment.id.slice(0, 8)}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(payment.value, budgets[0]?.currency)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(payment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(payment.status)}>
                                {getStatusLabel(payment.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Card className="p-6 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum pagamento pendente</p>
                    </Card>
                  )}
                </div>

                {/* Pagamentos Recebidos */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pagamentos Recebidos ({receivedPayments.length})
                  </h3>
                  
                  {receivedPayments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Data do Pagamento</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receivedPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{payment.description}</p>
                                <p className="text-xs text-muted-foreground">ID: {payment.id.slice(0, 8)}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(payment.value, budgets[0]?.currency)}
                            </TableCell>
                            <TableCell>
                              {payment.paid_date 
                                ? format(new Date(payment.paid_date), 'dd/MM/yyyy', { locale: ptBR })
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(payment.status)}>
                                {getStatusLabel(payment.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Card className="p-6 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum pagamento recebido</p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};