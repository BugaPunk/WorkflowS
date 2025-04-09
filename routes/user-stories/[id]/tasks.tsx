import { Handlers, PageProps } from "$fresh/server.ts";
// import { Head } from "$fresh/runtime.ts";
import { getSession } from "../../../utils/session.ts";
import { getUserStoryById } from "../../../services/userStoryService.ts";
import { getProjectById } from "../../../models/project.ts";
import { getUserStoryTasks } from "../../../models/task.ts";
import { UserRole } from "../../../models/user.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import TasksList from "../../../islands/Tasks/TasksList.tsx";

interface UserStoryTasksPageData {
  userStory: Awaited<ReturnType<typeof getUserStoryById>>;
  project: Awaited<ReturnType<typeof getProjectById>>;
  tasks: Awaited<ReturnType<typeof getUserStoryTasks>>;
  canManageTasks: boolean;
}

export const handler: Handlers<UserStoryTasksPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const { id } = ctx.params;
    const userStory = await getUserStoryById(id);

    if (!userStory) {
      return ctx.render(null);
    }

    const project = await getProjectById(userStory.projectId);
    if (!project) {
      return ctx.render(null);
    }

    // Obtener tareas de la historia de usuario
    const tasks = await getUserStoryTasks(id);

    // Determinar permisos
    const isAdmin = session.role === UserRole.ADMIN;
    const isScrumMaster = session.role === UserRole.SCRUM_MASTER;
    const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
    const isTeamMember = session.role === UserRole.TEAM_DEVELOPER;

    // Admin, Scrum Master, Product Owner y Team Developer pueden gestionar tareas
    const canManageTasks = isAdmin || isScrumMaster || isProductOwner || isTeamMember;

    return ctx.render({
      userStory,
      project,
      tasks,
      canManageTasks,
    });
  },
};

export default function UserStoryTasksPage({ data }: PageProps<UserStoryTasksPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Historia no encontrada - WorkflowS">
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>Historia de usuario no encontrada.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { userStory, project, tasks, canManageTasks } = data;

  // Asegurarse de que project no sea null
  if (!project) {
    return (
      <MainLayout title="Error - WorkflowS">
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
    <MainLayout title={`Tareas: ${userStory.title} | ${project.name} - WorkflowS`}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-8">
            <div class="flex items-center mb-2">
              <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-800">
                {project.name}
              </a>
              <span class="mx-2 text-gray-500">/</span>
              <a href={`/user-stories/${userStory.id}`} class="text-blue-600 hover:text-blue-800">
                {userStory.title}
              </a>
              <span class="mx-2 text-gray-500">/</span>
              <h1 class="text-3xl font-bold text-gray-800">Tareas</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class={`px-2 py-1 text-xs font-semibold rounded-full ${
                userStory.status === "done" ? "bg-green-100 text-green-800" :
                userStory.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {userStory.status === "done" ? "Completada" :
                 userStory.status === "in_progress" ? "En progreso" :
                 "Pendiente"}
              </span>
              <span class="text-gray-600">Prioridad: {userStory.priority}</span>
            </div>
            <div class="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 class="text-lg font-semibold text-gray-700 mb-2">Descripción</h2>
              <p class="text-gray-600">{userStory.description}</p>
              {userStory.acceptanceCriteria && (
                <div class="mt-4">
                  <h3 class="text-md font-semibold text-gray-700 mb-2">Criterios de Aceptación</h3>
                  <p class="text-gray-600">{userStory.acceptanceCriteria}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de tareas */}
          <TasksList
            userStoryId={userStory.id}
            initialTasks={tasks}
            canManageTasks={canManageTasks}
          />
        </div>
      </div>
    </MainLayout>
  );
}
