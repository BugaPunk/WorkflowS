import type { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import { getSession } from "../utils/session.ts";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    // Si el usuario ya está autenticado, redirigir a la página de bienvenida
    if (session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/welcome",
        },
      });
    }

    // Si no está autenticado, mostrar la página de inicio
    return ctx.render();
  },
};

export default function Home() {
  return (
    <MainLayout title="Home - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-4xl font-bold mt-8 mb-4">Bienvenido a WorkflowS</h1>
          <p class="my-4 text-center">
            Sistema de gestión de proyectos Scrum para equipos de desarrollo.
          </p>
          <div class="mt-6">
            <a href="/login" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
