import { Head } from "$fresh/runtime.ts";
import type { FreshContext, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import { getProjectById, getProjectMembers } from "../../../models/project.ts";
import { getProjectSprints } from "../../../models/sprint.ts";
import { getProjectUserStories } from "../../../models/userStory.ts";
import { getUserStoryTasks } from "../../../models/task.ts";
import { getUserById } from "../../../models/user.ts";
import { getSession } from "../../../utils/session.ts";

import type { UserRole } from "../../../models/user.ts";

interface MetricsDashboardProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  project: {
    id: string;
    name: string;
    description: string;
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    teamVelocity: number;
    totalUserStories: number;
    completedUserStories: number;
    totalSprints: number;
    activeSprints: number;
    teamPerformance: Array<{
      userId: string;
      name: string;
      role: string;
      tasksCompleted: number;
      tasksInProgress: number;
      totalTasks: number;
      hoursWorked: number;
    }>;
    sprintSummary: Array<{
      id: string;
      name: string;
      status: string;
      totalTasks: number;
      completedTasks: number;
      startDate: number;
      endDate: number;
    }>;
  };
}

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const projectId = ctx.params.id;

    try {
      // Obtener el proyecto
      const project = await getProjectById(projectId);
      if (!project) {
        return new Response("Proyecto no encontrado", { status: 404 });
      }

      // Obtener datos reales del proyecto
      const [userStories, sprints, projectMembers] = await Promise.all([
        getProjectUserStories(projectId),
        getProjectSprints(projectId),
        getProjectMembers(projectId),
      ]);

      // Obtener todas las tareas del proyecto
      const allTasks = [];
      for (const userStory of userStories) {
        const tasks = await getUserStoryTasks(userStory.id);
        allTasks.push(...tasks);
      }

      // Calcular métricas reales
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((task) => task.status === "done").length;
      const inProgressTasks = allTasks.filter((task) => task.status === "in_progress").length;
      const todoTasks = allTasks.filter((task) => task.status === "todo").length;
      const reviewTasks = allTasks.filter((task) => task.status === "review").length;

      const totalUserStories = userStories.length;
      const completedUserStories = userStories.filter((story) => story.status === "done").length;

      const totalSprints = sprints.length;
      const activeSprints = sprints.filter((sprint) => sprint.status === "active").length;

      // Calcular velocidad del equipo (promedio de puntos completados)
      const completedStories = userStories.filter((story) => story.status === "done");
      const teamVelocity =
        completedStories.length > 0
          ? completedStories.reduce((sum, story) => sum + (story.points || 0), 0) /
            Math.max(totalSprints, 1)
          : 0;

      // Obtener rendimiento del equipo
      const teamPerformance = [];
      for (const member of projectMembers) {
        const user = await getUserById(member.userId);
        if (user) {
          const memberTasks = allTasks.filter((task) => task.assignedTo === member.userId);
          const memberCompletedTasks = memberTasks.filter((task) => task.status === "done");
          const memberInProgressTasks = memberTasks.filter((task) => task.status === "in_progress");

          // Calcular horas trabajadas (suma de horas gastadas en tareas)
          const hoursWorked = memberTasks.reduce((sum, task) => sum + (task.spentHours || 0), 0);

          teamPerformance.push({
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: member.role,
            tasksCompleted: memberCompletedTasks.length,
            tasksInProgress: memberInProgressTasks.length,
            totalTasks: memberTasks.length,
            hoursWorked,
          });
        }
      }

      // Resumen de sprints
      const sprintSummary = [];
      for (const sprint of sprints) {
        const sprintStories = userStories.filter((story) => story.sprintId === sprint.id);
        const sprintTasks = [];
        for (const story of sprintStories) {
          const tasks = await getUserStoryTasks(story.id);
          sprintTasks.push(...tasks);
        }

        sprintSummary.push({
          id: sprint.id,
          name: sprint.name || `Sprint ${sprint.id.substring(0, 8)}`,
          status: sprint.status,
          totalTasks: sprintTasks.length,
          completedTasks: sprintTasks.filter((task) => task.status === "done").length,
          startDate: sprint.startDate || Date.now(),
          endDate: sprint.endDate || Date.now(),
        });
      }

      const metrics = {
        totalTasks,
        completedTasks,
        inProgressTasks: inProgressTasks + reviewTasks, // Incluir review como "en progreso"
        todoTasks,
        teamVelocity: Math.round(teamVelocity * 10) / 10, // Redondear a 1 decimal
        totalUserStories,
        completedUserStories,
        totalSprints,
        activeSprints,
        teamPerformance,
        sprintSummary,
      };

      return ctx.render({
        session: {
          userId: session.userId,
          username: session.username,
          email: session.email,
          role: session.role as UserRole,
        },
        project: {
          id: project.id,
          name: project.name,
          description: project.description || "Sin descripción",
        },
        metrics,
      });
    } catch (error) {
      console.error(`Error al cargar métricas del proyecto ${projectId}:`, error);
      return new Response("Error interno del servidor", { status: 500 });
    }
  },
};

