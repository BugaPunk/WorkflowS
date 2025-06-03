import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { getUserStoryById, updateUserStory } from "../../../models/userStory.ts";
import { getProjectById } from "../../../models/project.ts";
import { getProjectSprints, addUserStoryToSprint } from "../../../models/sprint.ts";
import { getUserById } from "../../../models/user.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import { Button } from "../../../components/Button.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const sessionId = cookies.session;

    if (!sessionId) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const userStoryId = ctx.params.id;
    const userStory = await getUserStoryById(userStoryId);

    if (!userStory) {
      return new Response("Historia de usuario no encontrada", { status: 404 });
    }

    // Verificar que el usuario tenga permisos
    const user = await getUserById(sessionId);
    if (!user || (user.role !== "admin" && user.role !== "product_owner")) {
      return new Response("No autorizado", { status: 403 });
    }

    // Obtener el proyecto
    const project = await getProjectById(userStory.projectId);
    if (!project) {
      return new Response("Proyecto no encontrado", { status: 404 });
    }

    // Obtener los sprints del proyecto
    const sprints = await getProjectSprints(userStory.projectId);

    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return ctx.render({ session: sessionData, userStory, project, sprints });
  },

  async POST(req, ctx) {
    const cookies = getCookies(req.headers);
    const sessionId = cookies.session;

    if (!sessionId) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const userStoryId = ctx.params.id;
    const userStory = await getUserStoryById(userStoryId);

    if (!userStory) {
      return new Response("Historia de usuario no encontrada", { status: 404 });
    }

    // Verificar que el usuario tenga permisos
    const user = await getUserById(sessionId);
    if (!user || (user.role !== "admin" && user.role !== "product_owner")) {
      return new Response("No autorizado", { status: 403 });
    }

    const formData = await req.formData();
    const sprintId = formData.get("sprintId") as string;

    if (!sprintId) {
      return new Response("Sprint ID es requerido", { status: 400 });
    }

    try {
      // Actualizar la historia de usuario con el sprintId
      await updateUserStory(userStoryId, { sprintId });

      // Agregar la historia de usuario al sprint
      await addUserStoryToSprint(sprintId, userStoryId);

      return new Response("", {
        status: 302,
        headers: { Location: `/user-stories/${userStoryId}` },
      });
    } catch (error) {
      console.error("Error al asignar historia de usuario al sprint:", error);
      return new Response("Error interno del servidor", { status: 500 });
    }
  },
};

interface AssignSprintProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
  userStory: any;
  project: any;
  sprints: any[];
}

export default function AssignSprintPage({ data }: PageProps<AssignSprintProps>) {
  const { session, userStory, project, sprints } = data;

  return (
    <MainLayout session={session}>
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white shadow-md rounded-lg p-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">
              Asignar Historia de Usuario a Sprint
            </h1>

            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 class="text-lg font-semibold text-gray-700 mb-2">Historia de Usuario</h2>
              <p class="text-gray-600 mb-2">
                <strong>Título:</strong> {userStory.title}
              </p>
              <p class="text-gray-600 mb-2">
                <strong>Proyecto:</strong> {project.name}
              </p>
              <p class="text-gray-600">
                <strong>Puntos:</strong> {userStory.points || "No estimado"}
              </p>
            </div>

            <form method="POST" class="space-y-6">
              <div>
                <label for="sprintId" class="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Sprint
                </label>
                <select
                  id="sprintId"
                  name="sprintId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un sprint...</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                      {sprint.startDate && sprint.endDate && (
                        ` - ${new Date(sprint.startDate).toLocaleDateString()} a ${new Date(sprint.endDate).toLocaleDateString()}`
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div class="flex justify-between">
                <Button
                  type="button"
                  onClick={() => window.history.back()}
                  class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Asignar a Sprint
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
