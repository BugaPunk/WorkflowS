import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { UserRole, deleteUser, getUserById } from "../../../../models/user.ts";
import { PROJECT_COLLECTIONS } from "../../../../models/project.ts";
import { getKv } from "../../../../utils/db.ts";
import { Status, errorResponse, successResponse, handleApiError } from "../../../../utils/api.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Solo permitir solicitudes DELETE
  if (req.method !== "DELETE") {
    return errorResponse("Método no permitido", Status.MethodNotAllowed);
  }

  try {
    // Verificar si el usuario está autenticado
    const session = await getSession(req);

    if (!session) {
      return errorResponse("No autenticado", Status.Unauthorized);
    }

    // Verificar si el usuario es administrador
    if (session.role !== UserRole.ADMIN) {
      return errorResponse("No autorizado", Status.Forbidden);
    }

    // Obtener el ID del usuario a eliminar
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (!userId) {
      return errorResponse("Se requiere el ID del usuario", Status.BadRequest);
    }

    // Verificar que el usuario existe
    const user = await getUserById(userId);

    if (!user) {
      return errorResponse("Usuario no encontrado", Status.NotFound);
    }

    // No permitir eliminar al propio usuario
    if (userId === session.userId) {
      return errorResponse("No puedes eliminar tu propia cuenta", Status.BadRequest);
    }

    // Verificar si el usuario está asignado a algún proyecto
    const kv = getKv();
    const projectMembersIterator = kv.list({
      prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", userId]
    });

    let hasProjects = false;
    for await (const _ of projectMembersIterator) {
      hasProjects = true;
      break;
    }

    if (hasProjects) {
      return errorResponse("No se puede eliminar el usuario porque está asignado a uno o más proyectos. Elimina primero las asignaciones de proyectos.", Status.BadRequest);
    }

    // Eliminar el usuario
    const success = await deleteUser(userId);

    if (!success) {
      return errorResponse("Error al eliminar el usuario", Status.InternalServerError);
    }

    return successResponse({}, "Usuario eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return handleApiError(error);
  }
};
