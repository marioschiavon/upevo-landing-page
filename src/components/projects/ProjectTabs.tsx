import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectDataTab } from "./tabs/ProjectDataTab";
import { ProjectTasksTab } from "./tabs/ProjectTasksTab";
import { ProjectFinancialTab } from "./tabs/ProjectFinancialTab";
import { ProjectDocumentsTab } from "./tabs/ProjectDocumentsTab";
import { TimeTracker } from "./TimeTracker";
import { FileText, CheckSquare, DollarSign, FolderOpen, Clock } from "lucide-react";

interface ProjectTabsProps {
  project: any;
  onUpdate: () => void;
}

export const ProjectTabs = ({ project, onUpdate }: ProjectTabsProps) => {
  return (
    <Tabs defaultValue="data" className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-12">
        <TabsTrigger value="data" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Dados</span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Tarefas</span>
        </TabsTrigger>
        <TabsTrigger value="time" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Tempo</span>
        </TabsTrigger>
        <TabsTrigger value="financial" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Financeiro</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Documentos</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="data">
          <ProjectDataTab project={project} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="tasks">
          <ProjectTasksTab project={project} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="time">
          <TimeTracker projectId={project.id} projectName={project.name} />
        </TabsContent>
        
        <TabsContent value="financial">
          <ProjectFinancialTab project={project} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="documents">
          <ProjectDocumentsTab project={project} onUpdate={onUpdate} />
        </TabsContent>
      </div>
    </Tabs>
  );
};