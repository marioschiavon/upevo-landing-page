import React from "react";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-svh flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 bg-background border-b">
            <div className="h-14 flex items-center gap-2 px-3">
              <SidebarTrigger />
              <div className="flex-1" />
              {/* Global actions (kept minimal to avoid duplication with page headers) */}
            </div>
          </header>
          <div className="p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
