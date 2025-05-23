import type { FreshContext } from "$fresh/server.ts";
import { ProjectMemberSchema, addProjectMember, getProjectById } from "../../../models/project.ts";
import { UserRole } from "../../../models/user.ts";
import { Status, errorResponse, handleApiError, successResponse } from "../../../utils/api.ts";
import { getSession } from "../../../utils/session.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Verificar si el usuario está autenticado
  const session = await getSession(req);

  if (!session) {
    return errorResponse("No autenticado", Status.Unauthorized);
  }

  // Solo los administradores pueden asignar usuarios a proyectos
  if (session.role !== UserRole.ADMIN) {
    return errorResponse("No autorizado", Status.Forbidden);
  }

  // Manejar solicitudes POST (asignar usuario a proyecto)
  if (req.method === "POST") {
    try {
      // Parsear el cuerpo de la solicitud
      const body = await req.json();

      // Validar los datos del miembro del proyecto
      const result = ProjectMemberSchema.safeParse(body);

      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      // Verificar que el proyecto existe
      const project = await getProjectById(result.data.projectId);

      if (!project) {
        return errorResponse("Proyecto no encontrado", Status.NotFound);
      }

      // Verificar si el usuario ya está asignado al proyecto
      const isUserAlreadyAssigned = project.members.some(
        (member) => member.userId === result.data.userId
      );

      if (isUserAlreadyAssigned) {
        return errorResponse("El usuario ya está asignado a este proyecto", Status.BadRequest);
      }

      // Asignar el usuario al proyecto
      const member = await addProjectMember(result.data);

      return successResponse(
        { member },
        "Usuario asignado exitosamente al proyecto",
        Status.Created
      );
    } catch (error) {
      console.error("Error al asignar usuario a proyecto:", error);
      return handleApiError(error);
    }
  }

  // Método no permitido
  return errorResponse("Método no permitido", Status.MethodNotAllowed);
};
