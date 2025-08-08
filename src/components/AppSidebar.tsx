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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  Banknote,
  CalendarRange,
  FileText,
  LifeBuoy,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projetos", url: "/projects", icon: FolderKanban },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Organizações", url: "/organizations", icon: Building2 },
  { title: "Financeiro", url: "/financial", icon: Banknote },
  { title: "Agenda", url: "/agenda", icon: CalendarRange },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const currentPath = location.pathname;
  const isActive = (path: string) =>
    currentPath === path || (path !== "/" && currentPath.startsWith(path));

  return (
    <Sidebar collapsible="offcanvas" className="w-60">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <img
            src="/lovable-uploads/e20659b7-17a3-4fba-a781-da7aeb501e68.png"
            alt="Upevolution logo"
            className="h-6"
            loading="lazy"
          />
          <span className="text-sm font-medium">Upevolution</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
