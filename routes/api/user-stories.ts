import type { FreshContext } from "$fresh/server.ts";
import { UserRole } from "../../models/user.ts";
import {
  CreateUserStorySchema,
  createUserStory,
  getUserStoriesWithFilters,
} from "../../models/userStory.ts";
import { Status, errorResponse, handleApiError, successResponse } from "../../utils/api.ts";
import { getKv } from "../../utils/db.ts";
import { getSession } from "../../utils/session.ts";

export const handler = {
  // Obtener historias de usuario
  async GET(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const statusFilter = url.searchParams.get("status");
    const sprintId = url.searchParams.get("sprintId");

    try {
      // Usar la función optimizada para obtener historias de usuario con filtros
      const userStories = await getUserStoriesWithFilters({
        projectId: projectId || undefined,
        status: statusFilter || undefined,
        sprintId: sprintId || undefined,
      });

      // Ordenar por prioridad y fecha de creación
      userStories.sort((a, b) => {
        // Primero por prioridad (critical > high > medium > low)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

        if (priorityDiff !== 0) return priorityDiff;

        // Luego por fecha de creación (más reciente primero)
        return b.createdAt - a.createdAt;
      });

      return successResponse({ userStories });
    } catch (error) {
      console.error("Error al obtener historias de usuario:", error);
      return handleApiError(error);
    }
  },

  // Crear una nueva historia de usuario
  async POST(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    // Verificar que el usuario sea Product Owner o Admin
    if (session.role !== UserRole.PRODUCT_OWNER && session.role !== UserRole.ADMIN) {
      return errorResponse("No tienes permisos para crear historias de usuario", Status.Forbidden);
    }

    try {
      const requestData = await req.json();

      // Validar datos con Zod
      const result = CreateUserStorySchema.safeParse(requestData);
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

      // Crear la historia de usuario usando la función del modelo
      const userStory = await createUserStory(result.data, session.userId);

      return successResponse(
        { userStory },
        "Historia de usuario creada exitosamente",
        Status.Created
      );
    } catch (error) {
      console.error("Error al crear historia de usuario:", error);
      return handleApiError(error);
    }
  },
};
