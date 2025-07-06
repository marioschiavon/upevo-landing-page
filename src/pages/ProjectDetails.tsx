import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients!projects_client_id_fkey(name, email, phone),
          organizations!projects_organization_id_fkey(name),
          tasks(id, status),
          budgets(id, status, total_value, currency)
        `)
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o projeto",
          variant: "destructive",
        });
        navigate('/projects');
        return;
      }

      setProject(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeItem="projects" />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeItem="projects" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Projeto não encontrado</h2>
            <p className="text-muted-foreground">O projeto solicitado não existe ou você não tem permissão para visualizá-lo.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeItem="projects" />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Detalhes do Projeto</h1>
              <p className="text-muted-foreground">Gerencie todas as informações do projeto</p>
            </div>
            <OrganizationDropdown />
          </div>
        </header>

        <div className="p-6 space-y-6">
          <ProjectHeader project={project} onUpdate={fetchProject} />
          <ProjectTabs project={project} onUpdate={fetchProject} />
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;