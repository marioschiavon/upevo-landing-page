import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Flag, Trash2, Edit3, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskChecklistSection } from "./TaskChecklistSection";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  priority: 'baixa' | 'media' | 'alta';
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
}

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const TaskDetailModal = ({ task, open, onOpenChange, onUpdate }: TaskDetailModalProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  if (!task) return null;

  const startEdit = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditedTask({});
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!editedTask.title?.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editedTask.title,
          description: editedTask.description || '',
          priority: editedTask.priority,
          status: editedTask.status,
          due_date: editedTask.due_date || null,
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso",
      });

      setDeleteDialogOpen(false);
      onOpenChange(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'default';
      case 'baixa':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'success';
      case 'in_progress':
        return 'neutral';
      case 'todo':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag className={`h-4 w-4 ${
      priority === 'alta' ? 'text-destructive' : 
      priority === 'media' ? 'text-primary' : 
      'text-muted-foreground'
    }`} />;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editedTask.title || ''}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg font-semibold"
                    placeholder="Título da tarefa"
                  />
                ) : (
                  <DialogTitle className="text-xl">{task.title}</DialogTitle>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {!isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={startEdit}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={saveChanges} disabled={loading}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Status e Prioridade */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Select 
                    value={editedTask.status} 
                    onValueChange={(value) => setEditedTask(prev => ({ ...prev, status: value as Task['status'] }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="done">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={editedTask.priority} 
                    onValueChange={(value) => setEditedTask(prev => ({ ...prev, priority: value as Task['priority'] }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status === 'todo' ? 'Pendente' : 
                     task.status === 'in_progress' ? 'Em Andamento' : 'Concluída'}
                  </Badge>
                  
                  <Badge variant={getPriorityColor(task.priority)} className="flex items-center gap-1">
                    {getPriorityIcon(task.priority)}
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Descrição */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Descrição</Label>
              {isEditing ? (
                <Textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva a tarefa..."
                  className="min-h-[100px]"
                />
              ) : (
                <div className="bg-muted/30 rounded-md p-3 min-h-[60px]">
                  {task.description || (
                    <span className="text-muted-foreground italic">Nenhuma descrição</span>
                  )}
                </div>
              )}
            </div>

            {/* Data de Vencimento */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Data de Vencimento</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedTask.due_date || ''}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {task.due_date ? (
                    <span>{format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  ) : (
                    <span className="text-muted-foreground">Não definida</span>
                  )}
                </div>
              )}
            </div>

            {/* Checklist Section */}
            <div className="border-t pt-4">
              <TaskChecklistSection taskId={task.id} />
            </div>

            {/* Informações de Criação */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Criada em {format(new Date(task.created_at), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={deleteTask}
        title="Excluir Tarefa"
        description={`Tem certeza que deseja excluir a tarefa "${task.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        loading={isDeleting}
      />
    </>
  );
};