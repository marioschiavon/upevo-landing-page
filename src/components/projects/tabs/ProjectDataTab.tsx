import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProjectMetrics } from "../ProjectMetrics";

interface ProjectDataTabProps {
  project: any;
  onUpdate: () => void;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
}

export const ProjectDataTab = ({ project, onUpdate }: ProjectDataTabProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({
    name: project.name,
    description: project.description || "",
  });

  useEffect(() => {
    // Mock notes data - in real implementation, fetch from database
    setNotes([
      {
        id: "1",
        content: "Projeto iniciado conforme cronograma estabelecido",
        created_at: project.created_at,
      }
    ]);
  }, [project]);

  const handleSaveProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editedProject.name,
          description: editedProject.description,
        })
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Projeto atualizado",
        description: "As informações do projeto foram salvas com sucesso",
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        created_at: new Date().toISOString(),
      };
      setNotes([note, ...notes]);
      setNewNote("");
      
      toast({
        title: "Observação adicionada",
        description: "A observação foi salva com sucesso",
      });
    }
  };

  const handleDeleteProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Projeto excluído",
        description: "O projeto foi removido com sucesso",
      });
      
      navigate('/projects');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas do Projeto */}
      <ProjectMetrics project={project} />
      
      {/* Informações do Projeto */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informações Gerais</CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProject}>Salvar</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Nome do Projeto</Label>
              <Input
                id="projectName"
                value={editedProject.name}
                onChange={(e) => setEditedProject(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label>Cliente</Label>
              <Input value={project.clients?.name} disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="projectDescription">Descrição</Label>
            <Textarea
              id="projectDescription"
              value={editedProject.description}
              onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Data de Criação</Label>
              <Input value={format(new Date(project.created_at), 'dd/MM/yyyy', { locale: ptBR })} disabled />
            </div>
            
            <div>
              <Label>Status</Label>
              <Input value={project.status === 'em_andamento' ? 'Em Andamento' : project.status === 'finalizado' ? 'Finalizado' : 'Pausado'} disabled />
            </div>
            
            <div>
              <Label>Organização</Label>
              <Input value={project.organizations?.name} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Adicionar nova observação..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
            />
            <Button onClick={handleAddNote} className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Perigosas */}
      <Card className="shadow-card border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Excluir Projeto</h4>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. Todos os dados relacionados serão perdidos.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="shrink-0">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Projeto
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o projeto "{project.name}"? 
                    Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90">
                    Excluir Projeto
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};