import type { FreshContext, PageProps } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { getAllProjects } from "../../models/project.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { User } from "../../models/user.ts";

interface Data {
  session: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    progress: number;
    tasksTotal: number;
    tasksCompleted: number;
    teamSize: number;
    startDate: number;
    endDate: number;
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

    // Obtener proyectos con datos simulados
    const allProjects = await getAllProjects();
    const projects = allProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || "Sin descripción",
      status: project.status,
      progress: Math.floor(Math.random() * 40) + 60, // 60-100%
      tasksTotal: Math.floor(Math.random() * 20) + 15, // 15-35 tareas
      tasksCompleted: Math.floor(Math.random() * 15) + 10, // 10-25 completadas
      teamSize: Math.floor(Math.random() * 5) + 3, // 3-8 miembros
      startDate: project.startDate || Date.now(),
      endDate: project.endDate || Date.now() + (90 * 24 * 60 * 60 * 1000)
    }));

    return ctx.render({ session, projects });
  },
};

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "in_progress":
      return "bg-green-100 text-green-800";
    case "planning":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "on_hold":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "active":
    case "in_progress":
      return "En Progreso";
    case "planning":
      return "Planificación";
    case "completed":
      return "Completado";
    case "on_hold":
      return "En Pausa";
    default:
      return "Desconocido";
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function ProjectsReportPage({ data }: PageProps<Data>) {
  const { session, projects } = data;

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active" || p.status === "in_progress").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const averageProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

  return (
    <MainLayout session={session} title="Reporte de Proyectos">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Reporte de Proyectos</h1>
          <p class="text-gray-600">
            Estado y métricas de todos los proyectos en el sistema
          </p>
        </div>

        {/* Resumen de métricas */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-blue-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Proyectos</p>
                <p class="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-green-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Proyectos Activos</p>
                <p class="text-2xl font-bold text-gray-900">{activeProjects}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-purple-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completados</p>
                <p class="text-2xl font-bold text-gray-900">{completedProjects}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-orange-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Progreso Promedio</p>
                <p class="text-2xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Detalle de Proyectos</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tareas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{project.name}</div>
                        <div class="text-sm text-gray-500">{project.description}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div class="bg-blue-600 h-2 rounded-full" style={`width: ${project.progress}%`}></div>
                        </div>
                        <span class="text-sm text-gray-900">{project.progress}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.tasksCompleted}/{project.tasksTotal}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.teamSize} miembros
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(project.startDate)}</div>
                      <div>{formatDate(project.endDate)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-900 mr-3">
                        Ver
                      </a>
                      <a href={`/reports/projects/${project.id}`} class="text-green-600 hover:text-green-900">
                        Reporte
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botones de acción */}
        <div class="mt-8 flex justify-between">
          <a
            href="/reports"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a Reportes
          </a>
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onclick="window.print()"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimir Reporte
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
