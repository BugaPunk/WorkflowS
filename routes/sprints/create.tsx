import type { Handlers, PageProps } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { UserRole } from "../../models/user.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getUserProjects } from "../../models/project.ts";
import CreateSprintPage from "../../islands/Sprints/CreateSprintPage.tsx";

interface CreateSprintPageData {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projects: Awaited<ReturnType<typeof getUserProjects>>;
}

export const handler: Handlers<CreateSprintPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    // Verificar que el usuario sea Scrum Master o Admin
    if (session.role !== UserRole.SCRUM_MASTER && session.role !== UserRole.ADMIN) {
      return new Response("", {
        status: 302,
        headers: { Location: "/unauthorized" },
      });
    }

    // Obtener proyectos del usuario
    const projects = await getUserProjects(session.userId);

    return ctx.render({
      session,
      projects,
    });
  },
};

export default function CreateSprint({ data }: PageProps<CreateSprintPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Crear Sprint - WorkflowS" session={undefined}>
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>No se encontraron datos. Por favor, inténtalo de nuevo.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { session, projects } = data;

  return (
    <MainLayout title="Crear Sprint - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto">
          {/* Encabezado */}
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Crear Nuevo Sprint</h1>
            <p class="text-gray-600">Crea un nuevo sprint para uno de tus proyectos.</p>
          </div>

          {/* Formulario de creación */}
          <CreateSprintPage projects={projects} />
        </div>
      </div>
    </MainLayout>
  );
}
