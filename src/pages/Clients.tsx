
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";
import { Sidebar } from "@/components/shared/Sidebar";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientsEmptyState } from "@/components/clients/ClientsEmptyState";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  organization_id: string;
  created_at: string;
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("all");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (currentOrganization) {
      fetchClients();
    }
  }, [currentOrganization]);

  const fetchClients = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientCreated = async () => {
    await fetchClients();
    toast({
      title: "Cliente cadastrado",
      description: "O cliente foi cadastrado com sucesso!",
    });
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (client.phone && client.phone.includes(searchTerm));
    return matchesSearch;
  });

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar activeItem="clients" />
        <main className="flex-1 overflow-auto">
          <header className="bg-card border-b shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
                <p className="text-muted-foreground">Selecione uma organização para visualizar os clientes.</p>
              </div>
              <OrganizationDropdown />
            </div>
          </header>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeItem="clients" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header com dropdown de organização */}
        <header className="bg-card border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
              <p className="text-muted-foreground">Gerencie todos os clientes de {currentOrganization.name}.</p>
            </div>
            <OrganizationDropdown />
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <Button className="mb-6" onClick={() => setIsNewClientModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          <ClientsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clientType={clientType}
            setClientType={setClientType}
          />

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredClients.length > 0 ? (
            <ClientsTable clients={filteredClients} />
          ) : (
            <ClientsEmptyState />
          )}
        </div>
      </main>

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSuccess={handleClientCreated}
        organizations={[{ id: currentOrganization.id, name: currentOrganization.name }]}
      />
    </div>
  );
};

export default Clients;
