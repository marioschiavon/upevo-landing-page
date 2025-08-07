import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Building2, 
  BarChart3, 
  Wallet, 
  Bell, 
  Calendar, 
  FileText, 
  Headphones, 
  Settings, 
  LogOut,
  Search,
  Plus,
  Eye,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import { NewOrganizationModal } from "@/components/forms/NewOrganizationModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Organizations = () => {
  const navigate = useNavigate();
  const { organizations, setOrganizations } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [orgType, setOrgType] = useState("all");
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [realOrganizations, setRealOrganizations] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          description,
          category,
          logo_url,
          created_at,
          owner_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRealOrganizations(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar organizações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as organizações",
        variant: "destructive",
      });
    }
  };

  const handleOrganizationCreated = async (organizationId: string) => {
    await fetchOrganizations();
    navigate(`/organizations/${organizationId}`);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const filteredOrganizations = realOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (org.category && org.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = orgType === "all" || org.category === orgType;
    return matchesSearch && matchesType;
  });


  return (
    <div className="min-h-screen bg-background flex">
      

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Organizações
            </h1>
            <p className="text-muted-foreground mb-6">
              Gerencie suas organizações e alterne entre diferentes contextos de trabalho.
            </p>
            
            <Button className="mb-6" onClick={() => setIsNewOrgModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou área de atuação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={orgType} onValueChange={setOrgType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de organização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Consultoria">Consultoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizations Table */}
          {filteredOrganizations.length > 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome da Organização</TableHead>
                      <TableHead>Área de Atuação</TableHead>
                      <TableHead>Projetos</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-32">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-mono text-sm">ORG-{org.id.toString().padStart(3, '0')}</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-3">
                             {org.logo_url ? (
                               <img 
                                 src={org.logo_url} 
                                 alt={`Logo ${org.name}`}
                                 className="w-8 h-8 rounded-lg object-cover"
                               />
                             ) : (
                               <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                 <Building2 className="h-4 w-4 text-primary" />
                               </div>
                             )}
                             <span className="font-medium">{org.name}</span>
                           </div>
                         </TableCell>
                         <TableCell>
                           <Badge variant="secondary">{org.category || "Sem categoria"}</Badge>
                         </TableCell>
                         <TableCell>
                           <Badge variant="outline">0</Badge>
                         </TableCell>
                         <TableCell className="max-w-xs truncate text-muted-foreground">
                           {org.description || "Sem descrição"}
                         </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/organizations/${org.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            // Empty State
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma organização encontrada</h3>
                <p className="text-muted-foreground">
                  Ajuste os filtros ou crie uma nova organização.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <NewOrganizationModal
        isOpen={isNewOrgModalOpen}
        onClose={() => setIsNewOrgModalOpen(false)}
        onSuccess={handleOrganizationCreated}
      />
    </div>
  );
};

export default Organizations;