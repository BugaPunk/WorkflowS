import type { FreshContext } from "$fresh/server.ts";
import { Button } from "../../components/Button.tsx";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import type { Project } from "../../models/project.ts";
import { getProjectById } from "../../models/project.ts";
import type { User, UserRole } from "../../models/user.ts";
import { getUserById } from "../../models/user.ts";
import { getSprintById } from "../../models/sprint.ts";
import {
  type UserStory,
  UserStoryPriority,
  UserStoryStatus,
  getUserStoryById,
} from "../../models/userStory.ts";
import { getSession } from "../../utils/session.ts";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }

    const { id } = ctx.params;

    // Obtener la historia de usuario usando la función del modelo
    const userStory = await getUserStoryById(id);

    if (!userStory) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/user-stories",
        },
      });
    }

    // Obtener el proyecto usando la función del modelo
    const project = await getProjectById(userStory.projectId);

    // Obtener el creador usando la función del modelo
    let creator = null;
    if (userStory.createdBy && typeof userStory.createdBy === 'string') {
      creator = await getUserById(userStory.createdBy);
    }

    // Obtener el usuario asignado si existe
    let assignedUser = null;
    if (userStory.assignedTo && typeof userStory.assignedTo === 'string') {
      assignedUser = await getUserById(userStory.assignedTo);
    }

    // Obtener el sprint si existe
    let sprint = null;
    if (userStory.sprintId && typeof userStory.sprintId === 'string') {
      sprint = await getSprintById(userStory.sprintId);
    }

    // Asegurarnos de que la sesión tenga el formato correcto para MainLayout
    const sessionData = {
      userId: session.userId,
      username: session.username,
      email: session.email,
      role: session.role as UserRole, // Aseguramos que el tipo sea UserRole
    };

    return ctx.render({ session: sessionData, userStory, project, creator, assignedUser, sprint });
  },
};

interface UserStoryDetailProps {
  session: {
    userId: string; // Cambiado de id a userId para coincidir con MainLayout
    username: string;
    email: string;
    role: UserRole; // Cambiado de string a UserRole para coincidir con MainLayout
  };
  userStory: UserStory;
  project: Project | null;
  creator: User | null;
  assignedUser: User | null;
  sprint: any | null; // Agregamos el sprint
}

