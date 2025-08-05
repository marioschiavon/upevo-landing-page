import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, Trash2, ExternalLink, User, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any;
  selectedDate?: string | null;
  onSave: (eventData: any) => void;
  onDelete?: () => void;
  loading?: boolean;
  isGoogleConnected?: boolean;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete,
  loading = false,
  isGoogleConnected = false,
}: EventModalProps) {
  const { currentOrganization } = useOrganization();
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    client_id: '',
    project_id: '',
    syncWithGoogle: false,
  });

  useEffect(() => {
    if (currentOrganization && isOpen) {
      fetchClientsAndProjects();
    }
  }, [currentOrganization, isOpen]);

  const fetchClientsAndProjects = async () => {
    if (!currentOrganization) return;

    try {
      const [clientsResponse, projectsResponse] = await Promise.all([
        supabase
          .from('clients')
          .select('id, name')
          .eq('organization_id', currentOrganization.id)
          .eq('is_active', true),
        supabase
          .from('projects')
          .select('id, name, clients(name)')
          .eq('organization_id', currentOrganization.id)
      ]);

      if (clientsResponse.data) setClients(clientsResponse.data);
      if (projectsResponse.data) setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error fetching clients and projects:', error);
    }
  };

  useEffect(() => {
    if (event) {
      // Editing existing event
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      setFormData({
        title: event.title,
        description: event.extendedProps?.description || '',
        start_time: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        client_id: '',
        project_id: '',
        syncWithGoogle: event.extendedProps?.origin === 'google',
      });
    } else if (selectedDate) {
      // Creating new event for selected date
      const date = new Date(selectedDate);
      const startTime = new Date(date);
      startTime.setHours(9, 0, 0, 0); // Default to 9 AM
      const endTime = new Date(startTime);
      endTime.setHours(10, 0, 0, 0); // Default to 1 hour duration

      setFormData({
        title: '',
        description: '',
        start_time: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        client_id: '',
        project_id: '',
        syncWithGoogle: false,
      });
    } else {
      // Creating new event without specific date
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      setFormData({
        title: '',
        description: '',
        start_time: format(now, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(oneHourLater, "yyyy-MM-dd'T'HH:mm"),
        client_id: '',
        project_id: '',
        syncWithGoogle: false,
      });
    }
  }, [event, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) {
      return;
    }

    onSave({
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
    });
  };

  const isEditing = !!event;
  const isGoogleEvent = event?.extendedProps?.origin === 'google';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
            {isGoogleEvent && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <ExternalLink className="h-3 w-3 mr-1" />
                Google
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título do evento"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Início *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fim *
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value, project_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Projeto
              </Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum projeto</SelectItem>
                  {projects
                    .filter(project => !formData.client_id || project.clients?.id === formData.client_id)
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Adicione uma descrição (opcional)"
              rows={3}
            />
          </div>

          {isGoogleConnected && !isGoogleEvent && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sync"
                checked={formData.syncWithGoogle}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, syncWithGoogle: checked as boolean })
                }
              />
              <Label htmlFor="sync" className="text-sm">
                Sincronizar com Google Calendar
              </Label>
            </div>
          )}

          <DialogFooter className="gap-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={loading}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}