import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Download, CheckCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { EditPaymentModal } from "@/components/forms/EditPaymentModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentsTableProps {
  payments: any[];
  onUpdate: () => void;
}

export const PaymentsTable = ({ payments, onUpdate }: PaymentsTableProps) => {
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; payment: any | null }>({
    open: false,
    payment: null
  });
  const [editModal, setEditModal] = useState<{ open: boolean; payment: any | null }>({
    open: false,
    payment: null
  });
  const { toast } = useToast();

  const getStatusBadge = (payment: any) => {
    const status = payment.status;
    const dueDate = new Date(payment.due_date);
    const isOverdue = status === 'pendente' && dueDate < new Date();

    if (isOverdue) {
      return <Badge variant="destructive">Vencido</Badge>;
    }

    const variants = {
      pendente: "secondary",
      pago: "default",
      parcial: "outline"
    } as const;

    const labels = {
      pendente: "Em Aberto",
      pago: "Pago",
      parcial: "Parcial"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPaymentMethod = (method: string) => {
    const methods = {
      pix: 'PIX',
      cartao: 'Cartão',
      transferencia: 'Transferência',
      boleto: 'Boleto',
      dinheiro: 'Dinheiro'
    };
    return methods[method as keyof typeof methods] || method || '-';
  };

  const handleMarkAsPaid = async (payment: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'pago',
          paid_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast({
        title: "Pagamento atualizado",
        description: "O pagamento foi marcado como pago.",
      });

      onUpdate();
    } catch (error) {
      console.error('Erro ao marcar pagamento como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deleteDialog.payment) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', deleteDialog.payment.id);

      if (error) throw error;

      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi excluído com sucesso.",
      });

      setDeleteDialog({ open: false, payment: null });
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const headers = ['Projeto', 'Cliente', 'Valor', 'Vencimento', 'Status', 'Pagamento', 'Forma Pagamento'];
    const csvContent = [
      headers.join(','),
      ...payments.map(payment => [
        payment.projects?.name || '',
        payment.projects?.clients?.name || '',
        payment.value,
        format(new Date(payment.due_date), 'dd/MM/yyyy'),
        payment.status,
        payment.paid_date ? format(new Date(payment.paid_date), 'dd/MM/yyyy') : '',
        payment.payment_method || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pagamentos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pagamentos</CardTitle>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead>Forma Pagamento</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.projects?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {payment.projects?.clients?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(payment.value))}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment)}
                    </TableCell>
                    <TableCell>
                      {payment.paid_date 
                        ? format(new Date(payment.paid_date), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {formatPaymentMethod(payment.payment_method)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {payment.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditModal({ open: true, payment })}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {payment.status !== 'pago' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(payment)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialog({ open: true, payment })}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <EditPaymentModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ open, payment: open ? editModal.payment : null })}
        payment={editModal.payment}
        onUpdate={onUpdate}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, payment: null })}
        onConfirm={handleDeletePayment}
        title="Excluir Pagamento"
        description={
          deleteDialog.payment 
            ? `Tem certeza que deseja excluir o pagamento de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deleteDialog.payment.value))} do projeto "${deleteDialog.payment.projects?.name || 'N/A'}"? Esta ação não pode ser desfeita.`
            : ""
        }
        loading={loading}
      />
    </Card>
  );
};