import type { FreshContext } from "$fresh/server.ts";
import { AppShell } from "../components/AppShell.tsx";
import AppSidebar from "../islands/AppSidebar.tsx";
import { SidebarInset } from "../components/ui/sidebar.tsx";
import { AppSidebarHeader } from "../components/AppSidebarHeader.tsx";

export const handler = {
  GET(_req: Request, ctx: FreshContext) {
    return ctx.render();
  },
};

export default function TestSidebarPage() {
  return (
    <html>
      <head>
        <title>Test Sidebar</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <AppShell variant="sidebar">
          <AppSidebar />
          <SidebarInset>
            <AppSidebarHeader />
            <div class="p-6">
              <h1 class="text-2xl font-bold mb-4">Test Sidebar Collapse</h1>
              <p>Haz clic en el botón del header para colapsar/expandir el sidebar.</p>
              <div class="mt-4 p-4 bg-gray-100 rounded">
                <h2 class="font-semibold">Instrucciones:</h2>
                <ol class="list-decimal list-inside mt-2 space-y-1">
                  <li>Abre las herramientas de desarrollador (F12)</li>
                  <li>Ve a la pestaña Console</li>
                  <li>Haz clic en el botón de hamburguesa en el header</li>
                  <li>Deberías ver logs en la consola</li>
                  <li>El sidebar debería cambiar de ancho</li>
                </ol>
              </div>
            </div>
          </SidebarInset>
        </AppShell>
      </body>
    </html>
  );
}
