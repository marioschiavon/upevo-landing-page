
import { Button } from "@/components/ui/button";
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
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface SidebarItem {
  icon: any;
  label: string;
  path?: string;
  active?: boolean;
}

interface SidebarProps {
  activeItem?: string;
}

export const Sidebar = ({ activeItem }: SidebarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    console.log('Iniciando logout no Sidebar...');
    
    try {
      await signOut();
      // O redirecionamento será feito automaticamente pelo AuthContext
    } catch (error) {
      console.error('Erro durante o logout:', error);
      setIsLoggingOut(false);
    }
  };

  const sidebarItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: activeItem === "dashboard" },
    { icon: FolderOpen, label: "Projetos", path: "/projects", active: activeItem === "projects" },
    { icon: Users, label: "Clientes", path: "/clients", active: activeItem === "clients" },
    { icon: Building2, label: "Organização", path: "/organizations", active: activeItem === "organizations" },
    { icon: Wallet, label: "Financeiro", path: "/financial", active: activeItem === "financial" },
    { icon: BarChart3, label: "Relatórios" },
    { icon: Bell, label: "Avisos" },
    { icon: Calendar, label: "Agenda" },
    { icon: FileText, label: "Contratos" },
    { icon: Headphones, label: "Suporte" },
    { icon: Settings, label: "Configurações" },
  ];

  return (
    <aside className="w-64 bg-card border-r shadow-card">
      <div className="p-6">
        <img 
          src="/lovable-uploads/e20659b7-17a3-4fba-a781-da7aeb501e68.png" 
          alt="Upevolution Logo" 
          className="h-8"
        />
      </div>
      
      <nav className="px-4 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              item.active 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors mt-8 ${
            isLoggingOut 
              ? 'text-muted-foreground/50 cursor-not-allowed' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">
            {isLoggingOut ? 'Saindo...' : 'Logout'}
          </span>
        </button>
      </nav>
    </aside>
  );
};
