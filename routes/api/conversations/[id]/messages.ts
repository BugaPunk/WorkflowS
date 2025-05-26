import type { Handlers } from "$fresh/server.ts";
import { z } from "zod";
import {
  getMessagesForUser,
  markMessagesAsRead,
  sendMessage,
} from "../../../../services/messageService.ts";
import { getSession } from "../../../../utils/session.ts";

// Esquema para enviar mensaje
const SendMessageSchema = z.object({
  content: z.string().min(1, "El contenido del mensaje es requerido"),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        url: z.string().url(),
      })
    )
    .optional(),
});

// Esquema para marcar mensajes como leídos
const MarkAsReadSchema = z.object({
  messageIds: z.array(z.string()),
});

export const handler: Handlers = {
  // GET /api/conversations/:id/messages - Obtener mensajes de una conversación
  async GET(req, ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: conversationId } = ctx.params;
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const beforeParam = url.searchParams.get("before");

    const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
    const before = beforeParam ? Number.parseInt(beforeParam, 10) : undefined;

    try {
      const messages = await getMessagesForUser(session.userId, conversationId, limit, before);

      return new Response(JSON.stringify({ messages }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al obtener mensajes:", error);

      if (error instanceof Error && error.message.includes("permisos")) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // POST /api/conversations/:id/messages - Enviar un mensaje
  async POST(req, ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: conversationId } = ctx.params;

    try {
      const body = await req.json();
      const validatedData = SendMessageSchema.parse(body);

      const message = await sendMessage(
        session.userId,
        conversationId,
        validatedData.content,
        validatedData.attachments
      );

      if (!message) {
        return new Response(JSON.stringify({ error: "Error al enviar el mensaje" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ message }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);

      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: "Datos inválidos",
            details: error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error instanceof Error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // PATCH /api/conversations/:id/messages - Marcar mensajes como leídos
  async PATCH(req, ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: conversationId } = ctx.params;

    try {
      const body = await req.json();
      const validatedData = MarkAsReadSchema.parse(body);

      await markMessagesAsRead(session.userId, conversationId, validatedData.messageIds);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);

      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: "Datos inválidos",
            details: error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error instanceof Error && error.message.includes("permisos")) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
