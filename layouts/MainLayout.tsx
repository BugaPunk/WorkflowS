import type { ComponentChildren } from "preact";
import { PublicLayout } from "./PublicLayout.tsx";

import { AppContent } from "../components/AppContent.tsx";
import { SidebarInset } from "../components/ui/sidebar.tsx";
import AppShell from "../islands/AppShell.tsx";
import AppSidebar from "../islands/AppSidebar.tsx";
import type { UserRole } from "../models/user.ts";

interface MainLayoutProps {
  children: ComponentChildren;
  title?: string;
  session?: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export function MainLayout({ children, title = "WorkflowS", session }: MainLayoutProps) {
  // Determinamos si el usuario está autenticado basado en la prop session
  const isAuthenticated = !!session;

  // Si no está autenticado, usamos el layout público
  if (!isAuthenticated) {
    return <PublicLayout title={title}>{children}</PublicLayout>;
  }

  // Si está autenticado, usamos el layout con sidebar
  return (
    <AppShell variant="sidebar">
      <AppSidebar userRole={session?.role} />
      <SidebarInset>
        <AppContent variant="sidebar">{children}</AppContent>
        <footer class="bg-gray-100 py-4 text-center text-gray-600">
          <div class="container mx-auto">
            <p>&copy; {new Date().getFullYear()} WorkflowS.</p>
          </div>
        </footer>
      </SidebarInset>
    </AppShell>
  );
}
