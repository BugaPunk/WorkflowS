import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { getTaskById, updateTask, deleteTask } from "../../../models/task.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";
import { canUpdateTask, canDeleteTask } from "../../../utils/permissions.ts";

export const handler = {
  // Obtener una tarea específica
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      const task = await getTaskById(id);
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
      const task = await getTaskById(id);
      if (!task) {
        return errorResponse("Tarea no encontrada", Status.NotFound);
      }

      // Verificar permisos
      if (!canUpdateTask(session, task)) {
        return errorResponse("No tienes permisos para actualizar esta tarea", Status.Forbidden);
      }

      const data = await req.json();
      const updatedTask = await updateTask(id, data);

      return successResponse({ task: updatedTask }, "Tarea actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
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
      const task = await getTaskById(id);
      if (!task) {
        return errorResponse("Tarea no encontrada", Status.NotFound);
      }

      // Verificar permisos
      if (!canDeleteTask(session, task)) {
        return errorResponse("No tienes permisos para eliminar esta tarea", Status.Forbidden);
      }

      await deleteTask(id);

      return successResponse({}, "Tarea eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  }
};
