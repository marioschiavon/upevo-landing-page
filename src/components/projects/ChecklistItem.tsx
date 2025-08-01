import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
}

interface ChecklistItemProps {
  item: ChecklistItem;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export const ChecklistItem = ({ item, onUpdate, onDelete }: ChecklistItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('task_checklists')
        .update({ is_completed: !item.is_completed })
        .eq('id', item.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      toast.error('Erro ao atualizar item do checklist');
      console.error('Error updating checklist item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!title.trim()) {
      toast.error('Título não pode estar vazio');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('task_checklists')
        .update({ title: title.trim() })
        .eq('id', item.id);

      if (error) throw error;
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Erro ao atualizar título do item');
      console.error('Error updating checklist item title:', error);
      setTitle(item.title); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitle(item.title);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
      <div className="flex items-center cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={handleToggleComplete}
        disabled={isLoading}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />

      <div className="flex-1">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <span
            className={`text-sm cursor-pointer hover:text-primary transition-colors ${
              item.is_completed ? 'line-through text-muted-foreground' : ''
            }`}
            onClick={() => setIsEditing(true)}
          >
            {item.title}
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isLoading}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-8 w-8 p-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};