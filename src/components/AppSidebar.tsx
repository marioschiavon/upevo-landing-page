import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  Banknote,
  CalendarRange,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projetos", url: "/projects", icon: FolderKanban },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Organizações", url: "/organizations", icon: Building2 },
];

const managementItems = [
  { title: "Financeiro", url: "/financial", icon: Banknote },
  { title: "Agenda", url: "/agenda", icon: CalendarRange },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { open, setOpen } = useSidebar();

  const currentPath = location.pathname;
  const isActive = (path: string) =>
    currentPath === path || (path !== "/" && currentPath.startsWith(path));

  const handleNavigation = () => {
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <Sidebar 
      collapsible="offcanvas" 
      className="border-r shadow-sm bg-gradient-to-b from-background to-muted/20"
    >
      <SidebarHeader className="border-b border-border/40">
        <div className="flex justify-center py-6 bg-gradient-to-r from-primary/5 to-accent/5">
          <img
            src="/lovable-uploads/e20659b7-17a3-4fba-a781-da7aeb501e68.png"
            alt="Upevolution logo"
            className="h-10 transition-all duration-200 hover:scale-105"
            loading="lazy"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup className="mb-6">
          <SidebarGroupLabel className="text-xs font-semibold text-brand-purple uppercase tracking-wider mb-3">
            Principais
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end 
                      onClick={handleNavigation}
                      className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/10 data-[active=true]:to-primary/5 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:shadow-sm"
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-base font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-brand-teal uppercase tracking-wider mb-3">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end 
                      onClick={handleNavigation}
                      className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/10 data-[active=true]:to-primary/5 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:shadow-sm"
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-base font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:shadow-sm w-full justify-start"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="text-base font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
