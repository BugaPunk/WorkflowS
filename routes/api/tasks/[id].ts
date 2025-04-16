import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";
import { canUpdateTask, canDeleteTask } from "../../../utils/permissions.ts";
import { TaskService } from "../../../services/backend/index.ts";

export const handler = {
  // Obtener una tarea específica
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      const task = await TaskService.getTaskById(id);
      if (!task) {
        return errorResponse("Tarea no encontrada", Status.NotFound);
      }

      return successResponse({ task });
    } catch (error) {
      console.error("Error al obtener tarea:", error);
      return errorResponse("Error al obtener tarea", Status.InternalServerError);
    }
  },

  // Actualizar una tarea
  async PUT(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      // Verificar que la tarea existe
      const task = await TaskService.getTaskById(id);
      if (!task) {
        return errorResponse("Tarea no encontrada", Status.NotFound);
      }

      // Verificar permisos
      if (!canUpdateTask(session, task)) {
        return errorResponse("No tienes permisos para actualizar esta tarea", Status.Forbidden);
      }

      const data = await req.json();

      // Extraer el ID del usuario para el historial si se proporciona
      const { _userId, ...updateData } = data;
      const userId = _userId || session.userId;

      const updatedTask = await TaskService.updateTask(id, updateData, userId);

      return successResponse({ task: updatedTask }, "Tarea actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      if (error instanceof Error) {
        return errorResponse(error.message, Status.BadRequest);
      }
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  },

  // Eliminar una tarea
  async DELETE(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      // Verificar que la tarea existe
      const task = await TaskService.getTaskById(id);
      if (!task) {
        return errorResponse("Tarea no encontrada", Status.NotFound);
      }

      // Verificar permisos
      if (!canDeleteTask(session, task)) {
        return errorResponse("No tienes permisos para eliminar esta tarea", Status.Forbidden);
      }

      const success = await TaskService.deleteTask(id);
      if (!success) {
        return errorResponse("No se pudo eliminar la tarea", Status.InternalServerError);
      }

      return successResponse({}, "Tarea eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      if (error instanceof Error) {
        return errorResponse(error.message, Status.BadRequest);
      }
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  },
};
