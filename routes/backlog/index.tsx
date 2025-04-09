import { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import { getKv } from "../../utils/db.ts";
import { UserRole } from "../../models/user.ts";
import { UserStory, UserStoryStatus } from "../../models/userStory.ts";
import { Project } from "../../models/project.ts";
import ProductBacklog from "../../islands/ProductBacklog.tsx";

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
    
    // Verificar que el usuario sea Product Owner o Admin
    if (session.role !== UserRole.PRODUCT_OWNER && session.role !== UserRole.ADMIN && session.role !== UserRole.SCRUM_MASTER) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }
    
    // Obtener el ID del proyecto si se proporciona
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    
    // Obtener la instancia de KV
    const kv = getKv();
    
    // Obtener todas las historias de usuario en estado BACKLOG
    const userStoriesIterator = kv.list<UserStory>({ prefix: ["userStories"] });
    const backlogItems: UserStory[] = [];
    
    for await (const entry of userStoriesIterator) {
      const userStory = entry.value;
      
      // Filtrar por proyecto si se proporciona un ID
      if (projectId && userStory.projectId !== projectId) continue;
      
      // Solo incluir historias en estado BACKLOG
      if (userStory.status === UserStoryStatus.BACKLOG) {
        backlogItems.push(userStory);
      }
    }
    
    // Ordenar por prioridad y fecha de creación
    backlogItems.sort((a, b) => {
      // Primero por prioridad (critical > high > medium > low)
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Luego por fecha de creación (más reciente primero)
      return b.createdAt - a.createdAt;
    });
    
    // Obtener todos los proyectos para el selector de proyectos
    const projectsIterator = kv.list<Project>({ prefix: ["projects"] });
    const projects: Project[] = [];
    
    for await (const entry of projectsIterator) {
      projects.push(entry.value);
    }
    
    // Obtener el proyecto actual si se proporciona un ID
    let currentProject = null;
    if (projectId) {
      const projectEntry = await kv.get<Project>(["projects", projectId]);
      currentProject = projectEntry.value;
    }
    
    return ctx.render({ 
      session, 
      backlogItems, 
      projects, 
      projectId, 
      currentProject 
    });
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
  const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
  const isAdmin = session.role === UserRole.ADMIN;
  
  return (
    <MainLayout title="Product Backlog - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-xl mx-auto">
          <ProductBacklog
            initialBacklogItems={backlogItems}
            projects={projects}
            projectId={projectId}
            currentProject={currentProject}
            isProductOwner={isProductOwner}
            isAdmin={isAdmin}
            userId={session.userId}
          />
        </div>
      </div>
    </MainLayout>
  );
}
