import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flag, Clock, Edit3, Trash2, AlertTriangle, CheckSquare } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";

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

interface EnhancedTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const EnhancedTaskCard = ({ task, onEdit, onDelete }: EnhancedTaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [checklistStats, setChecklistStats] = useState<{ total: number; completed: number } | null>(null);
  
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

  // Fetch checklist stats
  useEffect(() => {
    const fetchChecklistStats = async () => {
      try {
        const { data, error } = await supabase
          .from('task_checklists')
          .select('is_completed')
          .eq('task_id', task.id);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const total = data.length;
          const completed = data.filter(item => item.is_completed).length;
          setChecklistStats({ total, completed });
        } else {
          setChecklistStats(null);
        }
      } catch (error) {
        console.error('Error fetching checklist stats:', error);
        setChecklistStats(null);
      }
    };

    fetchChecklistStats();
  }, [task.id]);

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'alta':
        return {
          variant: 'destructive' as const,
          icon: <Flag className="h-3 w-3" />,
          gradient: 'from-red-500/15 to-pink-500/10',
          border: 'border-l-red-500',
          glow: 'shadow-red-500/20'
        };
      case 'media':
        return {
          variant: 'purple' as const,
          icon: <Flag className="h-3 w-3" />,
          gradient: 'from-brand-purple/15 to-purple-500/10',
          border: 'border-l-brand-purple',
          glow: 'shadow-purple/20'
        };
      case 'baixa':
        return {
          variant: 'teal' as const,
          icon: <Flag className="h-3 w-3" />,
          gradient: 'from-brand-teal/15 to-teal-500/10',
          border: 'border-l-brand-teal',
          glow: 'shadow-info/20'
        };
      default:
        return {
          variant: 'default' as const,
          icon: <Flag className="h-3 w-3" />,
          gradient: 'from-gray-500/10 to-gray-600/5',
          border: 'border-l-gray-500',
          glow: ''
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'concluida':
        return {
          style: 'opacity-75 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-950/20',
          border: 'border-l-4 border-l-green-500'
        };
      case 'em_andamento':
        return {
          style: 'bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-950/30 dark:to-indigo-950/20',
          border: 'border-l-4 border-l-blue-500'
        };
      case 'pendente':
        return {
          style: 'bg-gradient-to-br from-orange-50 to-amber-100/50 dark:from-orange-950/30 dark:to-amber-950/20',
          border: 'border-l-4 border-l-orange-400'
        };
      default:
        return {
          style: '',
          border: ''
        };
    }
  };

  const getDueDateStatus = () => {
    if (!task.due_date) return null;
    
    const dueDate = new Date(task.due_date);
    const isOverdue = isPast(dueDate) && !isToday(dueDate);
    const isDueToday = isToday(dueDate);
    
    if (isOverdue) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <AlertTriangle className="h-3 w-3" />,
        label: 'Atrasada'
      };
    } else if (isDueToday) {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: <Clock className="h-3 w-3" />,
        label: 'Hoje'
      };
    }
    
    return {
      color: 'text-muted-foreground',
      bgColor: '',
      icon: <Calendar className="h-3 w-3" />,
      label: format(dueDate, 'dd/MM', { locale: ptBR })
    };
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const dueDateStatus = getDueDateStatus();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent drag when clicking action buttons
    if (e.target instanceof HTMLElement && e.target.closest('[data-action-button]')) {
      e.stopPropagation();
      return;
    }
    
    onEdit(task);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task);
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200
        ${statusConfig.style} ${statusConfig.border}
        ${isDragging ? 'opacity-50 shadow-2xl scale-105 rotate-2' : `hover:shadow-lg hover:-translate-y-1 ${priorityConfig.glow ? `hover:${priorityConfig.glow}` : ''}`}
        ${task.status === 'done' ? 'saturate-50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${priorityConfig.gradient} opacity-30`} />
      
      <div className="relative p-4 space-y-3">
        {/* Header with title and priority */}
        <div className="flex items-start justify-between gap-2">
          <h4 className={`font-medium text-sm leading-tight flex-1 ${
            task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
          }`}>
            {task.title}
          </h4>
          
          <Badge variant={priorityConfig.variant} className="flex items-center gap-1 text-xs px-2 py-1">
            {priorityConfig.icon}
            <span className="hidden sm:inline">
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </Badge>
        </div>
        
        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Checklist Progress */}
        {checklistStats && checklistStats.total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {checklistStats.completed}/{checklistStats.total}
              </span>
            </div>
            <Progress 
              value={(checklistStats.completed / checklistStats.total) * 100} 
              className="h-1.5"
            />
          </div>
        )}
        
        {/* Footer with due date and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dueDateStatus && (
              <div className={`
                flex items-center gap-1 text-xs px-2 py-1 rounded-md
                ${dueDateStatus.bgColor} ${dueDateStatus.color}
              `}>
                {dueDateStatus.icon}
                <span>{dueDateStatus.label}</span>
              </div>
            )}
          </div>
          
          {/* Quick Actions - Only show on hover */}
          <div className={`
            flex items-center gap-1 transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-primary/10"
              onClick={handleEdit}
              data-action-button
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
              data-action-button
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Status indicator dot */}
        <div className="absolute top-2 right-2">
          <div className={`
            w-2 h-2 rounded-full shadow-sm ${
              task.status === 'concluida' ? 'bg-green-500' : 
              task.status === 'em_andamento' ? 'bg-blue-500' : 'bg-orange-400'
            }
          `} />
        </div>
      </div>
    </Card>
  );
};