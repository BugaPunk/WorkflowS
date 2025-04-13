import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { UserRole } from "../../models/user.ts";
import { getKv } from "../../utils/db.ts";
import {
  type UserStory,
  CreateUserStorySchema,
  USER_STORY_COLLECTIONS,
  createUserStory,
  getProjectUserStories
} from "../../models/userStory.ts";
import { Status } from "../../utils/api.ts";

export const handler = {
  // Obtener historias de usuario
  async GET(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ message: "No autorizado" }), {
        status: Status.Unauthorized,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const statusFilter = url.searchParams.get("status");
    const sprintId = url.searchParams.get("sprintId");

    try {
      let userStories: UserStory[] = [];

      if (projectId) {
        // Usar la función del modelo para obtener historias de usuario por proyecto
        userStories = await getProjectUserStories(projectId);
      } else {
        // Si no hay projectId, obtener todas las historias de usuario
        const kv = getKv();
        const userStoriesIterator = kv.list<UserStory>({ prefix: USER_STORY_COLLECTIONS.USER_STORIES });

        for await (const entry of userStoriesIterator) {
          userStories.push(entry.value);
        }
      }

      // Aplicar filtros adicionales
      if (statusFilter) {
        userStories = userStories.filter(story => story.status === statusFilter);
      }

      if (sprintId) {
        userStories = userStories.filter(story => story.sprintId === sprintId);
      }

      // Ordenar por prioridad y fecha de creación
      userStories.sort((a, b) => {
        // Primero por prioridad (critical > high > medium > low)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

        if (priorityDiff !== 0) return priorityDiff;

        // Luego por fecha de creación (más reciente primero)
        return b.createdAt - a.createdAt;
      });

      return new Response(JSON.stringify({ userStories }), {
        status: Status.OK,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al obtener historias de usuario:", error);
      return new Response(JSON.stringify({ message: "Error al obtener historias de usuario" }), {
        status: Status.InternalServerError,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Crear una nueva historia de usuario
  async POST(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ message: "No autorizado" }), {
        status: Status.Unauthorized,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar que el usuario sea Product Owner o Admin
    if (session.role !== UserRole.PRODUCT_OWNER && session.role !== UserRole.ADMIN) {
      return new Response(JSON.stringify({ message: "No tienes permisos para crear historias de usuario" }), {
        status: Status.Forbidden,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const requestData = await req.json();

      // Validar datos con Zod
      const result = CreateUserStorySchema.safeParse(requestData);
      if (!result.success) {
        return new Response(JSON.stringify({
          message: "Datos inválidos",
          errors: result.error.format()
        }), {
          status: Status.BadRequest,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Obtener la instancia de KV
      const kv = getKv();

      // Verificar que el proyecto existe
      const projectEntry = await kv.get(["projects", result.data.projectId]);
      if (!projectEntry.value) {
        return new Response(JSON.stringify({ message: "El proyecto no existe" }), {
          status: Status.NotFound,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Crear la historia de usuario usando la función del modelo
      const userStory = await createUserStory(result.data, session.userId);

      return new Response(JSON.stringify({ userStory }), {
        status: Status.Created,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al crear historia de usuario:", error);
      return new Response(JSON.stringify({ message: "Error al procesar la solicitud" }), {
        status: Status.BadRequest,
        headers: { "Content-Type": "application/json" },
      });
    }
  },


};
