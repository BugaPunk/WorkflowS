import type { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import type { UserRole } from "../../models/user.ts";
import type { UserStory } from "../../models/userStory.ts";
import { getUserStoriesWithFilters } from "../../models/userStory.ts";
import type { Project } from "../../models/project.ts";
import { getAllProjects } from "../../models/project.ts";
import UserStoriesList from "../../islands/UserStories/UserStoriesList.tsx";

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

    // Obtener el ID del proyecto si se proporciona
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    // Obtener historias de usuario con filtros usando la función del modelo
    const userStories = await getUserStoriesWithFilters({
      projectId: projectId || undefined,
    });

    // Ordenar por prioridad y fecha de creación
    userStories.sort((a, b) => {
      // Primero por prioridad (critical > high > medium > low)
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // Luego por fecha de creación (más reciente primero)
      return b.createdAt - a.createdAt;
    });

    // Obtener todos los proyectos para el formulario de creación usando la función del modelo
    const projects = await getAllProjects();

    // Asegurarnos de que la sesión tenga el formato correcto para MainLayout
    const sessionData = {
      userId: session.userId,
      username: session.username,
      email: session.email,
      role: session.role,
    };

    return ctx.render({ session: sessionData, userStories, projects, projectId });
  },
};

interface UserStoriesProps {
  session: {
    userId: string; // Cambiado de id a userId para coincidir con MainLayout
    username: string;
    email: string;
    role: UserRole;
  };
  userStories: UserStory[];
  projects: Project[];
  projectId?: string;
}

export default function UserStoriesPage({ data }: { data: UserStoriesProps }) {
  const { session, userStories, projects, projectId } = data;

  return (
    <MainLayout title="Historias de Usuario - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-xl mx-auto">
          <UserStoriesList
            initialUserStories={userStories}
            projects={projects}
            userRole={session.role}
            projectId={projectId}
          />
        </div>
      </div>
    </MainLayout>
  );
}
