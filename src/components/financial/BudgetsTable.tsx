import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Copy, MoreHorizontal, Plus, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BudgetsTableProps {
  budgets: any[];
  onUpdate: () => void;
}

export const BudgetsTable = ({ budgets, onUpdate }: BudgetsTableProps) => {
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      aguardando: "secondary",
      aprovado: "default",
      recusado: "destructive"
    } as const;

    const labels = {
      aguardando: "Aguardando",
      aprovado: "Aprovado", 
      recusado: "Recusado"
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
        budget.projects?.name || '',
        budget.projects?.clients?.name || '',
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Orçamentos</CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" disabled>
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
                      {budget.projects?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {budget.projects?.clients?.name || '-'}
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
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
  );
};