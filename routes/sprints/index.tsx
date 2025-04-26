import type { Handlers, PageProps } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { UserRole } from "../../models/user.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getUserProjects } from "../../models/project.ts";
import { getProjectSprints } from "../../models/sprint.ts";
import SprintsOverview from "../../islands/Sprints/SprintsOverview.tsx";

interface SprintsPageData {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projects: Awaited<ReturnType<typeof getUserProjects>>;
  sprintsByProject: Record<string, Awaited<ReturnType<typeof getProjectSprints>>>;
  canManageSprints: boolean;
}

export const handler: Handlers<SprintsPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    // Obtener proyectos del usuario
    const projects = await getUserProjects(session.userId);

    // Obtener sprints para cada proyecto
    const sprintsByProject: Record<string, Awaited<ReturnType<typeof getProjectSprints>>> = {};

    for (const project of projects) {
      sprintsByProject[project.id] = await getProjectSprints(project.id);
    }

    // Determinar permisos
    const isAdmin = session.role === UserRole.ADMIN;
    const isScrumMaster = session.role === UserRole.SCRUM_MASTER;

    // Solo Admin y Scrum Master pueden gestionar sprints
    const canManageSprints = isAdmin || isScrumMaster;

    return ctx.render({
      session,
      projects,
      sprintsByProject,
      canManageSprints,
    });
  },
};

export default function SprintsPage({ data }: PageProps<SprintsPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Sprints - WorkflowS">
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

  const { session, projects, sprintsByProject, canManageSprints } = data;

  return (
    <MainLayout title="Sprints - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Sprints</h1>
            <p class="text-gray-600">Visualiza y gestiona los sprints de todos tus proyectos.</p>
          </div>

          {/* Contenido principal */}
          <SprintsOverview
            projects={projects}
            sprintsByProject={sprintsByProject}
            canManageSprints={canManageSprints}
          />
        </div>
      </div>
    </MainLayout>
  );
}
