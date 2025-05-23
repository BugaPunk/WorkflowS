import type { FreshContext } from "$fresh/server.ts";
import { ProjectSchema } from "../../../models/project.ts";
import { UserRole } from "../../../models/user.ts";
import { ProjectService } from "../../../services/backend/index.ts";
import { Status, errorResponse, handleApiError, successResponse } from "../../../utils/api.ts";
import { getSession } from "../../../utils/session.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Verificar si el usuario está autenticado
  const session = await getSession(req);

  if (!session) {
    return errorResponse("No autenticado", Status.Unauthorized);
  }

  // Manejar solicitudes GET
  if (req.method === "GET") {
    try {
      let projects;

      // Los administradores pueden ver todos los proyectos
      if (session.role === UserRole.ADMIN) {
        projects = await ProjectService.getAllProjects();
      } else {
        // Los usuarios no administradores solo pueden ver sus proyectos
        projects = await ProjectService.getUserProjects(session.userId);
      }

      return successResponse({ projects });
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      return handleApiError(error);
    }
  }

  // Manejar solicitudes POST (crear proyecto)
  if (req.method === "POST") {
    // Solo los administradores pueden crear proyectos
    if (session.role !== UserRole.ADMIN) {
      return errorResponse("No autorizado", Status.Forbidden);
    }

    try {
      // Parsear el cuerpo de la solicitud
      const body = await req.json();

      // Validar los datos del proyecto
      const result = ProjectSchema.safeParse(body);

      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      // Crear el proyecto
      const project = await ProjectService.createProject(result.data);

      return successResponse({ project }, "Proyecto creado exitosamente", Status.Created);
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      return handleApiError(error);
    }
  }

  // Manejar solicitudes PUT (actualizar proyecto)
  if (req.method === "PUT") {
    // Solo los administradores pueden actualizar proyectos
    if (session.role !== UserRole.ADMIN) {
      return errorResponse("No autorizado", Status.Forbidden);
    }

    try {
      // Parsear el cuerpo de la solicitud
      const body = await req.json();

      // Verificar que se proporcionó un ID de proyecto
      if (!body.id) {
        return errorResponse("Se requiere el ID del proyecto", Status.BadRequest);
      }

      // Verificar que el proyecto existe
      const project = await ProjectService.getProjectById(body.id);

      if (!project) {
        return errorResponse("Proyecto no encontrado", Status.NotFound);
      }

      // Validar los datos del proyecto
      const result = ProjectSchema.partial().safeParse(body);

      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      // Actualizar el proyecto
      const updatedProject = await ProjectService.updateProject(project.id, {
        ...result.data,
      });

      return successResponse({ project: updatedProject }, "Proyecto actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      return handleApiError(error);
    }
  }

  // Manejar solicitudes DELETE (eliminar proyecto)
  if (req.method === "DELETE") {
    // Solo los administradores pueden eliminar proyectos
    if (session.role !== UserRole.ADMIN) {
      return errorResponse("No autorizado", Status.Forbidden);
    }

    try {
      // Obtener el ID del proyecto de la URL
      const url = new URL(req.url);
      const projectId = url.searchParams.get("id");

      if (!projectId) {
        return errorResponse("Se requiere el ID del proyecto", Status.BadRequest);
      }

      // Verificar que el proyecto existe
      const project = await ProjectService.getProjectById(projectId);

      if (!project) {
        return errorResponse("Proyecto no encontrado", Status.NotFound);
      }

      // Eliminar el proyecto
      const success = await ProjectService.deleteProject(projectId);

      if (!success) {
        return errorResponse("No se pudo eliminar el proyecto", Status.InternalServerError);
      }

      return successResponse({}, "Proyecto eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      return handleApiError(error);
    }
  }

  // Método no permitido
  return errorResponse("Método no permitido", Status.MethodNotAllowed);
};
