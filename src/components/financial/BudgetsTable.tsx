import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Copy, MoreHorizontal, Plus, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ViewBudgetModal } from "@/components/forms/ViewBudgetModal";
import { EditBudgetModal } from "@/components/forms/EditBudgetModal";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BudgetsTableProps {
  budgets: any[];
  onUpdate: () => void;
  onNewBudget?: () => void;
}

interface SelectedBudget {
  budget: any;
  action: 'view' | 'edit';
}

export const BudgetsTable = ({ budgets, onUpdate, onNewBudget }: BudgetsTableProps) => {
  const [selectedBudget, setSelectedBudget] = useState<SelectedBudget | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; budget: any | null }>({
    open: false,
    budget: null
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const variants = {
      aguardando: "neutral",
      aprovado: "success",
      recusado: "destructive",
      cancelado: "outline"
    } as const;

    const labels = {
      aguardando: "Aguardando",
      aprovado: "Aprovado", 
      recusado: "Recusado",
      cancelado: "Cancelado"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline">
        {type === 'inicial' ? 'Inicial' : 'Adicional'}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportData = () => {
    // Simple CSV export
    const headers = ['Projeto', 'Cliente', 'Valor Total', 'Status', 'Tipo', 'Data de Criação'];
    const csvContent = [
      headers.join(','),
      ...budgets.map(budget => [
        budget.projects?.name || 'Orçamento Inicial',
        budget.clients?.name || '',
        budget.total_value,
        budget.status,
        budget.type,
        format(new Date(budget.created_at), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orcamentos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewBudget = (budget: any) => {
    setSelectedBudget({ budget, action: 'view' });
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudget({ budget, action: 'edit' });
  };

  const handleDuplicateBudget = async (budget: any) => {
    try {
      const duplicateData = {
        client_id: budget.client_id,
        project_id: budget.project_id,
        organization_id: budget.organization_id,
        type: budget.type,
        description: `[CÓPIA] ${budget.description || ''}`,
        total_value: budget.total_value,
        status: 'aguardando',
        currency: budget.currency || 'BRL',
        payment_method: budget.payment_method,
        down_payment: budget.down_payment,
        delivery_days: budget.delivery_days,
        hourly_rate: budget.hourly_rate,
        estimated_hours: budget.estimated_hours,
        monthly_duration: budget.monthly_duration,
        observations: budget.observations,
      };

      const { error } = await supabase
        .from('budgets')
        .insert(duplicateData);

      if (error) throw error;

      toast({
        title: "Orçamento duplicado",
        description: "O orçamento foi duplicado com sucesso.",
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error duplicating budget:', error);
      toast({
        title: "Erro ao duplicar orçamento",
        description: error.message || "Ocorreu um erro ao duplicar o orçamento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteDialog.budget) return;

    try {
      setLoading(true);

      // First check if there are related payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id')
        .eq('budget_id', deleteDialog.budget.id);

      if (paymentsError) throw paymentsError;

      // Delete related payments first
      if (payments && payments.length > 0) {
        const { error: deletePaymentsError } = await supabase
          .from('payments')
          .delete()
          .eq('budget_id', deleteDialog.budget.id);

        if (deletePaymentsError) throw deletePaymentsError;
      }

      // Then delete the budget
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', deleteDialog.budget.id);

      if (error) throw error;

      toast({
        title: "Orçamento excluído",
        description: payments && payments.length > 0 
          ? `O orçamento e ${payments.length} pagamento(s) relacionado(s) foram excluídos com sucesso.`
          : "O orçamento foi excluído com sucesso.",
      });

      setDeleteDialog({ open: false, budget: null });
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o orçamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedBudget(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orçamentos</CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" onClick={onNewBudget} disabled={!onNewBudget}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum orçamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  budgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">
                        {budget.projects?.name || 'Orçamento Inicial'}
                      </TableCell>
                      <TableCell>
                        {budget.clients?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(budget.total_value))}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(budget.status)}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(budget.type)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewBudget(budget)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBudget(budget)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateBudget(budget)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, budget })}
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
      </Card>

      {selectedBudget?.action === 'view' && (
        <ViewBudgetModal
          isOpen={true}
          onClose={closeModal}
          budget={selectedBudget.budget}
        />
      )}
      
      {selectedBudget?.action === 'edit' && (
        <EditBudgetModal
          isOpen={true}
          onClose={closeModal}
          budget={selectedBudget.budget}
          onSuccess={() => {
            onUpdate();
            closeModal();
          }}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, budget: null })}
        onConfirm={handleDeleteBudget}
        title="Excluir Orçamento"
        description={
          deleteDialog.budget 
            ? `Tem certeza que deseja excluir o orçamento "${deleteDialog.budget.description || 'N/A'}" de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deleteDialog.budget.total_value))}? Todos os pagamentos relacionados também serão excluídos. Esta ação não pode ser desfeita.`
            : ""
        }
        loading={loading}
      />
    </>
  );
};