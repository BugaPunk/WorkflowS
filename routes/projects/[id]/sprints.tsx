import type { Handlers, PageProps } from "$fresh/server.ts";
import SprintsList from "../../../islands/Sprints/SprintsList.tsx";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import { getProjectById } from "../../../models/project.ts";
import { getProjectSprints } from "../../../models/sprint.ts";
import { UserRole } from "../../../models/user.ts";
// import { Head } from "$fresh/runtime.ts";
import { getSession } from "../../../utils/session.ts";

interface ProjectSprintsPageData {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  project: Awaited<ReturnType<typeof getProjectById>>;
  sprints: Awaited<ReturnType<typeof getProjectSprints>>;
  canManageSprints: boolean;
}

export const handler: Handlers<ProjectSprintsPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const { id } = ctx.params;
    const project = await getProjectById(id);

    if (!project) {
      return ctx.render(null);
    }

    // Obtener sprints del proyecto
    const sprints = await getProjectSprints(id);

    // Determinar permisos
    const isAdmin = session.role === UserRole.ADMIN;
    const isScrumMaster = session.role === UserRole.SCRUM_MASTER;

    // Solo Admin y Scrum Master pueden gestionar sprints
    const canManageSprints = isAdmin || isScrumMaster;

    return ctx.render({
      session,
      project,
      sprints,
      canManageSprints,
    });
  },
};

export default function ProjectSprintsPage({ data }: PageProps<ProjectSprintsPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Proyecto no encontrado - WorkflowS" session={undefined}>
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>Proyecto no encontrado.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { session, project, sprints, canManageSprints } = data;

  // Asegurarse de que project no sea null
  if (!project) {
    return (
      <MainLayout title="Error - WorkflowS" session={session}>
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>Error al cargar el proyecto.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Sprints | ${project.name} - WorkflowS`} session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-8">
            <div class="flex items-center mb-2">
              <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-800">
                {project.name}
              </a>
              <span class="mx-2 text-gray-500">/</span>
              <h1 class="text-3xl font-bold text-gray-800">Sprints</h1>
            </div>
            <p class="text-gray-600">
              Gestiona los sprints del proyecto y realiza un seguimiento del progreso.
            </p>
          </div>

          {/* Lista de sprints */}
          <SprintsList
            projectId={project.id}
            initialSprints={sprints}
            canManageSprints={canManageSprints}
          />
        </div>
      </div>
    </MainLayout>
  );
}
