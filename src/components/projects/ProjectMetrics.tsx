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
      <Card className="bg-gradient-to-br from-brand-purple/10 to-brand-purple/5 border-brand-purple/20 shadow-purple/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-4 w-4 text-brand-purple" />
            <span className="text-sm font-medium text-brand-purple">Total de Tarefas</span>
          </div>
          <div className="text-2xl font-bold text-brand-purple">{totalTasks}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 shadow-success/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Tarefas Concluídas</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-brand-teal/10 to-cyan-500/5 border-brand-teal/20 shadow-info/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-brand-teal" />
            <span className="text-sm font-medium text-brand-teal">Valor Aprovado</span>
          </div>
          <div className="text-xl font-bold text-brand-teal">
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