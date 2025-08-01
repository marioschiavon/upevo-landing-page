import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistItem } from "./ChecklistItem";

interface ChecklistItemType {
  id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
}

interface TaskChecklistSectionProps {
  taskId: string;
}

export const TaskChecklistSection = ({ taskId }: TaskChecklistSectionProps) => {
  const [items, setItems] = useState<ChecklistItemType[]>([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const fetchChecklistItems = async () => {
    try {
      const { data, error } = await supabase
        .from('task_checklists')
        .select('*')
        .eq('task_id', taskId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching checklist items:', error);
    }
  };

  useEffect(() => {
    fetchChecklistItems();
  }, [taskId]);

  const completedCount = items.filter(item => item.is_completed).length;
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) {
      toast.error('Título não pode estar vazio');
      return;
    }

    setIsLoading(true);
    try {
      const nextOrder = items.length > 0 ? Math.max(...items.map(item => item.order_index)) + 1 : 0;
      
      const { error } = await supabase
        .from('task_checklists')
        .insert({
          task_id: taskId,
          title: newItemTitle.trim(),
          order_index: nextOrder
        });

      if (error) throw error;
      
      setNewItemTitle("");
      setIsAddingItem(false);
      await fetchChecklistItems();
      toast.success('Item adicionado ao checklist');
    } catch (error) {
      toast.error('Erro ao adicionar item ao checklist');
      console.error('Error adding checklist item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('task_checklists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      await fetchChecklistItems();
      toast.success('Item removido do checklist');
    } catch (error) {
      toast.error('Erro ao remover item do checklist');
      console.error('Error deleting checklist item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    } else if (e.key === 'Escape') {
      setNewItemTitle("");
      setIsAddingItem(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Checklist</h3>
          {items.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {completedCount}/{items.length}
            </span>
          )}
        </div>
        
        {!isAddingItem && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingItem(true)}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Item
          </Button>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {progressPercentage.toFixed(0)}% concluído
          </p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onUpdate={fetchChecklistItems}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {isAddingItem && (
        <div className="flex gap-2">
          <Input
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite o título do item..."
            disabled={isLoading}
            autoFocus
            className="flex-1"
          />
          <Button
            onClick={handleAddItem}
            disabled={isLoading || !newItemTitle.trim()}
            size="sm"
          >
            Adicionar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setNewItemTitle("");
              setIsAddingItem(false);
            }}
            disabled={isLoading}
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      )}

      {items.length === 0 && !isAddingItem && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum item no checklist</p>
          <p className="text-sm">Adicione itens para acompanhar o progresso da tarefa</p>
        </div>
      )}
    </div>
  );
};