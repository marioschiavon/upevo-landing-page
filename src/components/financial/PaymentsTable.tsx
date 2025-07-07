import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Download, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentsTableProps {
  payments: any[];
  onUpdate: () => void;
}

export const PaymentsTable = ({ payments, onUpdate }: PaymentsTableProps) => {
  const [loading, setLoading] = useState(false);

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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {payment.status !== 'pago' && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
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
  );
};