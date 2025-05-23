import type { FreshContext } from "$fresh/server.ts";
import { getProjectById, getProjectMembers } from "../../../../models/project.ts";
import { getUserById } from "../../../../models/user.ts";
import { Status, errorResponse, successResponse } from "../../../../utils/api.ts";
import { getSession } from "../../../../utils/session.ts";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      // Verificar que el proyecto existe
      const project = await getProjectById(id);
      if (!project) {
        return errorResponse("Proyecto no encontrado", Status.NotFound);
      }

      // Obtener los miembros del proyecto
      const members = await getProjectMembers(id);

      // Obtener información completa de los miembros
      const membersWithDetails = await Promise.all(
        members.map(async (member) => {
          const user = await getUserById(member.userId);
          return {
            ...member,
            username: user?.username || "",
            email: user?.email || "",
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
          };
        })
      );

      return successResponse({ members: membersWithDetails });
    } catch (error) {
      console.error("Error al obtener miembros del proyecto:", error);
      return errorResponse("Error al obtener miembros del proyecto", Status.InternalServerError);
    }
  },
};
