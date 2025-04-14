import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import {
  getUserStoryById,
  updateUserStory,
  deleteUserStory,
  UpdateUserStorySchema
} from "../../../models/userStory.ts";
import { Status, errorResponse, successResponse } from "../../../utils/api.ts";

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

      // Actualizar la historia de usuario usando la función del modelo
      const updatedUserStory = await updateUserStory(id, result.data);

      if (!updatedUserStory) {
        return errorResponse("Historia de usuario no encontrada", Status.NotFound);
      }

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

    // Eliminar la historia de usuario usando la función del modelo
    const success = await deleteUserStory(id);

    if (!success) {
      return errorResponse("Historia de usuario no encontrada", Status.NotFound);
    }

    return successResponse({}, "Historia de usuario eliminada correctamente");
  },
};
