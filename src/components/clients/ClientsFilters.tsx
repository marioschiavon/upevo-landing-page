import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ClientsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clientType: string;
  setClientType: (type: string) => void;
}

export const ClientsFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  clientType, 
  setClientType 
}: ClientsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome ou CNPJ/CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={clientType} onValueChange={setClientType}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Tipo de cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="fisica">Pessoa Física</SelectItem>
          <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};