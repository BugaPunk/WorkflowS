import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { UserRole } from "../../../models/user.ts";
import { getKv } from "../../../utils/db.ts";
import { TaskSchema, createTask, getUserStoryTasks, getUserTasks } from "../../../models/task.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";

export const handler = {
  // Obtener tareas
  async GET(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const url = new URL(req.url);
    const userStoryId = url.searchParams.get("userStoryId");
    const assignedTo = url.searchParams.get("assignedTo");

    try {
      let tasks = [];

      if (userStoryId) {
        // Obtener tareas de una historia de usuario
        tasks = await getUserStoryTasks(userStoryId);
      } else if (assignedTo) {
        // Obtener tareas asignadas a un usuario
        tasks = await getUserTasks(assignedTo);
      } else {
        return errorResponse("Se requiere userStoryId o assignedTo", Status.BadRequest);
      }

      return successResponse({ tasks });
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      return errorResponse("Error al obtener tareas", Status.InternalServerError);
    }
  },

  // Crear una nueva tarea
  async POST(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    try {
      const data = await req.json();

      // Validar datos requeridos
      const result = TaskSchema.safeParse(data);
      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      // Obtener la instancia de KV
      const kv = getKv();

      // Verificar que la historia de usuario existe
      const userStoryEntry = await kv.get(["userStories", result.data.userStoryId]);
      if (!userStoryEntry.value) {
        return errorResponse("Historia de usuario no encontrada", Status.NotFound);
      }

      // Crear la tarea
      const task = await createTask({
        ...result.data,
        createdBy: session.userId,
      });

      return successResponse({ task }, "Tarea creada exitosamente", Status.Created);
    } catch (error) {
      console.error("Error al crear tarea:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  }
};
