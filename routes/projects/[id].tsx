import type { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import { getKv } from "../../utils/db.ts";
import { type Project, ProjectStatus, ProjectRole } from "../../models/project.ts";
import { type User, UserRole } from "../../models/user.ts";
import { Button } from "../../components/Button.tsx";

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

    // Obtener la instancia de KV
    const kv = getKv();
    
    // Obtener el proyecto
    const projectEntry = await kv.get<Project>(["projects", id]);
    
    if (!projectEntry.value) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/projects",
        },
      });
    }

    const project = projectEntry.value;

    // Obtener información de los miembros del proyecto
    const members = [];
    for (const member of project.members) {
      const userEntry = await kv.get<User>(["users", member.userId]);
      if (userEntry.value) {
        members.push({
          ...member,
          username: userEntry.value.username,
          email: userEntry.value.email,
        });
      }
    }

    // Obtener el creador del proyecto
    const creatorEntry = await kv.get<User>(["users", project.createdBy]);
    const creator = creatorEntry.value;

    // Verificar si el usuario actual es miembro del proyecto
    const isMember = project.members.some(member => member.userId === session.userId);
    
    // Verificar si el usuario actual es Product Owner o Scrum Master del proyecto
    const isProductOwner = project.members.some(
      member => member.userId === session.userId && member.role === ProjectRole.PRODUCT_OWNER
    );
    const isScrumMaster = project.members.some(
      member => member.userId === session.userId && member.role === ProjectRole.SCRUM_MASTER
    );

    // Verificar si el usuario es admin
    const isAdmin = session.role === UserRole.ADMIN;

    // Verificar si el usuario tiene permisos para ver el proyecto
    const hasPermission = isAdmin || isMember;

    if (!hasPermission) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/projects",
        },
      });
    }

    return ctx.render({ 
      session, 
      project: {
        ...project,
        members,
      }, 
      creator,
      isAdmin,
      isProductOwner,
      isScrumMaster,
    });
  },
};

interface ProjectDetailProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  project: Project & {
    members: Array<{
      userId: string;
      projectId: string;
      role: ProjectRole;
      username?: string;
      email?: string;
    }>;
  };
  creator: User | null;
  isAdmin: boolean;
  isProductOwner: boolean;
  isScrumMaster: boolean;
}

export default function ProjectDetailPage({ data }: { data: ProjectDetailProps }) {
  const { session, project, creator, isAdmin, isProductOwner, isScrumMaster } = data;

  // Obtener el nombre de visualización del estado del proyecto
  const getStatusDisplay = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "Planificación";
      case ProjectStatus.IN_PROGRESS:
        return "En Progreso";
      case ProjectStatus.ON_HOLD:
        return "En Pausa";
      case ProjectStatus.COMPLETED:
        return "Completado";
      case ProjectStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };

  // Obtener la clase de color para el estado del proyecto
  const getStatusColorClass = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "bg-blue-100 text-blue-800";
      case ProjectStatus.IN_PROGRESS:
        return "bg-green-100 text-green-800";
      case ProjectStatus.ON_HOLD:
        return "bg-yellow-100 text-yellow-800";
      case ProjectStatus.COMPLETED:
        return "bg-purple-100 text-purple-800";
      case ProjectStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obtener el nombre de visualización del rol en el proyecto
  const getRoleDisplay = (role: ProjectRole) => {
    switch (role) {
      case ProjectRole.PRODUCT_OWNER:
        return "Product Owner";
      case ProjectRole.SCRUM_MASTER:
        return "Scrum Master";
      case ProjectRole.TEAM_MEMBER:
        return "Miembro del Equipo";
      default:
        return role;
    }
  };

  // Formatear fecha
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "No definida";

    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MainLayout title={`Proyecto: ${project.name} - WorkflowS`}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-6 flex justify-between items-center">
            <div class="flex items-center">
              <a
                href="/projects"
                class="text-blue-600 hover:text-blue-800 mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
              </a>
              <h1 class="text-3xl font-bold text-gray-800">Detalles del Proyecto</h1>
            </div>
            <div class="flex space-x-2">
              {(isAdmin || isProductOwner || isScrumMaster) && (
                <a
                  href={`/user-stories?projectId=${project.id}`}
                  class="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Ver Historias de Usuario
                </a>
              )}
              {isAdmin && (
                <a
                  href={`/projects/edit/${project.id}`}
                  class="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Editar Proyecto
                </a>
              )}
            </div>
          </div>

          {/* Información del proyecto */}
          <div class="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div class="flex justify-between items-start">
                <h2 class="text-2xl font-bold text-gray-800">{project.name}</h2>
                <span class={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColorClass(project.status)}`}>
                  {getStatusDisplay(project.status)}
                </span>
              </div>
              {creator && (
                <div class="mt-2">
                  <span class="text-sm text-gray-600">
                    Creado por: {creator.username}
                  </span>
                </div>
              )}
            </div>

            <div class="p-6">
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
                <div class="bg-gray-50 p-4 rounded-lg text-gray-700">
                  {project.description || "Sin descripción"}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">Fechas</h3>
                  <ul class="bg-gray-50 p-4 rounded-lg">
                    <li class="mb-2">
                      <span class="font-medium text-gray-700">Fecha de inicio:</span> {formatDate(project.startDate)}
                    </li>
                    <li>
                      <span class="font-medium text-gray-700">Fecha de finalización:</span> {formatDate(project.endDate)}
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">Equipo</h3>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="mb-2">
                      <span class="font-medium text-gray-700">Miembros:</span> {project.members.length}
                    </p>
                    <div class="mt-2">
                      <a
                        href={`/projects/${project.id}/members`}
                        class="text-blue-600 hover:underline text-sm"
                      >
                        Ver todos los miembros
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles clave */}
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Roles Clave</h3>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Owner */}
                    <div>
                      <h4 class="font-medium text-gray-700">Product Owner:</h4>
                      {project.members.find(m => m.role === ProjectRole.PRODUCT_OWNER) ? (
                        <p class="text-gray-800">
                          {project.members.find(m => m.role === ProjectRole.PRODUCT_OWNER)?.username}
                        </p>
                      ) : (
                        <p class="text-gray-500 italic">No asignado</p>
                      )}
                    </div>

                    {/* Scrum Master */}
                    <div>
                      <h4 class="font-medium text-gray-700">Scrum Master:</h4>
                      {project.members.find(m => m.role === ProjectRole.SCRUM_MASTER) ? (
                        <p class="text-gray-800">
                          {project.members.find(m => m.role === ProjectRole.SCRUM_MASTER)?.username}
                        </p>
                      ) : (
                        <p class="text-gray-500 italic">No asignado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Acciones Rápidas</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a
                    href={`/user-stories?projectId=${project.id}`}
                    class="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg text-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-sm font-medium text-indigo-700">Historias de Usuario</span>
                  </a>

                  {(isAdmin || isScrumMaster) && (
                    <a
                      href={`/projects/${project.id}/sprints`}
                      class="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span class="text-sm font-medium text-green-700">Sprints</span>
                    </a>
                  )}

                  {(isAdmin || isScrumMaster) && (
                    <a
                      href={`/projects/${project.id}/meetings`}
                      class="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm font-medium text-yellow-700">Reuniones</span>
                    </a>
                  )}

                  <a
                    href={`/projects/${project.id}/members`}
                    class="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span class="text-sm font-medium text-blue-700">Miembros</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
