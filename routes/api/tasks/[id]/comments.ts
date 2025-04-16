import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { Status, errorResponse, successResponse } from "../../../../utils/api.ts";
import { TaskService } from "../../../../services/backend/index.ts";
import { z } from "zod";

// Esquema para validar comentarios
const CommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const handler = {
  // Obtener comentarios de una tarea
  async GET(req: Request, ctx: FreshContext) {
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

      // Obtener comentarios
      const comments = await TaskService.getComments(id);

      return successResponse({ comments });
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      if (error instanceof Error) {
        return errorResponse(error.message, Status.BadRequest);
      }
      return errorResponse("Error al obtener comentarios", Status.InternalServerError);
    }
  },

  // Añadir un comentario a una tarea
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

      // Validar datos del comentario
      const body = await req.json();
      const result = CommentSchema.safeParse(body);

      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      // Añadir comentario
      const comment = await TaskService.addComment(id, session.userId, result.data.content);

      return successResponse({ comment }, "Comentario añadido exitosamente", Status.Created);
    } catch (error) {
      console.error("Error al añadir comentario:", error);
      if (error instanceof Error) {
        return errorResponse(error.message, Status.BadRequest);
      }
      return errorResponse("Error al añadir comentario", Status.InternalServerError);
    }
  },
};
