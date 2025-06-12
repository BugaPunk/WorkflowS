import type { FreshContext } from "$fresh/server.ts";
import {
  UpdateUserStorySchema,
  deleteUserStory,
  getUserStoryById,
  updateUserStory,
} from "../../../models/userStory.ts";
import { getSprintById, updateSprint } from "../../../models/sprint.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";
import { getSession } from "../../../utils/session.ts";

export const handler = {
  // Obtener una historia de usuario específica
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    // Obtener la historia de usuario usando la función del modelo
    const userStory = await getUserStoryById(id);

    if (!userStory) {
      return errorResponse("Historia de usuario no encontrada", Status.NotFound);
    }

    return successResponse({ userStory });
  },

  // Actualizar una historia de usuario
  async PUT(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    try {
      // Obtener los datos de actualización
      const data = await req.json();

      // Validar los datos con el esquema Zod
      const result = UpdateUserStorySchema.safeParse(data);
      if (!result.success) {
        return errorResponse("Datos inválidos", Status.BadRequest);
      }

      // --- Sincronización de Sprints ---
      // 1. Obtener el estado original de la historia de usuario
      const originalUserStory = await getUserStoryById(id);
      const oldSprintId = originalUserStory?.sprintId;

      // Actualizar la historia de usuario usando la función del modelo
      const updatedUserStory = await updateUserStory(id, result.data);

      if (!updatedUserStory) {
        return errorResponse("Historia de usuario no encontrada", Status.NotFound);
      }

      // 2. Comparar sprintId antes y después
      const newSprintId = updatedUserStory.sprintId;

      if (oldSprintId !== newSprintId) {
        // 3. Actualizar el sprint antiguo (si existía)
        if (oldSprintId) {
          try {
            const oldSprint = await getSprintById(oldSprintId);
            if (oldSprint) {
              const updatedUserStoryIds = oldSprint.userStoryIds.filter(storyId => storyId !== id);
              await updateSprint(oldSprintId, { userStoryIds: updatedUserStoryIds });
            }
          } catch (sprintError) {
            console.error(`Error al actualizar el sprint antiguo ${oldSprintId}:`, sprintError);
            // No bloquear la respuesta principal por esto, pero registrar el error
          }
        }

        // 4. Actualizar el sprint nuevo (si existe)
        if (newSprintId) {
          try {
            const newSprint = await getSprintById(newSprintId);
            if (newSprint) {
              // Usar Set para evitar duplicados si la historia ya estuviera (aunque no debería)
              const updatedUserStoryIds = Array.from(new Set([...newSprint.userStoryIds, id]));
              await updateSprint(newSprintId, { userStoryIds: updatedUserStoryIds });
            }
          } catch (sprintError) {
            console.error(`Error al actualizar el sprint nuevo ${newSprintId}:`, sprintError);
            // No bloquear la respuesta principal por esto, pero registrar el error
          }
        }
      }
      // --- Fin Sincronización de Sprints ---

      return successResponse({ userStory: updatedUserStory });
    } catch (error) {
      console.error("Error al actualizar historia de usuario:", error);
      return errorResponse("Error al procesar la solicitud", Status.BadRequest);
    }
  },

  // Eliminar una historia de usuario
  async DELETE(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    // --- Sincronización de Sprints (antes de eliminar) ---
    try {
      const userStory = await getUserStoryById(id);
      if (userStory && userStory.sprintId) {
        const sprint = await getSprintById(userStory.sprintId);
        if (sprint) {
          const updatedUserStoryIds = sprint.userStoryIds.filter(storyId => storyId !== id);
          await updateSprint(sprint.id, { userStoryIds: updatedUserStoryIds });
        }
      }
    } catch (sprintError) {
      console.error(`Error al actualizar el sprint antes de eliminar la historia de usuario ${id}:`, sprintError);
      // Continuar con la eliminación de la historia de usuario incluso si la actualización del sprint falla.
      // Registrar la inconsistencia potencial.
    }
    // --- Fin Sincronización de Sprints ---

    // Eliminar la historia de usuario usando la función del modelo
    const success = await deleteUserStory(id);

    if (!success) {
      // Esto podría significar que la historia ya fue eliminada o nunca existió.
      // El intento de actualizar el sprint anterior no habría encontrado la userStory.
      return errorResponse("Historia de usuario no encontrada", Status.NotFound);
    }

    return successResponse({}, "Historia de usuario eliminada correctamente");
  },
};
