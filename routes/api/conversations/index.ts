import type { Handlers } from "$fresh/server.ts";
import { z } from "zod";
import { ConversationType } from "../../../models/message.ts";
import { UserRole } from "../../../models/user.ts";
import {
  createGroupConversation,
  getOrCreateDirectConversation,
  getUserConversationsWithDetails,
} from "../../../services/messageService.ts";
import { getSession } from "../../../utils/session.ts";

// Esquema para crear conversación grupal
const CreateGroupConversationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  memberIds: z.array(z.string()).min(1, "Debe haber al menos un miembro"),
  projectId: z.string().optional(),
});

// Esquema para crear conversación directa
const CreateDirectConversationSchema = z.object({
  otherUserId: z.string().min(1, "El ID del otro usuario es requerido"),
});

export const handler: Handlers = {
  // GET /api/conversations - Obtener conversaciones del usuario
  async GET(req, _ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const conversations = await getUserConversationsWithDetails(session.userId);

      return new Response(JSON.stringify({ conversations }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al obtener conversaciones:", error);
      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // POST /api/conversations - Crear nueva conversación
  async POST(req, _ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const { type } = body;

      if (type === ConversationType.DIRECT) {
        // Crear conversación directa
        const validatedData = CreateDirectConversationSchema.parse(body);

        const conversation = await getOrCreateDirectConversation(
          session.userId,
          validatedData.otherUserId
        );

        return new Response(JSON.stringify({ conversation }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (type === ConversationType.GROUP || type === ConversationType.PROJECT) {
        // Crear conversación grupal o de proyecto
        const validatedData = CreateGroupConversationSchema.parse(body);

        // Verificar permisos para crear conversaciones de proyecto
        if (type === ConversationType.PROJECT) {
          const canCreateProjectConversation =
            session.role === UserRole.ADMIN ||
            session.role === UserRole.PRODUCT_OWNER ||
            session.role === UserRole.SCRUM_MASTER;

          if (!canCreateProjectConversation) {
            return new Response(
              JSON.stringify({
                error: "No tienes permisos para crear conversaciones de proyecto",
              }),
              {
                status: 403,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }

        const conversation = await createGroupConversation(
          session.userId,
          validatedData.name,
          validatedData.description || "",
          validatedData.memberIds,
          validatedData.projectId
        );

        return new Response(JSON.stringify({ conversation }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Tipo de conversación inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al crear conversación:", error);

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
};
