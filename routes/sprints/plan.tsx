import type { Handlers, PageProps } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { UserRole } from "../../models/user.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getUserProjects } from "../../models/project.ts";
import { getProjectSprints } from "../../models/sprint.ts";
import SprintPlanningPage from "../../islands/Sprints/SprintPlanningPage.tsx";

interface SprintPlanningPageData {
  projects: Awaited<ReturnType<typeof getUserProjects>>;
  sprintsByProject: Record<string, Awaited<ReturnType<typeof getProjectSprints>>>;
}

export const handler: Handlers<SprintPlanningPageData | null> = {
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

    // Obtener sprints para cada proyecto
    const sprintsByProject: Record<string, Awaited<ReturnType<typeof getProjectSprints>>> = {};

    for (const project of projects) {
      sprintsByProject[project.id] = await getProjectSprints(project.id);
    }

    return ctx.render({
      projects,
      sprintsByProject,
    });
  },
};

export default function SprintPlanning({ data }: PageProps<SprintPlanningPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Planificación de Sprint - WorkflowS">
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

  const { projects, sprintsByProject } = data;

  return (
    <MainLayout title="Planificación de Sprint - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Planificación de Sprint</h1>
            <p class="text-gray-600">Planifica tus sprints y asigna historias de usuario.</p>
          </div>

          {/* Contenido principal */}
          <SprintPlanningPage projects={projects} sprintsByProject={sprintsByProject} />
        </div>
      </div>
    </MainLayout>
  );
}
