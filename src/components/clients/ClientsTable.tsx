
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
}

export const ClientsTable = ({ clients }: ClientsTableProps) => {
  const navigate = useNavigate();

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
  );
};
