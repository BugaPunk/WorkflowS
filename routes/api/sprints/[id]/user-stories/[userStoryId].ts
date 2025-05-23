import type { FreshContext } from "$fresh/server.ts";
import { getSprintById, removeUserStoryFromSprint } from "../../../../../models/sprint.ts";
import { UserRole } from "../../../../../models/user.ts";
import { Status, errorResponse, successResponse } from "../../../../../utils/api.ts";
import { getSession } from "../../../../../utils/session.ts";

export const handler = {
  // Eliminar una historia de usuario de un sprint
  async DELETE(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    // Verificar que el usuario sea Scrum Master o Admin
    if (session.role !== UserRole.SCRUM_MASTER && session.role !== UserRole.ADMIN) {
      return errorResponse("No tienes permisos para modificar sprints", Status.Forbidden);
    }

    const { id, userStoryId } = ctx.params;

    try {
      // Verificar que el sprint existe
      const sprint = await getSprintById(id);
      if (!sprint) {
        return errorResponse("Sprint no encontrado", Status.NotFound);
      }

      // Verificar que la historia de usuario está en el sprint
      if (!sprint.userStoryIds.includes(userStoryId)) {
        return errorResponse("La historia de usuario no está en el sprint", Status.BadRequest);
      }

      const updatedSprint = await removeUserStoryFromSprint(id, userStoryId);

      return successResponse(
        { sprint: updatedSprint },
        "Historia de usuario eliminada del sprint exitosamente"
      );
    } catch (error) {
      console.error("Error al eliminar historia de usuario del sprint:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  },
};
