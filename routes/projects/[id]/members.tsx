import type { Handlers, PageProps } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { getProjectById, ProjectRole } from "../../../models/project.ts";
import { getUserById, UserRole } from "../../../models/user.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import ProjectMembersList from "../../../islands/Projects/ProjectMembersList.tsx";

interface ProjectMembersPageData {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  project: Awaited<ReturnType<typeof getProjectById>>;
  isAdmin: boolean;
  isProductOwner: boolean;
  isScrumMaster: boolean;
}

export const handler: Handlers<ProjectMembersPageData | null> = {
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

    // Verificar si el usuario actual es miembro del proyecto
    const isMember = project.members.some((member) => member.userId === session.userId);

    // Verificar si el usuario actual es Product Owner o Scrum Master del proyecto
    const isProductOwner = project.members.some(
      (member) => member.userId === session.userId && member.role === ProjectRole.PRODUCT_OWNER
    );
    const isScrumMaster = project.members.some(
      (member) => member.userId === session.userId && member.role === ProjectRole.SCRUM_MASTER
    );

    // Verificar si el usuario es admin
    const isAdmin = session.role === UserRole.ADMIN;

    // Verificar si el usuario tiene permisos para ver el proyecto
    const hasPermission = isAdmin || isMember;

    if (!hasPermission) {
      return new Response("", {
        status: 302,
        headers: { Location: "/projects" },
      });
    }

    // Obtener información completa de los miembros
    for (const member of project.members) {
      if (!member.username || !member.email) {
        const user = await getUserById(member.userId);
        if (user) {
          member.username = user.username;
          member.email = user.email;
        }
      }
    }

    return ctx.render({
      session,
      project,
      isAdmin,
      isProductOwner,
      isScrumMaster,
    });
  },
};

export default function ProjectMembersPage({ data }: PageProps<ProjectMembersPageData | null>) {
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

  // Extraemos solo las variables que necesitamos
  const { session, project, isAdmin } = data;

  // Ignoramos las variables que no usamos
  // const isProductOwner = data.isProductOwner;
  // const isScrumMaster = data.isScrumMaster;

  // Verificar que project no sea null
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
    <MainLayout title={`Miembros del Proyecto: ${project.name} - WorkflowS`} session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          {/* Encabezado */}
          <div class="mb-6 flex justify-between items-center">
            <div class="flex items-center">
              <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-800 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-labelledby="backArrowTitle"
                  role="img"
                >
                  <title id="backArrowTitle">Volver al proyecto</title>
                  <path
                    fill-rule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </a>
              <h1 class="text-3xl font-bold text-gray-800">Miembros del Proyecto</h1>
            </div>
            {isAdmin && (
              <a
                href={`/projects/${project.id}`}
                class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Asignar Miembros
              </a>
            )}
          </div>

          {/* Información del proyecto */}
          <div class="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 class="text-2xl font-bold text-gray-800">{project.name}</h2>
            </div>
          </div>

          {/* Lista de miembros */}
          <ProjectMembersList members={project.members} projectId={project.id} isAdmin={isAdmin} />
        </div>
      </div>
    </MainLayout>
  );
}
