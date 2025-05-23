import ProductBacklog from "../../islands/Backlog/ProductBacklog.tsx";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import type { Project } from "../../models/project.ts";
import { getAllProjects, getProjectById } from "../../models/project.ts";
import { UserRole } from "../../models/user.ts";
import {
  type UserStory,
  UserStoryStatus,
  getUserStoriesWithFilters,
} from "../../models/userStory.ts";
import { type FreshContextWithSession, requireRole } from "../../utils/session.ts";

// Utilizar el middleware requireRole para verificar que el usuario tenga los roles permitidos
export const handler = {
  async GET(req: Request, ctx: FreshContextWithSession) {
    // Verificar que el usuario tenga permisos para ver el backlog
    return await requireRole(
      [UserRole.PRODUCT_OWNER, UserRole.ADMIN, UserRole.SCRUM_MASTER],
      async (req: Request, ctx: FreshContextWithSession) => {
        const session = ctx.session!;

        // Obtener el ID del proyecto si se proporciona
        const url = new URL(req.url);
        const projectId = url.searchParams.get("projectId");

        // Obtener historias de usuario con filtros usando la función optimizada
        const backlogItems = await getUserStoriesWithFilters({
          projectId: projectId || undefined,
          status: UserStoryStatus.BACKLOG,
        });

        // Ordenar por prioridad y fecha de creación
        backlogItems.sort((a, b) => {
          // Primero por prioridad (critical > high > medium > low)
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

          if (priorityDiff !== 0) return priorityDiff;

          // Luego por fecha de creación (más reciente primero)
          return b.createdAt - a.createdAt;
        });

        // Obtener todos los proyectos para el selector de proyectos usando la función optimizada
        const projects = await getAllProjects();

        // Obtener el proyecto actual si se proporciona un ID usando la función optimizada
        let currentProject = null;
        if (projectId) {
          currentProject = await getProjectById(projectId);
        }

        return ctx.render({
          session,
          backlogItems,
          projects,
          projectId,
          currentProject,
        });
      }
    )(req, ctx);
  },
};

interface BacklogPageProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  backlogItems: UserStory[];
  projects: Project[];
  projectId?: string;
  currentProject: Project | null;
}

export default function BacklogPage({ data }: { data: BacklogPageProps }) {
  const { session, backlogItems, projects, projectId, currentProject } = data;
  // Utilizar las funciones de permisos para determinar los roles
  const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
  const isAdmin = session.role === UserRole.ADMIN;

  return (
    <MainLayout title="Product Backlog - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-xl mx-auto">
          <ProductBacklog
            initialBacklogItems={backlogItems}
            projects={projects}
            projectId={projectId}
            currentProject={currentProject}
            isProductOwner={isProductOwner}
            isAdmin={isAdmin}
            _userId={session.userId}
          />
        </div>
      </div>
    </MainLayout>
  );
}
