import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { UserRole } from "../../../models/user.ts";
import { getKv } from "../../../utils/db.ts";
import { getSprintById, updateSprint, deleteSprint } from "../../../models/sprint.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";

export const handler = {
  // Obtener un sprint específico
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      const sprint = await getSprintById(id);
      if (!sprint) {
        return errorResponse("Sprint no encontrado", Status.NotFound);
      }

      return successResponse({ sprint });
    } catch (error) {
      console.error("Error al obtener sprint:", error);
      return errorResponse("Error al obtener sprint", Status.InternalServerError);
    }
  },

  // Actualizar un sprint
  async PUT(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    // Verificar que el usuario sea Scrum Master o Admin
    if (session.role !== UserRole.SCRUM_MASTER && session.role !== UserRole.ADMIN) {
      return errorResponse("No tienes permisos para actualizar sprints", Status.Forbidden);
    }

    const { id } = ctx.params;

    try {
      // Verificar que el sprint existe
      const sprint = await getSprintById(id);
      if (!sprint) {
        return errorResponse("Sprint no encontrado", Status.NotFound);
      }

      const data = await req.json();
      const updatedSprint = await updateSprint(id, data);

      return successResponse({ sprint: updatedSprint }, "Sprint actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar sprint:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  },

  // Eliminar un sprint
  async DELETE(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    // Verificar que el usuario sea Scrum Master o Admin
    if (session.role !== UserRole.SCRUM_MASTER && session.role !== UserRole.ADMIN) {
      return errorResponse("No tienes permisos para eliminar sprints", Status.Forbidden);
    }

    const { id } = ctx.params;

    try {
      // Verificar que el sprint existe
      const sprint = await getSprintById(id);
      if (!sprint) {
        return errorResponse("Sprint no encontrado", Status.NotFound);
      }

      await deleteSprint(id);

      return successResponse({}, "Sprint eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar sprint:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  }
};