export default function MetricsDashboard({ data }: PageProps<MetricsDashboardProps>) {
  const { session, project, metrics } = data;

  return (
    <>
      <Head>
        <title>Métricas del Proyecto | {project.name}</title>
      </Head>

      <MainLayout session={session}>
        <div class="container mx-auto py-6 px-4">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold">Métricas del Proyecto: {project.name}</h1>
              <p class="text-gray-600">{project.description}</p>
            </div>
            <a
              href={`/projects/${project.id}`}
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Volver</title>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver al Proyecto
            </a>
          </div>

          {/* Métricas principales */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-blue-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Tareas</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Tareas</p>
                  <p class="text-2xl font-bold text-gray-900">{metrics.totalTasks}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-green-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Tareas Completadas</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Completadas</p>
                  <p class="text-2xl font-bold text-gray-900">{metrics.completedTasks}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-yellow-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Tareas en Progreso</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">En Progreso</p>
                  <p class="text-2xl font-bold text-gray-900">{metrics.inProgressTasks}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-purple-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Velocidad del Equipo</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Velocidad</p>
                  <p class="text-2xl font-bold text-gray-900">{metrics.teamVelocity} pts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-indigo-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Historias de Usuario</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Historias de Usuario</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {metrics.completedUserStories}/{metrics.totalUserStories}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-orange-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Sprints</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Sprints</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {metrics.activeSprints}/{metrics.totalSprints}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-red-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Tareas Pendientes</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6m-7-7h8"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Pendientes</p>
                  <p class="text-2xl font-bold text-gray-900">{metrics.todoTasks}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center">
                <div class="bg-teal-100 p-3 rounded-lg">
                  <svg
                    class="w-6 h-6 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Rendimiento</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">% Completado</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {metrics.totalTasks > 0
                      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Burndown */}
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Burndown Chart</h3>
              <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div class="text-center">
                  <svg
                    class="w-12 h-12 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Sin Datos</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p class="text-gray-500">Gráfico de Burndown</p>
                  <p class="text-sm text-gray-400">Progreso vs tiempo planificado</p>
                </div>
              </div>
            </div>

            {/* Rendimiento del Equipo */}
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Rendimiento del Equipo</h3>
              {metrics.teamPerformance.length > 0 ? (
                <div class="space-y-4">
                  {metrics.teamPerformance.map((member, _index) => (
                    <div
                      key={member.userId}
                      class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">{member.name}</div>
                        <div class="text-sm text-gray-500">{member.role}</div>
                        <div class="text-xs text-gray-400">
                          {member.tasksCompleted} completadas, {member.tasksInProgress} en progreso
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">
                          {member.totalTasks} tareas
                        </div>
                        <div class="text-xs text-gray-500">{member.hoursWorked}h trabajadas</div>
                        <div class="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            class="bg-green-600 h-2 rounded-full"
                            style={`width: ${member.totalTasks > 0 ? (member.tasksCompleted / member.totalTasks) * 100 : 0}%`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div class="text-center py-8">
                  <svg
                    class="w-12 h-12 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Equipo</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <p class="text-gray-500">No hay miembros asignados al proyecto</p>
                </div>
              )}
            </div>
          </div>

          {/* Distribución de Tareas */}
          <div class="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribución de Tareas</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{metrics.completedTasks}</div>
                <div class="text-sm text-gray-500">Completadas</div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    class="bg-green-600 h-2 rounded-full"
                    style={`width: ${(metrics.completedTasks / metrics.totalTasks) * 100}%`}
                  />
                </div>
              </div>

              <div class="text-center">
                <div class="text-3xl font-bold text-yellow-600">{metrics.inProgressTasks}</div>
                <div class="text-sm text-gray-500">En Progreso</div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    class="bg-yellow-600 h-2 rounded-full"
                    style={`width: ${(metrics.inProgressTasks / metrics.totalTasks) * 100}%`}
                  />
                </div>
              </div>

              <div class="text-center">
                <div class="text-3xl font-bold text-gray-600">{metrics.todoTasks}</div>
                <div class="text-sm text-gray-500">Por Hacer</div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    class="bg-gray-600 h-2 rounded-full"
                    style={`width: ${(metrics.todoTasks / metrics.totalTasks) * 100}%`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Sprints */}
          {metrics.sprintSummary.length > 0 && (
            <div class="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen de Sprints</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.sprintSummary.map((sprint) => (
                  <div key={sprint.id} class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-gray-900">{sprint.name}</h4>
                      <span
                        class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sprint.status === "active"
                            ? "bg-green-100 text-green-800"
                            : sprint.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sprint.status === "active"
                          ? "Activo"
                          : sprint.status === "completed"
                            ? "Completado"
                            : sprint.status}
                      </span>
                    </div>
                    <div class="text-sm text-gray-600 mb-2">
                      {new Date(sprint.startDate).toLocaleDateString("es-ES")} -{" "}
                      {new Date(sprint.endDate).toLocaleDateString("es-ES")}
                    </div>
                    <div class="flex justify-between text-sm mb-2">
                      <span>
                        Tareas: {sprint.completedTasks}/{sprint.totalTasks}
                      </span>
                      <span>
                        {sprint.totalTasks > 0
                          ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class={`h-2 rounded-full ${
                          sprint.status === "completed" ? "bg-blue-600" : "bg-green-600"
                        }`}
                        style={`width: ${sprint.totalTasks > 0 ? (sprint.completedTasks / sprint.totalTasks) * 100 : 0}%`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <title>Información</title>
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">Métricas del Proyecto</h3>
                <div class="mt-2 text-sm text-blue-700">
                  <p>
                    Estas métricas muestran el progreso actual del proyecto basado en datos reales.
                    Los datos se actualizan automáticamente conforme el equipo completa tareas y
                    actualiza el estado del proyecto.
                  </p>
                  <p class="mt-1">
                    <strong>Datos mostrados:</strong> {metrics.totalTasks} tareas totales,{" "}
                    {metrics.totalUserStories} historias de usuario,
                    {metrics.totalSprints} sprints, {metrics.teamPerformance.length} miembros del
                    equipo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
