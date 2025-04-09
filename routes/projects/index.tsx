import type { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import { UserRole } from "../../models/user.ts";
import { getAllProjects, getUserProjects, type Project } from "../../models/project.ts";
import ProjectsList from "../../islands/ProjectsList.tsx";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    // Verificar si el usuario está autenticado
    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }

    try {
      let projects;

      // Los administradores pueden ver todos los proyectos
      if (session.role === UserRole.ADMIN) {
        projects = await getAllProjects();
      } else {
        // Los usuarios no administradores solo pueden ver sus proyectos
        projects = await getUserProjects(session.userId);
      }

      return ctx.render({ session, projects });
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      return ctx.render({ session, projects: [], error: "Error al cargar los proyectos" });
    }
  },
};

interface ProjectsPageProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projects: Project[];
  error?: string;
}

export default function ProjectsPage({ data }: { data: ProjectsPageProps }) {
  const { session, projects } = data;
  const isAdmin = session.role === UserRole.ADMIN;

  return (
    <MainLayout title="Proyectos - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-xl mx-auto">
          <ProjectsList
            initialProjects={projects}
            isAdmin={isAdmin}
            currentUserId={session.userId}
          />
        </div>
      </div>
    </MainLayout>
  );
}
