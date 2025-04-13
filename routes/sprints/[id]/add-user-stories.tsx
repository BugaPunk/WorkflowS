import { Handlers, PageProps } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { getSprintById } from "../../../models/sprint.ts";
import { getProjectById } from "../../../models/project.ts";
import { getUserStoriesWithFilters, UserStoryStatus } from "../../../models/userStory.ts";
import { UserRole } from "../../../models/user.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import AddUserStoriesToSprint from "../../../islands/Sprints/AddUserStoriesToSprint.tsx";

interface AddUserStoriesToSprintPageData {
  sprint: Awaited<ReturnType<typeof getSprintById>>;
  project: Awaited<ReturnType<typeof getProjectById>>;
  availableUserStories: Awaited<ReturnType<typeof getUserStoriesWithFilters>>;
}

export const handler: Handlers<AddUserStoriesToSprintPageData | null> = {
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

    const { id } = ctx.params;
    const sprint = await getSprintById(id);

    if (!sprint) {
      return ctx.render(null);
    }

    const project = await getProjectById(sprint.projectId);
    if (!project) {
      return ctx.render(null);
    }

    // Obtener historias de usuario disponibles (en estado BACKLOG o PLANNED y que no estén ya en el sprint)
    const availableUserStories = await getUserStoriesWithFilters({
      projectId: sprint.projectId,
      status: [UserStoryStatus.BACKLOG, UserStoryStatus.PLANNED],
    });

    // Filtrar las historias que ya están en el sprint
    const filteredUserStories = availableUserStories.filter(
      story => !sprint.userStoryIds.includes(story.id)
    );

    return ctx.render({
      sprint,
      project,
      availableUserStories: filteredUserStories,
    });
  },
};

export default function AddUserStoriesToSprintPage({ data }: PageProps<AddUserStoriesToSprintPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Sprint no encontrado - WorkflowS">
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>Sprint no encontrado.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { sprint, project, availableUserStories } = data;

  return (
    <MainLayout title={`Añadir Historias de Usuario a Sprint - ${project.name} - WorkflowS`}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-8">
            <div class="flex items-center mb-2">
              <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-800">
                {project.name}
              </a>
              <span class="mx-2 text-gray-500">/</span>
              <a href={`/sprints/${sprint.id}`} class="text-blue-600 hover:text-blue-800">
                {sprint.name}
              </a>
              <span class="mx-2 text-gray-500">/</span>
              <h1 class="text-3xl font-bold text-gray-800">Añadir Historias de Usuario</h1>
            </div>
          </div>

          {/* Contenido principal */}
          <div class="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Historias de Usuario Disponibles</h2>
            
            {availableUserStories.length === 0 ? (
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-gray-600">No hay historias de usuario disponibles para añadir a este sprint.</p>
                <p class="text-gray-500 mt-2">Todas las historias ya están asignadas o no hay historias en estado Backlog o Planificado.</p>
                <a
                  href={`/sprints/${sprint.id}`}
                  class="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Volver al Sprint
                </a>
              </div>
            ) : (
              <AddUserStoriesToSprint
                sprint={sprint}
                availableUserStories={availableUserStories}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
