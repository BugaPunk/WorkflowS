import type { FreshContext } from "$fresh/server.ts";
import { getTaskById, getTaskHistory } from "../../../../models/task.ts";
import { Status, errorResponse, successResponse } from "../../../../utils/api.ts";
import { getSession } from "../../../../utils/session.ts";

export const handler = {
  // Obtener historial de cambios de una tarea
  async GET(req: Request, ctx: FreshContext) {
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

      // Obtener historial
      const history = await getTaskHistory(id);

      return successResponse({ history });
    } catch (error) {
      console.error("Error al obtener historial:", error);
      return errorResponse("Error al obtener historial", Status.InternalServerError);
    }
  },
};
