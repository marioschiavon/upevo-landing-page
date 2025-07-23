import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, User, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProjectTasksTabProps {
  project: any;
  onUpdate: () => void;
}

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

// Componente para Task Card Arrastável
const DraggableTaskCard = ({ task }: { task: Task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`p-3 transition-shadow cursor-grab active:cursor-grabbing ${
        task.status === 'em_andamento' ? 'border-l-4 border-l-primary' : 
        task.status === 'concluida' ? 'border-l-4 border-l-green-500 opacity-75' : ''
      } ${isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className={`font-medium text-sm ${task.status === 'concluida' ? 'line-through' : ''}`}>
            {task.title}
          </h4>
          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
            {task.priority}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const ProjectTasksTab = ({ project, onUpdate }: ProjectTasksTabProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "media",
    status: "pendente",
    due_date: "",
  });

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [project.id]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...newTask,
          project_id: project.id,
          due_date: newTask.due_date || null,
        });

      if (error) throw error;

      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso",
      });

      setIsDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "media",
        status: "pendente",
        due_date: "",
      });
      fetchTasks();
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da tarefa foi atualizado",
      });

      fetchTasks();
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
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
      case 'concluida':
        return 'secondary';
      case 'em_andamento':
        return 'default';
      case 'pendente':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Handlers do drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    // Verifica se o status mudou
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      await handleStatusChange(taskId, newStatus);
    }
    
    setActiveId(null);
  };

  const groupTasksByStatus = () => {
    const groups = {
      pendente: filteredTasks.filter(task => task.status === 'pendente'),
      em_andamento: filteredTasks.filter(task => task.status === 'em_andamento'),
      concluida: filteredTasks.filter(task => task.status === 'concluida'),
    };
    return groups;
  };

  const taskGroups = groupTasksByStatus();

  // Componente de Coluna Droppable
  const DroppableColumn = ({ id, title, tasks, badge, children }: {
    id: string;
    title: string;
    tasks: Task[];
    badge: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id,
    });

    return (
      <Card className={`shadow-card ${isOver ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{title}</span>
            {badge}
          </CardTitle>
        </CardHeader>
        <CardContent 
          ref={setNodeRef} 
          className={`space-y-3 min-h-[200px] transition-colors ${
            isOver ? 'bg-primary/5' : ''
          }`}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {children}
          </SortableContext>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tarefas do Projeto</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskTitle">Título</Label>
                  <Input
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título da tarefa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="taskDescription">Descrição</Label>
                  <Textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva a tarefa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prioridade</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <Select value={newTask.status} onValueChange={(value) => setNewTask(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="taskDueDate">Data Limite</Label>
                  <Input
                    id="taskDueDate"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTask} disabled={!newTask.title}>
                    Criar Tarefa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quadro Kanban com Drag and Drop */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Pendente */}
          <DroppableColumn
            id="pendente"
            title="A Fazer"
            tasks={taskGroups.pendente}
            badge={<Badge variant="outline">{taskGroups.pendente.length}</Badge>}
          >
            {taskGroups.pendente.map((task) => (
              <DraggableTaskCard key={task.id} task={task} />
            ))}
            
            {taskGroups.pendente.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa pendente</p>
                <p className="text-xs mt-1">Arraste tarefas aqui</p>
              </div>
            )}
          </DroppableColumn>

          {/* Coluna Em Andamento */}
          <DroppableColumn
            id="em_andamento"
            title="Em Progresso"
            tasks={taskGroups.em_andamento}
            badge={<Badge variant="outline">{taskGroups.em_andamento.length}</Badge>}
          >
            {taskGroups.em_andamento.map((task) => (
              <DraggableTaskCard key={task.id} task={task} />
            ))}
            
            {taskGroups.em_andamento.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa em andamento</p>
                <p className="text-xs mt-1">Arraste tarefas aqui</p>
              </div>
            )}
          </DroppableColumn>

          {/* Coluna Concluída */}
          <DroppableColumn
            id="concluida"
            title="Concluído"
            tasks={taskGroups.concluida}
            badge={<Badge variant="outline">{taskGroups.concluida.length}</Badge>}
          >
            {taskGroups.concluida.map((task) => (
              <DraggableTaskCard key={task.id} task={task} />
            ))}
            
            {taskGroups.concluida.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa concluída</p>
                <p className="text-xs mt-1">Arraste tarefas aqui</p>
              </div>
            )}
          </DroppableColumn>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <DraggableTaskCard 
              task={tasks.find(t => t.id === activeId)!} 
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};