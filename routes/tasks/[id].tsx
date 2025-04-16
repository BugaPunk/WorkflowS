import { Handlers, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import { getTaskById } from "../../models/task.ts";
import { getUserStoryById } from "../../models/userStory.ts";
import { getProjectById } from "../../models/project.ts";
import { getUserById, UserRole } from "../../models/user.ts";
import TaskDetailView from "../../islands/Tasks/TaskDetailView.tsx";

interface TaskDetailPageData {
  task: Awaited<ReturnType<typeof getTaskById>>;
  userStory: Awaited<ReturnType<typeof getUserStoryById>>;
  project: Awaited<ReturnType<typeof getProjectById>>;
  assignedUser: Awaited<ReturnType<typeof getUserById>>;
  createdByUser: Awaited<ReturnType<typeof getUserById>>;
  canManageTask: boolean;
}

export const handler: Handlers<TaskDetailPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const { id } = ctx.params;
    const task = await getTaskById(id);

    if (!task) {
      return ctx.render(null);
    }

    // Obtener la historia de usuario relacionada
    const userStory = await getUserStoryById(task.userStoryId);
    if (!userStory) {
      return ctx.render(null);
    }

    // Obtener el proyecto relacionado
    const project = await getProjectById(userStory.projectId);
    if (!project) {
      return ctx.render(null);
    }

    // Obtener información del usuario asignado
    let assignedUser = null;
    if (task.assignedTo) {
      assignedUser = await getUserById(task.assignedTo);
    }

    // Obtener información del creador
    const createdByUser = await getUserById(task.createdBy);

    // Determinar permisos
    const isAdmin = session.role === UserRole.ADMIN;
    const isScrumMaster = session.role === UserRole.SCRUM_MASTER;
    const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
    const isTeamMember = session.role === UserRole.TEAM_DEVELOPER;
    
    // Admin, Scrum Master, Product Owner y Team Developer pueden gestionar tareas
    const canManageTask = isAdmin || isScrumMaster || isProductOwner || isTeamMember;

    return ctx.render({
      task,
      userStory,
      project,
      assignedUser,
      createdByUser,
      canManageTask,
    });
  },
};

export default function TaskDetailPage({ data }: PageProps<TaskDetailPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Tarea no encontrada - WorkflowS">
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>Tarea no encontrada.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { task, userStory, project, assignedUser, createdByUser, canManageTask } = data;

  return (
    <MainLayout title={`Tarea: ${task.title} - WorkflowS`}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          <TaskDetailView
            task={task}
            userStory={userStory}
            project={project}
            assignedUser={assignedUser}
            createdByUser={createdByUser}
            canManageTask={canManageTask}
          />
        </div>
      </div>
    </MainLayout>
  );
}
