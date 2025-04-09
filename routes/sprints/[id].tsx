import { Handlers, PageProps } from "$fresh/server.ts";
// import { Head } from "$fresh/runtime.ts";
import { getSession } from "../../utils/session.ts";
import { getSprintById } from "../../models/sprint.ts";
import { getUserStoryById } from "../../services/userStoryService.ts";
import { getProjectById } from "../../models/project.ts";
import { UserRole } from "../../models/user.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
// import TasksList from "../../islands/Tasks/TasksList.tsx";
import { getUserStoryTasks } from "../../models/task.ts";

interface SprintDetailPageData {
  sprint: Awaited<ReturnType<typeof getSprintById>>;
  project: Awaited<ReturnType<typeof getProjectById>>;
  userStories: Awaited<ReturnType<typeof getUserStoryById>>[];
  tasks: Record<string, Awaited<ReturnType<typeof getUserStoryTasks>>>;
  canManageSprints: boolean;
  canManageTasks: boolean;
}

export const handler: Handlers<SprintDetailPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
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

    // Obtener todas las historias de usuario del sprint
    const userStories = [];
    const tasks: Record<string, Awaited<ReturnType<typeof getUserStoryTasks>>> = {};

    for (const userStoryId of sprint.userStoryIds) {
      const userStory = await getUserStoryById(userStoryId);
      if (userStory) {
        userStories.push(userStory);
        // Obtener tareas para cada historia de usuario
        tasks[userStoryId] = await getUserStoryTasks(userStoryId);
      }
    }

    // Determinar permisos
    const isAdmin = session.role === UserRole.ADMIN;
    const isScrumMaster = session.role === UserRole.SCRUM_MASTER;
    const isProductOwner = session.role === UserRole.PRODUCT_OWNER;

    // Solo Admin y Scrum Master pueden gestionar sprints
    const canManageSprints = isAdmin || isScrumMaster;

    // Admin, Scrum Master y Product Owner pueden gestionar tareas
    const canManageTasks = isAdmin || isScrumMaster || isProductOwner;

    return ctx.render({
      sprint,
      project,
      userStories,
      tasks,
      canManageSprints,
      canManageTasks,
    });
  },
};

export default function SprintDetailPage({ data }: PageProps<SprintDetailPageData | null>) {
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

  const { sprint, project, userStories, tasks, canManageSprints } = data;

  // Formatear fechas
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "No definida";
    return new Date(timestamp).toLocaleDateString();
  };

  // Asegurarse de que sprint y project no sean null
  if (!sprint || !project) {
    return (
      <MainLayout title="Error - WorkflowS">
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>Error al cargar los datos del sprint.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Sprint: ${sprint.name} | ${project.name} - WorkflowS`}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-8">
            <div class="flex items-center mb-2">
              <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-800">
                {project.name}
              </a>
              <span class="mx-2 text-gray-500">/</span>
              <h1 class="text-3xl font-bold text-gray-800">{sprint.name}</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600">
                {sprint.startDate && sprint.endDate
                  ? `${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}`
                  : "Sin fechas definidas"}
              </span>
              <span class={`px-2 py-1 text-xs font-semibold rounded-full ${
                sprint.status === "active" ? "bg-green-100 text-green-800" :
                sprint.status === "completed" ? "bg-purple-100 text-purple-800" :
                sprint.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {sprint.status === "active" ? "Activo" :
                 sprint.status === "completed" ? "Completado" :
                 sprint.status === "cancelled" ? "Cancelado" :
                 "Planificado"}
              </span>
            </div>
            {sprint.goal && (
              <div class="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 class="text-lg font-semibold text-gray-700 mb-2">Objetivo del Sprint</h2>
                <p class="text-gray-600">{sprint.goal}</p>
              </div>
            )}
          </div>

          {/* Historias de usuario */}
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Historias de Usuario</h2>
            {userStories.length === 0 ? (
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-gray-600">No hay historias de usuario asignadas a este sprint.</p>
                {canManageSprints && (
                  <a
                    href={`/sprints/${sprint.id}/add-user-stories`}
                    class="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Añadir historias de usuario
                  </a>
                )}
              </div>
            ) : (
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userStories.map(userStory => (
                  <div key={userStory.id} class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <div class="p-4">
                      <div class="flex justify-between items-start">
                        <h3 class="text-lg font-semibold text-gray-800">{userStory.title}</h3>
                        <span class={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          userStory.status === "done" ? "bg-green-100 text-green-800" :
                          userStory.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {userStory.status === "done" ? "Completada" :
                           userStory.status === "in_progress" ? "En progreso" :
                           "Pendiente"}
                        </span>
                      </div>
                      <p class="mt-2 text-sm text-gray-600">{userStory.description}</p>
                      <div class="mt-4 flex justify-between items-center">
                        <span class="text-sm text-gray-500">Prioridad: {userStory.priority}</span>
                        <a
                          href={`/user-stories/${userStory.id}`}
                          class="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver detalles
                        </a>
                      </div>
                    </div>

                    {/* Tareas de la historia de usuario */}
                    <div class="border-t border-gray-200 p-4">
                      <h4 class="text-md font-semibold text-gray-700 mb-2">Tareas ({tasks[userStory.id]?.length || 0})</h4>
                      {tasks[userStory.id]?.length > 0 ? (
                        <div class="space-y-2">
                          {tasks[userStory.id].slice(0, 3).map(task => (
                            <div key={task.id} class="flex items-center">
                              <span class={`w-2 h-2 rounded-full mr-2 ${
                                task.status === "done" ? "bg-green-500" :
                                task.status === "in_progress" ? "bg-blue-500" :
                                task.status === "review" ? "bg-yellow-500" :
                                task.status === "blocked" ? "bg-red-500" :
                                "bg-gray-500"
                              }`}></span>
                              <span class="text-sm">{task.title}</span>
                            </div>
                          ))}
                          {tasks[userStory.id].length > 3 && (
                            <div class="text-sm text-gray-500">
                              Y {tasks[userStory.id].length - 3} más...
                            </div>
                          )}
                        </div>
                      ) : (
                        <p class="text-sm text-gray-500">No hay tareas para esta historia de usuario.</p>
                      )}
                      <div class="mt-3">
                        <a
                          href={`/user-stories/${userStory.id}/tasks`}
                          class="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver todas las tareas
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Burndown Chart (Placeholder) */}
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Burndown Chart</h2>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p class="text-gray-600">Aquí se mostrará el Burndown Chart del sprint.</p>
            </div>
          </div>

          {/* Métricas del Sprint (Placeholder) */}
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Métricas del Sprint</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Historias de Usuario</h3>
                <div class="text-3xl font-bold text-blue-600">{userStories.length}</div>
              </div>
              <div class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Tareas Totales</h3>
                <div class="text-3xl font-bold text-blue-600">
                  {Object.values(tasks).reduce((total, taskList) => total + taskList.length, 0)}
                </div>
              </div>
              <div class="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Tareas Completadas</h3>
                <div class="text-3xl font-bold text-green-600">
                  {Object.values(tasks).reduce((total, taskList) =>
                    total + taskList.filter(task => task.status === "done").length, 0
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
