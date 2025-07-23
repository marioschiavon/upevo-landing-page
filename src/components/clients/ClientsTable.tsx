
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  organization_id: string;
  created_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  onUpdate: () => void;
}

export const ClientsTable = ({ clients, onUpdate }: ClientsTableProps) => {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; client: Client | null }>({
    open: false,
    client: null
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDeleteClient = async () => {
    if (!deleteDialog.client) return;

    try {
      setLoading(true);

      // Check for related projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('client_id', deleteDialog.client.id);

      if (projectsError) throw projectsError;

      if (projects && projects.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: `Este cliente possui ${projects.length} projeto(s) ativo(s). Exclua os projetos primeiro.`,
          variant: "destructive",
        });
        setDeleteDialog({ open: false, client: null });
        return;
      }

      // Check for related budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('id')
        .eq('client_id', deleteDialog.client.id);

      if (budgetsError) throw budgetsError;

      if (budgets && budgets.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: `Este cliente possui ${budgets.length} orçamento(s) ativo(s). Exclua os orçamentos primeiro.`,
          variant: "destructive",
        });
        setDeleteDialog({ open: false, client: null });
        return;
      }

      // Delete the client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deleteDialog.client.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });

      setDeleteDialog({ open: false, client: null });
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{client.email || "Não informado"}</TableCell>
                <TableCell>{client.phone || "Não informado"}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {client.notes || "Sem observações"}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialog({ open: true, client })}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, client: null })}
        onConfirm={handleDeleteClient}
        title="Excluir Cliente"
        description={
          deleteDialog.client 
            ? `Tem certeza que deseja excluir o cliente "${deleteDialog.client.name}"? Esta ação não pode ser desfeita. Certifique-se de que não há projetos ou orçamentos relacionados a este cliente.`
            : ""
        }
        loading={loading}
      />
    </Card>
  );
};
