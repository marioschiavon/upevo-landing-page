import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, TrendingDown } from "lucide-react";

interface FinancialSummaryProps {
  payments: any[];
}

export const FinancialSummary = ({ payments }: FinancialSummaryProps) => {
  const totalReceived = payments
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + Number(p.value), 0);

  const totalPending = payments
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + Number(p.value), 0);

  const overdueAmount = payments
    .filter(p => p.status === 'pendente' && new Date(p.due_date) < new Date())
    .reduce((sum, p) => sum + Number(p.value), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/10 dark:border-green-800/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalReceived)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos confirmados
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/10 dark:border-blue-800/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos pendentes
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 dark:from-red-950/20 dark:to-orange-950/10 dark:border-red-800/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Vencido</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(overdueAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos em atraso
          </p>
        </CardContent>
      </Card>
    </div>
  );
};