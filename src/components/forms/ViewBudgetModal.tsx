import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ViewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: any;
}

export function ViewBudgetModal({ isOpen, onClose, budget }: ViewBudgetModalProps) {
  if (!budget) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'aguardando': { variant: 'secondary' as const, label: 'Aguardando' },
      'aprovado': { variant: 'default' as const, label: 'Aprovado' },
      'recusado': { variant: 'destructive' as const, label: 'Recusado' },
      'cancelado': { variant: 'outline' as const, label: 'Cancelado' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline">
        {type === 'inicial' ? 'Inicial' : 'Adicional'}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Orçamento</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                <p className="text-sm">{budget.client_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Projeto</label>
                <p className="text-sm">{budget.project_name || 'Orçamento Inicial'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <div>{getTypeBadge(budget.type)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div>{getStatusBadge(budget.status)}</div>
              </div>
              {budget.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-sm">{budget.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor Total</label>
                <p className="text-lg font-semibold">{formatCurrency(budget.total_value)}</p>
              </div>
              {budget.payment_method && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Método de Pagamento</label>
                  <p className="text-sm capitalize">{budget.payment_method}</p>
                </div>
              )}
              {budget.down_payment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entrada</label>
                  <p className="text-sm">{formatCurrency(budget.down_payment)}</p>
                </div>
              )}
              {budget.hourly_rate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor por Hora</label>
                  <p className="text-sm">{formatCurrency(budget.hourly_rate)}</p>
                </div>
              )}
              {budget.estimated_hours && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Horas Estimadas</label>
                  <p className="text-sm">{budget.estimated_hours}h</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Information */}
          {(budget.delivery_days || budget.start_date || budget.monthly_duration) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cronograma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budget.start_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Início</label>
                    <p className="text-sm">{new Date(budget.start_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {budget.delivery_days && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prazo de Entrega</label>
                    <p className="text-sm">{budget.delivery_days} dias</p>
                  </div>
                )}
                {budget.monthly_duration && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duração Mensal</label>
                    <p className="text-sm">{budget.monthly_duration} meses</p>
                  </div>
                )}
                {budget.valid_until && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Válido Até</label>
                    <p className="text-sm">{new Date(budget.valid_until).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {budget.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{budget.observations}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Criado em: {new Date(budget.created_at).toLocaleDateString('pt-BR')}</span>
          <span>Atualizado em: {new Date(budget.updated_at).toLocaleDateString('pt-BR')}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}