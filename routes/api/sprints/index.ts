import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { UserRole } from "../../../models/user.ts";
import { getKv } from "../../../utils/db.ts";
import { SprintSchema, createSprint, getProjectSprints } from "../../../models/sprint.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";

export const handler = {
  // Obtener sprints
  async GET(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return errorResponse("Se requiere ID de proyecto", Status.BadRequest);
    }

    try {
      const sprints = await getProjectSprints(projectId);
      return successResponse({ sprints });
    } catch (error) {
      console.error("Error al obtener sprints:", error);
      return errorResponse("Error al obtener sprints", Status.InternalServerError);
    }
  },

  // Crear un nuevo sprint
  async POST(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    // Verificar que el usuario sea Scrum Master o Admin
    if (session.role !== UserRole.SCRUM_MASTER && session.role !== UserRole.ADMIN) {
      return errorResponse("No tienes permisos para crear sprints", Status.Forbidden);
    }

    try {
      const data = await req.json();

      // Validar datos requeridos
      const result = SprintSchema.safeParse(data);
      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      // Obtener la instancia de KV
      const kv = getKv();

      // Verificar que el proyecto existe
      const projectEntry = await kv.get(["projects", result.data.projectId]);
      if (!projectEntry.value) {
        return errorResponse("El proyecto no existe", Status.NotFound);
      }

      // Crear el sprint
      const sprint = await createSprint({
        ...result.data,
        createdBy: session.userId,
      });

      return successResponse({ sprint }, "Sprint creado exitosamente", Status.Created);
    } catch (error) {
      console.error("Error al crear sprint:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  }
};
