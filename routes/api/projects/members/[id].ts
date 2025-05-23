import type { FreshContext } from "$fresh/server.ts";
import { getProjectById } from "../../../../models/project.ts";
import { UserRole } from "../../../../models/user.ts";
import { Status, errorResponse, handleApiError, successResponse } from "../../../../utils/api.ts";
import { COLLECTIONS, getKv } from "../../../../utils/db.ts";
import { getSession } from "../../../../utils/session.ts";

export const handler = async (req: Request, ctx: FreshContext): Promise<Response> => {
  // Verificar si el usuario está autenticado
  const session = await getSession(req);

  if (!session) {
    return errorResponse("No autenticado", Status.Unauthorized);
  }

  // Solo los administradores pueden eliminar miembros de proyectos
  if (session.role !== UserRole.ADMIN) {
    return errorResponse("No autorizado", Status.Forbidden);
  }

  const { id } = ctx.params; // ID del miembro del proyecto

  // Manejar solicitudes DELETE (eliminar miembro del proyecto)
  if (req.method === "DELETE") {
    try {
      // Obtener la instancia de KV
      const kv = getKv();

      // Obtener el miembro del proyecto
      const memberKey = [...COLLECTIONS.PROJECT_MEMBERS, id];
      const memberResult = await kv.get(memberKey);

      if (!memberResult.value) {
        return errorResponse("Miembro no encontrado", Status.NotFound);
      }

      const member = memberResult.value as {
        userId: string;
        projectId: string;
      };

      // Eliminar el miembro del proyecto
      await kv.delete(memberKey);

      // Eliminar los índices
      await kv.delete([...COLLECTIONS.PROJECT_MEMBERS, "by_user", member.userId, member.projectId]);
      await kv.delete([
        ...COLLECTIONS.PROJECT_MEMBERS,
        "by_project",
        member.projectId,
        member.userId,
      ]);

      // Actualizar la lista de miembros del proyecto
      const project = await getProjectById(member.projectId);
      if (project) {
        const updatedProject = {
          ...project,
          members: project.members.filter((m) => m.id !== id),
        };

        const projectKey = [...COLLECTIONS.PROJECTS, project.id];
        await kv.set(projectKey, updatedProject);
      }

      return successResponse({}, "Miembro eliminado exitosamente del proyecto");
    } catch (error) {
      console.error("Error al eliminar miembro del proyecto:", error);
      return handleApiError(error);
    }
  }

  // Método no permitido
  return errorResponse("Método no permitido", Status.MethodNotAllowed);
};
