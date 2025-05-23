import type { Handlers } from "$fresh/server.ts";
import { getTaskById } from "../../../models/task.ts";
import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
} from "../../../services/commentService.ts";
import { getSession } from "../../../utils/session.ts";

export const handler: Handlers = {
  // Obtener comentarios de una tarea
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const taskId = ctx.params.taskId;

    // Verificar que la tarea existe
    const task = await getTaskById(taskId);
    if (!task) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const comments = await getTaskComments(taskId);

    return new Response(JSON.stringify({ comments }), {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Crear un nuevo comentario
  async POST(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const taskId = ctx.params.taskId;

    // Verificar que la tarea existe
    const task = await getTaskById(taskId);
    if (!task) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const { content } = body;

      if (!content || content.trim() === "") {
        return new Response(JSON.stringify({ error: "El contenido no puede estar vacío" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const comment = await createComment(taskId, session.userId, content);

      if (!comment) {
        return new Response(JSON.stringify({ error: "Error al crear el comentario" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ comment }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (_error) {
      return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Actualizar o eliminar un comentario (usando método PATCH o DELETE)
  async PATCH(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const taskId = ctx.params.taskId;

    try {
      const body = await req.json();
      const { commentId, content, action } = body;

      if (!commentId) {
        return new Response(JSON.stringify({ error: "ID de comentario requerido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (action === "delete") {
        const success = await deleteComment(commentId, taskId, session.userId);

        if (!success) {
          return new Response(JSON.stringify({ error: "No se pudo eliminar el comentario" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      // Actualizar comentario
      if (!content || content.trim() === "") {
        return new Response(JSON.stringify({ error: "El contenido no puede estar vacío" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const updatedComment = await updateComment(commentId, taskId, session.userId, content);

      if (!updatedComment) {
        return new Response(JSON.stringify({ error: "No se pudo actualizar el comentario" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ comment: updatedComment }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (_error) {
      return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
