import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrganizationDropdown } from "@/components/OrganizationDropdown";
import { Sidebar } from "@/components/shared/Sidebar";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientsEmptyState } from "@/components/clients/ClientsEmptyState";
import { mockClientsData } from "@/data/mockClients";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("all");

  const filteredClients = mockClientsData.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.document.includes(searchTerm);
    const matchesType = clientType === "all" || client.type === clientType;
    return matchesSearch && matchesType;
  });

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
              <p className="text-muted-foreground">Gerencie todos os seus clientes e visualize informações detalhadas.</p>
            </div>
            <OrganizationDropdown />
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <Button className="mb-6">
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

          {filteredClients.length > 0 ? (
            <ClientsTable clients={filteredClients} />
          ) : (
            <ClientsEmptyState />
          )}
        </div>
      </main>
    </div>
  );
};

export default Clients;