export default function UserStoryDetailPage({ data }: { data: UserStoryDetailProps }) {
  const { session, userStory, project, creator, assignedUser, sprint } = data;

  // Obtener el nombre de visualización de la prioridad
  const getPriorityDisplay = (priority: UserStoryPriority) => {
    switch (priority) {
      case UserStoryPriority.LOW:
        return "Baja";
      case UserStoryPriority.MEDIUM:
        return "Media";
      case UserStoryPriority.HIGH:
        return "Alta";
      case UserStoryPriority.CRITICAL:
        return "Crítica";
      default:
        return priority;
    }
  };

  // Obtener la clase de color para la prioridad
  const getPriorityColorClass = (priority: UserStoryPriority) => {
    switch (priority) {
      case UserStoryPriority.LOW:
        return "bg-blue-100 text-blue-800";
      case UserStoryPriority.MEDIUM:
        return "bg-green-100 text-green-800";
      case UserStoryPriority.HIGH:
        return "bg-yellow-100 text-yellow-800";
      case UserStoryPriority.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obtener el nombre de visualización del estado
  const getStatusDisplay = (status: UserStoryStatus) => {
    switch (status) {
      case UserStoryStatus.BACKLOG:
        return "Backlog";
      case UserStoryStatus.PLANNED:
        return "Planificada";
      case UserStoryStatus.IN_PROGRESS:
        return "En Progreso";
      case UserStoryStatus.TESTING:
        return "En Pruebas";
      case UserStoryStatus.DONE:
        return "Completada";
      default:
        return status;
    }
  };

  // Obtener la clase de color para el estado
  const getStatusColorClass = (status: UserStoryStatus) => {
    switch (status) {
      case UserStoryStatus.BACKLOG:
        return "bg-gray-100 text-gray-800";
      case UserStoryStatus.PLANNED:
        return "bg-blue-100 text-blue-800";
      case UserStoryStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case UserStoryStatus.TESTING:
        return "bg-purple-100 text-purple-800";
      case UserStoryStatus.DONE:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MainLayout title={`Historia de Usuario: ${userStory.title} - WorkflowS`} session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          <div class="mb-6 flex justify-between items-center">
            <div class="flex items-center">
              <a
                href={
                  userStory.projectId
                    ? `/user-stories?projectId=${userStory.projectId}`
                    : "/user-stories"
                }
                class="text-blue-600 hover:text-blue-800 mr-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-labelledby="backToUserStoriesTitle"
                  role="img"
                >
                  <title id="backToUserStoriesTitle">Volver a historias de usuario</title>
                  <path
                    fill-rule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </a>
              <h1 class="text-3xl font-bold text-gray-800">Historia de Usuario</h1>
            </div>
            <div class="flex space-x-2">
              <Button
                onClick={() => globalThis.history.back()}
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Volver
              </Button>
              {(session.role === "admin" || session.role === "product_owner") && (
                <>
                  <a
                    href={`/user-stories/edit/${userStory.id}`}
                    class="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Editar
                  </a>
                  {!sprint && (
                    <a
                      href={`/user-stories/${userStory.id}/assign-sprint`}
                      class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ml-2"
                    >
                      Asignar a Sprint
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          <div class="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div class="flex justify-between items-start">
                <h2 class="text-2xl font-bold text-gray-800">{userStory.title}</h2>
                <div class="flex space-x-2">
                  <span
                    class={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPriorityColorClass(userStory.priority)}`}
                  >
                    Prioridad: {getPriorityDisplay(userStory.priority)}
                  </span>
                  <span
                    class={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColorClass(userStory.status)}`}
                  >
                    Estado: {getStatusDisplay(userStory.status)}
                  </span>
                </div>
              </div>
              {project && (
                <div class="mt-2">
                  <span class="text-sm text-gray-600">
                    Proyecto:{" "}
                    <a href={`/projects/${project.id}`} class="text-blue-600 hover:underline">
                      {project.name}
                    </a>
                  </span>
                </div>
              )}
            </div>

            <div class="p-6">
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
                <div class="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {userStory.description}
                </div>
              </div>

              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Criterios de Aceptación</h3>
                <div class="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {userStory.acceptanceCriteria}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">Detalles</h3>
                  <ul class="bg-gray-50 p-4 rounded-lg">
                    <li class="mb-2">
                      <span class="font-medium text-gray-700">ID:</span> {userStory.id}
                    </li>
                    <li class="mb-2">
                      <span class="font-medium text-gray-700">Puntos:</span>{" "}
                      {userStory.points || "No estimado"}
                    </li>
                    {sprint ? (
                      <li class="mb-2">
                        <span class="font-medium text-gray-700">Asignado a Sprint:</span>{" "}
                        <a href={`/sprints/${sprint.id}`} class="text-blue-600 hover:underline">
                          {sprint.name}
                        </a>
                      </li>
                    ) : (
                      <li class="mb-2">
                        <span class="font-medium text-gray-700">Asignado a Sprint:</span>{" "}
                        <span class="text-gray-500">No asignado a ningún sprint</span>
                      </li>
                    )}
                    <li class="mb-2">
                      <span class="font-medium text-gray-700">Creado:</span>{" "}
                      {formatDate(userStory.createdAt)}
                    </li>
                    <li>
                      <span class="font-medium text-gray-700">Última actualización:</span>{" "}
                      {formatDate(userStory.updatedAt)}
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">Personas</h3>
                  <ul class="bg-gray-50 p-4 rounded-lg">
                    {creator && (
                      <li class="mb-2">
                        <span class="font-medium text-gray-700">Creado por:</span>{" "}
                        {creator.username}
                      </li>
                    )}
                    {assignedUser ? (
                      <li>
                        <span class="font-medium text-gray-700">Asignado a:</span>{" "}
                        {assignedUser.username}
                      </li>
                    ) : (
                      <li>
                        <span class="font-medium text-gray-700">Asignado a:</span>{" "}
                        <span class="text-gray-500">No asignado</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
