import type { Handlers, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import { getSession } from "../utils/session.ts";
import { getUserTasks } from "../models/task.ts";
import { getUserById } from "../models/user.ts";
import { getProjectById } from "../models/project.ts";
import { getUserStoryById } from "../models/userStory.ts";
import MyTasksList from "../islands/Tasks/MyTasksList.tsx";
import type { Project } from "../models/project.ts";
import type { UserStory } from "../models/userStory.ts";

interface MyTasksPageData {
  session: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
  tasks: Awaited<ReturnType<typeof getUserTasks>>;
  user: Awaited<ReturnType<typeof getUserById>>;
  // Mapas para almacenar información relacionada
  projects: Record<string, Awaited<ReturnType<typeof getProjectById>>>;
  userStories: Record<string, Awaited<ReturnType<typeof getUserStoryById>>>;
}

export const handler: Handlers<MyTasksPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    try {
      // Obtener el usuario actual
      const user = await getUserById(session.userId);
      if (!user) {
        return ctx.render(null);
      }

      // Obtener todas las tareas asignadas al usuario
      const tasks = await getUserTasks(session.userId);

      // Obtener información de proyectos y historias de usuario relacionadas
      const projects: Record<string, Awaited<ReturnType<typeof getProjectById>>> = {};
      const userStories: Record<string, Awaited<ReturnType<typeof getUserStoryById>>> = {};

      // Recopilar IDs únicos de historias de usuario
      const userStoryIds = new Set(tasks.map((task) => task.userStoryId));

      // Obtener información de cada historia de usuario
      for (const userStoryId of userStoryIds) {
        const userStory = await getUserStoryById(userStoryId);
        if (userStory) {
          userStories[userStoryId] = userStory;

          // Obtener información del proyecto si aún no la tenemos
          if (!projects[userStory.projectId]) {
            const project = await getProjectById(userStory.projectId);
            if (project) {
              projects[userStory.projectId] = project;
            }
          }
        }
      }

      return ctx.render({
        session,
        tasks,
        user,
        projects,
        userStories,
      });
    } catch (error) {
      console.error("Error al cargar tareas del usuario:", error);
      return ctx.render(null);
    }
  },
};

export default function MyTasksPage({ data }: PageProps<MyTasksPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Mis Tareas - WorkflowS" session={null}>
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>Error al cargar las tareas. Por favor, intenta de nuevo más tarde.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { session, tasks, user: _user, projects: projectsWithNull, userStories: userStoriesWithNull } = data;

  // Filtrar valores nulos para satisfacer los tipos
  const projects: Record<string, Project> = {};
  const userStories: Record<string, UserStory> = {};

  for (const [key, value] of Object.entries(projectsWithNull)) {
    if (value !== null) {
      projects[key] = value;
    }
  }

  for (const [key, value] of Object.entries(userStoriesWithNull)) {
    if (value !== null) {
      userStories[key] = value;
    }
  }

  return (
    <MainLayout title="Mis Tareas - WorkflowS" session={session}>
      <div class="px-4 py-6 mx-auto">
        <div class="max-w-screen-xl mx-auto">
          {/* Encabezado */}
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Mis Tareas</h1>
            <p class="text-gray-600">
              Gestiona todas las tareas asignadas a ti en diferentes proyectos y sprints.
            </p>
          </div>

          {/* Contenido principal */}
          <MyTasksList initialTasks={tasks} projects={projects} userStories={userStories} />
        </div>
      </div>
    </MainLayout>
  );
}
