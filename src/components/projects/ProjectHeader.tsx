import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Clock, CheckCircle, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectHeaderProps {
  project: any;
  onUpdate: () => void;
}

export const ProjectHeader = ({ project, onUpdate }: ProjectHeaderProps) => {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status do projeto foi atualizado com sucesso",
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'default';
      case 'concluida':
        return 'secondary';
      case 'pausado':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluído';
      case 'pausado':
        return 'Pausado';
      default:
        return status;
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
              <p className="text-sm text-muted-foreground font-mono">ID: {project.id.slice(0, 8)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{project.clients?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {format(new Date(project.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tempo Trabalhado</p>
                <p className="font-medium">
                  {Math.ceil((Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Organização</p>
                <p className="font-medium">{project.organizations?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {project.description && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};