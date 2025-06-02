import type { FreshContext, PageProps } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { getProjectById } from "../../../models/project.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";

interface Data {
  session: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: number;
    endDate: number;
    progress: number;
    teamMembers: Array<{
      id: string;
      name: string;
      role: string;
      tasksAssigned: number;
      tasksCompleted: number;
      hoursWorked: number;
    }>;
    sprints: Array<{
      id: string;
      name: string;
      status: string;
      startDate: number;
      endDate: number;
      completedTasks: number;
      totalTasks: number;
    }>;
    metrics: {
      totalTasks: number;
      completedTasks: number;
      totalHours: number;
      velocity: number;
      burndownData: Array<{
        date: number;
        planned: number;
        actual: number;
      }>;
    };
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
      const projectData = await getProjectById(projectId);
      
      if (!projectData) {
        return new Response("Proyecto no encontrado", { status: 404 });
      }

      // Generar datos simulados para el reporte detallado
      const project = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || "Sin descripción",
        status: projectData.status,
        startDate: projectData.startDate || Date.now() - (30 * 24 * 60 * 60 * 1000),
        endDate: projectData.endDate || Date.now() + (60 * 24 * 60 * 60 * 1000),
        progress: Math.floor(Math.random() * 40) + 60, // 60-100%
        
        teamMembers: [
          {
            id: "1",
            name: "Juan Pérez",
            role: "Desarrollador Frontend",
            tasksAssigned: 12,
            tasksCompleted: 8,
            hoursWorked: 45
          },
          {
            id: "2", 
            name: "María González",
            role: "Desarrollador Backend",
            tasksAssigned: 10,
            tasksCompleted: 7,
            hoursWorked: 38
          },
          {
            id: "3",
            name: "Pedro Sánchez", 
            role: "QA Tester",
            tasksAssigned: 8,
            tasksCompleted: 6,
            hoursWorked: 32
          }
        ],

        sprints: [
          {
            id: "1",
            name: "Sprint 1 - Fundamentos",
            status: "completed",
            startDate: Date.now() - (45 * 24 * 60 * 60 * 1000),
            endDate: Date.now() - (31 * 24 * 60 * 60 * 1000),
            completedTasks: 15,
            totalTasks: 15
          },
          {
            id: "2",
            name: "Sprint 2 - Desarrollo Core",
            status: "completed", 
            startDate: Date.now() - (30 * 24 * 60 * 60 * 1000),
            endDate: Date.now() - (16 * 24 * 60 * 60 * 1000),
            completedTasks: 12,
            totalTasks: 14
          },
          {
            id: "3",
            name: "Sprint 3 - Funcionalidades Avanzadas",
            status: "active",
            startDate: Date.now() - (15 * 24 * 60 * 60 * 1000),
            endDate: Date.now() + (1 * 24 * 60 * 60 * 1000),
            completedTasks: 8,
            totalTasks: 12
          }
        ],

        metrics: {
          totalTasks: 41,
          completedTasks: 35,
          totalHours: 115,
          velocity: 13.5,
          burndownData: [
            { date: Date.now() - (14 * 24 * 60 * 60 * 1000), planned: 12, actual: 12 },
            { date: Date.now() - (12 * 24 * 60 * 60 * 1000), planned: 10, actual: 11 },
            { date: Date.now() - (10 * 24 * 60 * 60 * 1000), planned: 8, actual: 9 },
            { date: Date.now() - (8 * 24 * 60 * 60 * 1000), planned: 6, actual: 7 },
            { date: Date.now() - (6 * 24 * 60 * 60 * 1000), planned: 4, actual: 5 },
            { date: Date.now() - (4 * 24 * 60 * 60 * 1000), planned: 2, actual: 3 },
            { date: Date.now() - (2 * 24 * 60 * 60 * 1000), planned: 0, actual: 1 }
          ]
        }
      };

      return ctx.render({ session, project });
      
    } catch (error) {
      console.error("Error obteniendo proyecto:", error);
      return new Response("Error interno del servidor", { status: 500 });
    }
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

function getSprintStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "planned":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getSprintStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "Completado";
    case "active":
      return "Activo";
    case "planned":
      return "Planificado";
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

export default function ProjectDetailReportPage({ data }: PageProps<Data>) {
  const { session, project } = data;

  return (
    <MainLayout session={session} title={`Reporte - ${project.name}`}>
      <div class="container mx-auto px-4 py-8">
        {/* Header */}
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p class="text-gray-600">{project.description}</p>
            </div>
            <div class="flex items-center space-x-4">
              <span class={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
              <div class="text-right">
                <div class="text-sm text-gray-500">Progreso</div>
                <div class="text-2xl font-bold text-gray-900">{project.progress}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-blue-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Tareas</p>
                <p class="text-2xl font-bold text-gray-900">{project.metrics.totalTasks}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-green-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Tareas Completadas</p>
                <p class="text-2xl font-bold text-gray-900">{project.metrics.completedTasks}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-purple-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Horas Trabajadas</p>
                <p class="text-2xl font-bold text-gray-900">{project.metrics.totalHours}</p>
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
                <p class="text-sm font-medium text-gray-600">Velocidad</p>
                <p class="text-2xl font-bold text-gray-900">{project.metrics.velocity}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipo del proyecto */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Equipo del Proyecto</h3>
            <div class="space-y-4">
              {project.teamMembers.map((member) => (
                <div key={member.id} class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div class="font-medium text-gray-900">{member.name}</div>
                    <div class="text-sm text-gray-500">{member.role}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-900">{member.tasksCompleted}/{member.tasksAssigned} tareas</div>
                    <div class="text-sm text-gray-500">{member.hoursWorked}h trabajadas</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sprints */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sprints del Proyecto</h3>
            <div class="space-y-4">
              {project.sprints.map((sprint) => (
                <div key={sprint.id} class="p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <div class="font-medium text-gray-900">{sprint.name}</div>
                    <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSprintStatusColor(sprint.status)}`}>
                      {getSprintStatusText(sprint.status)}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                    <span>{sprint.completedTasks}/{sprint.totalTasks} tareas</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      style={`width: ${(sprint.completedTasks / sprint.totalTasks) * 100}%`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información del proyecto */}
        <div class="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="text-sm font-medium text-gray-500">Fecha de Inicio</div>
              <div class="text-lg text-gray-900">{formatDate(project.startDate)}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-500">Fecha de Finalización</div>
              <div class="text-lg text-gray-900">{formatDate(project.endDate)}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-500">Estado del Proyecto</div>
              <div class="text-lg text-gray-900">{getStatusText(project.status)}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-500">Progreso General</div>
              <div class="flex items-center">
                <div class="w-32 bg-gray-200 rounded-full h-3 mr-3">
                  <div class="bg-blue-600 h-3 rounded-full" style={`width: ${project.progress}%`}></div>
                </div>
                <span class="text-lg font-medium text-gray-900">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div class="mt-8 flex justify-between">
          <a
            href="/reports/projects"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a Reportes de Proyectos
          </a>
          <div class="space-x-2">
            <a
              href={`/projects/${project.id}`}
              class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            >
              Ver Proyecto
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
      </div>
    </MainLayout>
  );
}
