import type { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import type { UserRole } from "../../models/user.ts";
import { getKv } from "../../utils/db.ts";
import type { UserStory } from "../../models/userStory.ts";
import type { Project } from "../../models/project.ts";
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

    // Obtener la instancia de KV
    const kv = getKv();

    // Obtener todas las historias de usuario
    const userStoriesIterator = kv.list<UserStory>({ prefix: ["userStories"] });
    const userStories: UserStory[] = [];

    for await (const entry of userStoriesIterator) {
      const userStory = entry.value;

      // Filtrar por proyecto si se proporciona un ID
      if (projectId && userStory.projectId !== projectId) continue;

      userStories.push(userStory);
    }

    // Ordenar por prioridad y fecha de creación
    userStories.sort((a, b) => {
      // Primero por prioridad (critical > high > medium > low)
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // Luego por fecha de creación (más reciente primero)
      return b.createdAt - a.createdAt;
    });

    // Obtener todos los proyectos para el formulario de creación
    const projectsIterator = kv.list<Project>({ prefix: ["projects"] });
    const projects: Project[] = [];

    for await (const entry of projectsIterator) {
      projects.push(entry.value);
    }

    return ctx.render({ session, userStories, projects, projectId });
  },
};

interface UserStoriesProps {
  session: {
    id: string;
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
    <MainLayout title="Historias de Usuario - WorkflowS">
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
