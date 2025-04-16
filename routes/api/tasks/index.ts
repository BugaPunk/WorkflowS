import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { TaskSchema, TaskStatus } from "../../../models/task.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";
import { TaskService } from "../../../services/backend/index.ts";

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
    const projectId = url.searchParams.get("projectId");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    try {
      let tasks = [];

      // Si se proporcionan filtros avanzados, usar el método de filtrado
      if (projectId || status || search) {
        tasks = await TaskService.getTasksWithFilters({
          userStoryId: userStoryId || undefined,
          projectId: projectId || undefined,
          assignedTo: assignedTo || undefined,
          status: status ? status.split(",").map((s) => s as TaskStatus) : undefined,
          search: search || undefined,
        });
      } else if (userStoryId) {
        // Obtener tareas de una historia de usuario
        tasks = await TaskService.getUserStoryTasks(userStoryId);
      } else if (assignedTo) {
        // Obtener tareas asignadas a un usuario
        tasks = await TaskService.getUserTasks(assignedTo);
      } else {
        return errorResponse("Se requiere al menos un filtro", Status.BadRequest);
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

      // Crear la tarea usando el servicio
      const task = await TaskService.createTask({
        ...result.data,
        createdBy: session.userId,
      });

      return successResponse({ task }, "Tarea creada exitosamente", Status.Created);
    } catch (error) {
      console.error("Error al crear tarea:", error);
      if (error instanceof Error) {
        return errorResponse(error.message, Status.BadRequest);
      }
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  },
};
