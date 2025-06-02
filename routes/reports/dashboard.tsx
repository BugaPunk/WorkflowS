import type { FreshContext, PageProps } from "$fresh/server.ts";
import { getAllUsers } from "../../models/user.ts";
import { getAllProjects } from "../../models/project.ts";
import { getKv } from "../../utils/db.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";

interface DashboardData {
  session: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
  metrics: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    projectCompletion: number;
    userActivity: number;
    taskCompletionRate: number;
    sprintVelocity: number;
    teamPerformance: number;
  };
  recentActivities: Array<{
    type: string;
    description: string;
    timestamp: number;
  }>;
  performanceData: Array<{
    date: number;
    tasksCompleted: number;
    hoursWorked: number;
    projectProgress: number;
    teamActivity: number;
  }>;
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

    // Obtener datos para el dashboard
    const users = await getAllUsers();
    const projects = await getAllProjects();
    const kv = getKv();

    // Obtener métricas
    let metrics = {
      totalUsers: users.length,
      totalProjects: projects.length,
      totalTasks: 0,
      completedTasks: 0,
      projectCompletion: 75,
      userActivity: 85,
      taskCompletionRate: 80,
      sprintVelocity: 32,
      teamPerformance: 88,
    };

    // Intentar obtener métricas reales de la base de datos
    try {
      const metricsIterator = kv.list({ prefix: ["metrics"] });
      for await (const entry of metricsIterator) {
        const metric = entry.value as any;
        if (metric && metric.type) {
          switch (metric.type) {
            case "project_completion":
              metrics.projectCompletion = metric.value;
              break;
            case "user_activity":
              metrics.userActivity = metric.value;
              break;
            case "task_completion_rate":
              metrics.taskCompletionRate = metric.value;
              break;
            case "sprint_velocity":
              metrics.sprintVelocity = metric.value;
              break;
            case "team_performance":
              metrics.teamPerformance = metric.value;
              break;
          }
        }
      }
    } catch (error) {
      console.log("Error obteniendo métricas:", error);
    }

    // Obtener actividades recientes
    let recentActivities: Array<{
      type: string;
      description: string;
      timestamp: number;
    }> = [];

    try {
      const activitiesIterator = kv.list({ prefix: ["activities"] });
      for await (const entry of activitiesIterator) {
        const activity = entry.value as any;
        if (activity) {
          recentActivities.push(activity);
        }
      }
      // Ordenar por timestamp descendente y tomar las últimas 10
      recentActivities = recentActivities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    } catch (error) {
      console.log("Error obteniendo actividades:", error);
      // Actividades de ejemplo si no hay datos
      recentActivities = [
        {
          type: "task_completed",
          description: "Tarea completada: Implementación de autenticación",
          timestamp: Date.now() - (1000 * 60 * 30)
        },
        {
          type: "project_updated",
          description: "Proyecto actualizado: Sistema de Gestión Académica",
          timestamp: Date.now() - (1000 * 60 * 60 * 2)
        },
        {
          type: "user_joined",
          description: "Nuevo usuario se unió al proyecto",
          timestamp: Date.now() - (1000 * 60 * 60 * 24)
        }
      ];
    }

    // Obtener datos de rendimiento
    let performanceData: Array<{
      date: number;
      tasksCompleted: number;
      hoursWorked: number;
      projectProgress: number;
      teamActivity: number;
    }> = [];

    try {
      const performanceIterator = kv.list({ prefix: ["performance", "daily"] });
      for await (const entry of performanceIterator) {
        const data = entry.value as any;
        if (data) {
          performanceData.push(data);
        }
      }
      // Ordenar por fecha y tomar los últimos 7 días
      performanceData = performanceData
        .sort((a, b) => b.date - a.date)
        .slice(0, 7)
        .reverse();
    } catch (error) {
      console.log("Error obteniendo datos de rendimiento:", error);
      // Datos de ejemplo si no hay datos
      for (let i = 6; i >= 0; i--) {
        const date = Date.now() - (i * 24 * 60 * 60 * 1000);
        performanceData.push({
          date,
          tasksCompleted: Math.floor(Math.random() * 10) + 5,
          hoursWorked: Math.floor(Math.random() * 4) + 6,
          projectProgress: Math.floor(Math.random() * 5) + 2,
          teamActivity: Math.floor(Math.random() * 30) + 70
        });
      }
    }

    return ctx.render({
      session,
      metrics,
      recentActivities,
      performanceData,
    });
  },
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getActivityIcon(type: string): string {
  switch (type) {
    case "task_completed":
      return "✅";
    case "project_updated":
      return "📁";
    case "user_joined":
      return "👥";
    case "sprint_started":
      return "🏃";
    case "evaluation_completed":
      return "📊";
    default:
      return "📋";
  }
}

export default function DashboardPage({ data }: PageProps<DashboardData>) {
  const { session, metrics, recentActivities, performanceData } = data;

  return (
    <MainLayout session={session} title="Dashboard de Reportes">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard de Reportes</h1>
          <p class="text-gray-600">
            Vista general de métricas y actividad del sistema
          </p>
        </div>

        {/* Métricas principales */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-blue-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p class="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-green-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Proyectos</p>
                <p class="text-2xl font-bold text-gray-900">{metrics.totalProjects}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-purple-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Progreso Proyectos</p>
                <p class="text-2xl font-bold text-gray-900">{metrics.projectCompletion}%</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-orange-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Velocidad Sprint</p>
                <p class="text-2xl font-bold text-gray-900">{metrics.sprintVelocity} pts</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actividad Reciente */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div class="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} class="flex items-start space-x-3">
                  <span class="text-lg">{getActivityIcon(activity.type)}</span>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{activity.description}</p>
                    <p class="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas Adicionales */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Métricas de Rendimiento</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Actividad de Usuarios</span>
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-blue-600 h-2 rounded-full" style={`width: ${metrics.userActivity}%`}></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{metrics.userActivity}%</span>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Tasa de Completación</span>
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-green-600 h-2 rounded-full" style={`width: ${metrics.taskCompletionRate}%`}></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{metrics.taskCompletionRate}%</span>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Rendimiento del Equipo</span>
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-purple-600 h-2 rounded-full" style={`width: ${metrics.teamPerformance}%`}></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{metrics.teamPerformance}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Rendimiento Semanal */}
        <div class="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Rendimiento de los Últimos 7 Días</h3>
          <div class="grid grid-cols-7 gap-2">
            {performanceData.map((data, index) => (
              <div key={index} class="text-center">
                <div class="text-xs text-gray-500 mb-2">
                  {new Date(data.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                </div>
                <div class="bg-blue-100 rounded p-2">
                  <div class="text-sm font-medium text-blue-900">{data.tasksCompleted}</div>
                  <div class="text-xs text-blue-600">tareas</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
