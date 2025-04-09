import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { UserRole } from "../../models/user.ts";
import { getKv, generateId } from "../../utils/db.ts";
import { type CreateUserStoryData, type UserStory, UserStoryStatus } from "../../models/userStory.ts";

// HTTP status codes
const Status = {
  OK: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  InternalServerError: 500,
  ServiceUnavailable: 503
};

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
    const status = url.searchParams.get("status");
    const sprintId = url.searchParams.get("sprintId");

    // Obtener la instancia de KV
    const kv = getKv();

    // Obtener todas las historias de usuario según los filtros
    const userStoriesIterator = kv.list<UserStory>({ prefix: ["userStories"] });
    const userStories: UserStory[] = [];

    for await (const entry of userStoriesIterator) {
      const userStory = entry.value;

      // Aplicar filtros
      if (projectId && userStory.projectId !== projectId) continue;
      if (status && userStory.status !== status) continue;
      if (sprintId && userStory.sprintId !== sprintId) continue;

      userStories.push(userStory);
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
      const data: CreateUserStoryData = await req.json();

      // Validar datos requeridos
      if (!data.title || !data.description || !data.acceptanceCriteria || !data.priority || !data.projectId) {
        return new Response(JSON.stringify({ message: "Faltan campos requeridos" }), {
          status: Status.BadRequest,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Obtener la instancia de KV
      const kv = getKv();

      // Verificar que el proyecto existe
      const projectEntry = await kv.get(["projects", data.projectId]);
      if (!projectEntry.value) {
        return new Response(JSON.stringify({ message: "El proyecto no existe" }), {
          status: Status.NotFound,
          headers: { "Content-Type": "application/json" },
        });
      }

      const now = Date.now();
      const id = generateId();

      const userStory: UserStory = {
        id,
        title: data.title,
        description: data.description,
        acceptanceCriteria: data.acceptanceCriteria,
        priority: data.priority,
        status: UserStoryStatus.BACKLOG,
        points: data.points,
        projectId: data.projectId,
        createdBy: session.userId,
        createdAt: now,
        updatedAt: now,
      };

      await kv.set(["userStories", id], userStory);

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
