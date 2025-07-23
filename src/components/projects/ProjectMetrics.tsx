import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Target, DollarSign } from "lucide-react";

interface ProjectMetricsProps {
  project: any;
}

export const ProjectMetrics = ({ project }: ProjectMetricsProps) => {
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((task: any) => task.status === 'concluida').length || 0;
  const totalBudgetValue = project.budgets?.reduce((acc: number, budget: any) => 
    budget.status === 'aprovado' ? acc + Number(budget.total_value) : acc, 0) || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Total de Tarefas</span>
          </div>
          <div className="text-2xl font-bold text-primary">{totalTasks}</div>
        </CardContent>
      </Card>

      <Card className="bg-green-500/10 border-green-500/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Tarefas Concluídas</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
        </CardContent>
      </Card>

      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Valor Aprovado</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: project.budgets?.[0]?.currency || 'BRL'
            }).format(totalBudgetValue)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};