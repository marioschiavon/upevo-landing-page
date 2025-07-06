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
      case 'finalizado':
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
      case 'finalizado':
        return 'Finalizado';
      case 'pausado':
        return 'Pausado';
      default:
        return status;
    }
  };

  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((task: any) => task.status === 'concluida').length || 0;
  const totalBudgetValue = project.budgets?.reduce((acc: number, budget: any) => 
    budget.status === 'aprovado' ? acc + Number(budget.total_value) : acc, 0) || 0;

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-4">
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
                    <SelectItem value="finalizado">Finalizado</SelectItem>
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

          {/* Indicadores */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{totalTasks}</div>
                  <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: project.budgets?.[0]?.currency || 'BRL'
                    }).format(totalBudgetValue)}
                  </div>
                  <p className="text-sm text-muted-foreground">Valor Aprovado</p>
                </CardContent>
              </Card>
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