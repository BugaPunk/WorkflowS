import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { UserRole } from "../../../../models/user.ts";
import { getKv } from "../../../../utils/db.ts";
import { getSprintById, addUserStoryToSprint } from "../../../../models/sprint.ts";
import { Status, errorResponse, successResponse } from "../../../../utils/api.ts";

export const handler = {
  // Añadir una historia de usuario a un sprint
  async POST(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    // Verificar que el usuario sea Scrum Master o Admin
    if (session.role !== UserRole.SCRUM_MASTER && session.role !== UserRole.ADMIN) {
      return errorResponse("No tienes permisos para modificar sprints", Status.Forbidden);
    }

    const { id } = ctx.params;

    try {
      // Verificar que el sprint existe
      const sprint = await getSprintById(id);
      if (!sprint) {
        return errorResponse("Sprint no encontrado", Status.NotFound);
      }

      const data = await req.json();
      if (!data.userStoryId) {
        return errorResponse("Se requiere ID de historia de usuario", Status.BadRequest);
      }

      // Verificar que la historia de usuario existe
      const kv = getKv();
      const userStoryEntry = await kv.get(["userStories", data.userStoryId]);
      if (!userStoryEntry.value) {
        return errorResponse("Historia de usuario no encontrada", Status.NotFound);
      }

      const updatedSprint = await addUserStoryToSprint(id, data.userStoryId);

      return successResponse({ sprint: updatedSprint }, "Historia de usuario añadida al sprint exitosamente");
    } catch (error) {
      console.error("Error al añadir historia de usuario al sprint:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  }
};
