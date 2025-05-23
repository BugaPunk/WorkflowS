import type { FreshContext } from "$fresh/server.ts";
import { z } from "zod";
import { TaskService } from "../../../../services/backend/index.ts";
import { Status, errorResponse, successResponse } from "../../../../utils/api.ts";
import { getSession } from "../../../../utils/session.ts";

// Esquema para validar registro de tiempo
const TimeLogSchema = z.object({
  hours: z.number().min(0.1).max(24),
  action: z.enum(["add", "set"]),
});

export const handler = {
  // Registrar tiempo en una tarea
  async POST(req: Request, ctx: FreshContext) {
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

      // Validar datos del registro de tiempo
      const body = await req.json();
      const result = TimeLogSchema.safeParse(body);

      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      const { hours, action } = result.data;

      // Registrar tiempo usando el servicio
      const updatedTask = await TaskService.logTime(id, hours, action, session.userId);

      return successResponse({ task: updatedTask }, "Tiempo registrado exitosamente");
    } catch (error) {
      console.error("Error al registrar tiempo:", error);
      if (error instanceof Error) {
        return errorResponse(error.message, Status.BadRequest);
      }
      return errorResponse("Error al registrar tiempo", Status.InternalServerError);
    }
  },
};
