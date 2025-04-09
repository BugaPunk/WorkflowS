import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { UserRole } from "../../models/user.ts";
import { getKv, generateId } from "../../utils/db.ts";
import { CreateUserStoryData, UpdateUserStoryData, UserStory, UserStoryStatus } from "../../models/userStory.ts";

export const handler = {
  // Obtener historias de usuario
  async GET(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const projectId = url.searchParams.get("projectId");
    const status = url.searchParams.get("status");
    const sprintId = url.searchParams.get("sprintId");

    // Obtener la instancia de KV
    const kv = getKv();

    // Si se proporciona un ID, devolver una historia de usuario específica
    if (id) {
      const userStoryEntry = await kv.get<UserStory>(["userStories", id]);

      if (!userStoryEntry.value) {
        return new Response(JSON.stringify({ error: "Historia de usuario no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ userStory: userStoryEntry.value }), {
        headers: { "Content-Type": "application/json" },
      });
    }

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
      headers: { "Content-Type": "application/json" },
    });
  },

  // Crear una nueva historia de usuario
  async POST(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar que el usuario sea Product Owner o Admin
    if (session.role !== UserRole.PRODUCT_OWNER && session.role !== UserRole.ADMIN) {
      return new Response(JSON.stringify({ error: "No tienes permisos para crear historias de usuario" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const data: CreateUserStoryData = await req.json();

      // Validar datos requeridos
      if (!data.title || !data.description || !data.acceptanceCriteria || !data.priority || !data.projectId) {
        return new Response(JSON.stringify({ error: "Faltan campos requeridos" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Obtener la instancia de KV
      const kv = getKv();

      // Verificar que el proyecto existe
      const projectEntry = await kv.get(["projects", data.projectId]);
      if (!projectEntry.value) {
        return new Response(JSON.stringify({ error: "El proyecto no existe" }), {
          status: 404,
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
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (_error) { // Prefijo con guion bajo para indicar que no se usa
      return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Actualizar una historia de usuario
  async PUT(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Se requiere ID de historia de usuario" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener la instancia de KV
    const kv = getKv();

    // Verificar que la historia de usuario existe
    const userStoryEntry = await kv.get<UserStory>(["userStories", id]);
    if (!userStoryEntry.value) {
      return new Response(JSON.stringify({ error: "Historia de usuario no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userStory = userStoryEntry.value;

    // Verificar permisos
    const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
    const isAdmin = session.role === UserRole.ADMIN;
    const isScrumMaster = session.role === UserRole.SCRUM_MASTER;

    // Solo Product Owner, Admin o Scrum Master pueden actualizar historias
    if (!isProductOwner && !isAdmin && !isScrumMaster) {
      return new Response(JSON.stringify({ error: "No tienes permisos para actualizar historias de usuario" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const data: UpdateUserStoryData = await req.json();

      // Actualizar campos
      const updatedUserStory: UserStory = {
        ...userStory,
        title: data.title ?? userStory.title,
        description: data.description ?? userStory.description,
        acceptanceCriteria: data.acceptanceCriteria ?? userStory.acceptanceCriteria,
        priority: data.priority ?? userStory.priority,
        status: data.status ?? userStory.status,
        points: data.points ?? userStory.points,
        assignedTo: data.assignedTo ?? userStory.assignedTo,
        sprintId: data.sprintId ?? userStory.sprintId,
        updatedAt: Date.now(),
      };

      await kv.set(["userStories", id], updatedUserStory);

      return new Response(JSON.stringify({ userStory: updatedUserStory }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (_error) { // Prefijo con guion bajo para indicar que no se usa
      return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Eliminar una historia de usuario
  async DELETE(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Solo Product Owner o Admin pueden eliminar historias
    if (session.role !== UserRole.PRODUCT_OWNER && session.role !== UserRole.ADMIN) {
      return new Response(JSON.stringify({ error: "No tienes permisos para eliminar historias de usuario" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Se requiere ID de historia de usuario" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener la instancia de KV
    const kv = getKv();

    // Verificar que la historia de usuario existe
    const userStoryEntry = await kv.get(["userStories", id]);
    if (!userStoryEntry.value) {
      return new Response(JSON.stringify({ error: "Historia de usuario no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await kv.delete(["userStories", id]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
