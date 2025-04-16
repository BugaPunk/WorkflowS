import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { getUserById } from "../../../models/user.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";

export const handler = {
  // Obtener un usuario específico
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      const user = await getUserById(id);
      if (!user) {
        return errorResponse("Usuario no encontrado", Status.NotFound);
      }

      // No devolver información sensible
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return successResponse({ user: safeUser });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return errorResponse("Error al obtener usuario", Status.InternalServerError);
    }
  }
};
