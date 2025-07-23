import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";

export const OrganizationDropdown = () => {
  const { currentOrganization, organizations, setCurrentOrganization } = useOrganization();

  if (!currentOrganization) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-48 truncate">{currentOrganization.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setCurrentOrganization(org)}
            className={`flex items-center gap-3 p-3 ${
              currentOrganization.id === org.id ? 'bg-accent' : ''
            }`}
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{org.name}</p>
              <p className="text-sm text-muted-foreground">{org.category}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};