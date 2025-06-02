import type { FreshContext, PageProps } from "$fresh/server.ts";
import RubricsList from "../../islands/Rubrics/RubricsList.tsx";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { UserRole } from "../../models/user.ts";
import { getSession } from "../../utils/session.ts";

interface Data {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  showTemplates: boolean;
  projectId?: string;
}

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response("", {
        status: 302,
        headers: {
          Location: `/login?redirect=${encodeURIComponent(req.url)}`,
        },
      });
    }

    // Solo los profesores pueden acceder a la gestión de rúbricas
    if (
      session.role !== UserRole.ADMIN &&
      session.role !== UserRole.PRODUCT_OWNER &&
      session.role !== UserRole.SCRUM_MASTER
    ) {
      return new Response("", {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }

    // Obtener parámetros de la URL
    const url = new URL(req.url);
    const showTemplates = url.searchParams.get("templates") === "true";
    const projectId = url.searchParams.get("projectId") || undefined;

    return ctx.render({ session, showTemplates, projectId });
  },
};

export default function RubricsListPage({ data }: PageProps<Data>) {
  const { session, showTemplates, projectId } = data;

  // Determinar el título y descripción según el tipo de vista
  const getPageInfo = () => {
    if (showTemplates) {
      return {
        title: "Plantillas de Rúbricas",
        description: "Explora y gestiona las plantillas de rúbricas disponibles",
        breadcrumb: "Plantillas"
      };
    } else if (projectId) {
      return {
        title: "Rúbricas del Proyecto",
        description: "Gestiona las rúbricas específicas de este proyecto",
        breadcrumb: "Proyecto"
      };
    } else {
      return {
        title: "Mis Rúbricas",
        description: "Gestiona todas tus rúbricas personales y de proyectos",
        breadcrumb: "Mis Rúbricas"
      };
    }
  };

  const pageInfo = getPageInfo();

  // Manejar acciones de rúbricas
  const handleSelectRubric = (rubric: any) => {
    window.location.href = `/rubrics/${rubric.id}`;
  };

  const handleCreateRubric = () => {
    let url = "/rubrics/create";
    const params = new URLSearchParams();
    
    if (showTemplates) {
      params.append("template", "true");
    }
    if (projectId) {
      params.append("projectId", projectId);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    window.location.href = url;
  };

  const handleEditRubric = (rubric: any) => {
    window.location.href = `/rubrics/${rubric.id}/edit`;
  };

  const handleDuplicateRubric = (rubric: any) => {
    // Implementar lógica de duplicación
    console.log("Duplicar rúbrica:", rubric.id);
  };

  const handleDeleteRubric = (rubric: any) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la rúbrica "${rubric.name}"?`)) {
      // Implementar lógica de eliminación
      console.log("Eliminar rúbrica:", rubric.id);
    }
  };

  return (
    <MainLayout title={`${pageInfo.title} - WorkflowS`} session={session}>
      <div class="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav class="flex mb-4" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <a href="/rubrics" class="text-gray-700 hover:text-blue-600">
                Gestión de Rúbricas
              </a>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-1 text-gray-500 md:ml-2">{pageInfo.breadcrumb}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{pageInfo.title}</h1>
          <p class="text-gray-600">{pageInfo.description}</p>
        </div>

        {/* Navegación entre tipos */}
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <a
                href="/rubrics/list"
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  !showTemplates && !projectId
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Mis Rúbricas
              </a>
              <a
                href="/rubrics/list?templates=true"
                class={`py-2 px-1 border-b-2 font-medium text-sm ${
                  showTemplates
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Plantillas
              </a>
            </nav>
          </div>
        </div>

        {/* Lista de rúbricas */}
        <RubricsList
          projectId={projectId}
          templatesOnly={showTemplates}
          onSelectRubric={handleSelectRubric}
          onCreateRubric={handleCreateRubric}
          onEditRubric={handleEditRubric}
          onDeleteRubric={handleDeleteRubric}
          onDuplicateRubric={handleDuplicateRubric}
        />

        {/* Acciones adicionales */}
        <div class="mt-8 flex justify-between items-center">
          <div class="text-sm text-gray-500">
            {showTemplates ? (
              <span>💡 Las plantillas pueden ser utilizadas como base para crear nuevas rúbricas</span>
            ) : (
              <span>💡 Puedes crear rúbricas desde cero o usar plantillas como base</span>
            )}
          </div>
          
          <div class="flex gap-2">
            <a
              href="/rubrics"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Volver al Panel
            </a>
            <a
              href="/rubrics/create"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Nueva Rúbrica
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
