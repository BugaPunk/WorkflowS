import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { getKv } from "../../../utils/db.ts";
import {
  type UpdateUserStoryData,
  type UserStory,
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

    // Obtener la instancia de KV
    const kv = getKv();

    // Obtener la historia de usuario
    const userStoryEntry = await kv.get<UserStory>(["userStories", id]);

    if (!userStoryEntry.value) {
      return errorResponse("Historia de usuario no encontrada", Status.NotFound);
    }

    return successResponse({ userStory: userStoryEntry.value });
  },

  // Actualizar una historia de usuario
  async PUT(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return errorResponse("No autorizado", Status.Unauthorized);
    }

    const { id } = ctx.params;

    // Obtener la instancia de KV
    const kv = getKv();

    // Verificar que la historia de usuario existe
    const userStoryEntry = await kv.get<UserStory>(["userStories", id]);
    if (!userStoryEntry.value) {
      return errorResponse("Historia de usuario no encontrada", Status.NotFound);
    }

    try {
      const data: UpdateUserStoryData = await req.json();
      const userStory = userStoryEntry.value;

      // Actualizar los campos
      const updatedUserStory: UserStory = {
        ...userStory,
        title: data.title ?? userStory.title,
        description: data.description ?? userStory.description,
        acceptanceCriteria: data.acceptanceCriteria ?? userStory.acceptanceCriteria,
        priority: data.priority ?? userStory.priority,
        status: data.status ?? userStory.status,
        points: data.points ?? userStory.points,
        updatedAt: Date.now(),
      };

      await kv.set(["userStories", id], updatedUserStory);

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

    // Obtener la instancia de KV
    const kv = getKv();

    // Verificar que la historia de usuario existe
    const userStoryEntry = await kv.get(["userStories", id]);
    if (!userStoryEntry.value) {
      return errorResponse("Historia de usuario no encontrada", Status.NotFound);
    }

    await kv.delete(["userStories", id]);

    return successResponse({}, "Historia de usuario eliminada correctamente");
  },
};
