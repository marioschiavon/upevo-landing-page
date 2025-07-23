
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationDataTab } from "./tabs/OrganizationDataTab";
import { OrganizationProjectsTab } from "./tabs/OrganizationProjectsTab";
import { OrganizationClientsTab } from "./tabs/OrganizationClientsTab";
import { OrganizationUsersTab } from "./tabs/OrganizationUsersTab";
import { FileText, FolderOpen, Users, Building2 } from "lucide-react";

interface OrganizationTabsProps {
  organization: any;
  onUpdate: () => void;
}

export const OrganizationTabs = ({ organization, onUpdate }: OrganizationTabsProps) => {
  return (
    <Tabs defaultValue="data" className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-12">
        <TabsTrigger value="data" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Dados</span>
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Projetos</span>
        </TabsTrigger>
        <TabsTrigger value="clients" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Clientes</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Usuários</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="data">
          <OrganizationDataTab organization={organization} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="projects">
          <OrganizationProjectsTab organization={organization} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="clients">
          <OrganizationClientsTab organization={organization} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="users">
          <OrganizationUsersTab organization={organization} />
        </TabsContent>
      </div>
    </Tabs>
  );
};
