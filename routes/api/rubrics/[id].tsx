import type { FreshContext } from "$fresh/server.ts";
import { UserRole } from "../../../models/user.ts";
import {
  deleteRubric,
  duplicateRubric,
  getRubricById,
  updateRubric,
} from "../../../services/rubricService.ts";
import { getSession } from "../../../utils/session.ts";

export const handler = {
  // GET /api/rubrics/:id - Obtener una rúbrica por ID
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = ctx.params;

    try {
      const rubric = await getRubricById(id);

      if (!rubric) {
        return new Response(JSON.stringify({ error: "Rúbrica no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar permisos para ver la rúbrica
      const isOwner = rubric.createdBy === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
      const isScrumMaster = session.role === UserRole.SCRUM_MASTER;

      // Si no es plantilla y no es propietario ni profesor, denegar acceso
      if (!rubric.isTemplate && !isOwner && !isAdmin && !isProductOwner && !isScrumMaster) {
        return new Response(JSON.stringify({ error: "No autorizado para ver esta rúbrica" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(rubric), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // PUT /api/rubrics/:id - Actualizar una rúbrica
  async PUT(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = ctx.params;

    try {
      const rubric = await getRubricById(id);

      if (!rubric) {
        return new Response(JSON.stringify({ error: "Rúbrica no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar permisos para actualizar la rúbrica
      const isOwner = rubric.createdBy === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
      const isScrumMaster = session.role === UserRole.SCRUM_MASTER;

      if (!isOwner && !isAdmin && !isProductOwner && !isScrumMaster) {
        return new Response(
          JSON.stringify({ error: "No autorizado para actualizar esta rúbrica" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const body = await req.json();

      // No permitir cambiar el creador
      body.createdBy = undefined;

      // Actualizar la rúbrica
      const updatedRubric = await updateRubric(id, body);

      return new Response(JSON.stringify(updatedRubric), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // DELETE /api/rubrics/:id - Eliminar una rúbrica
  async DELETE(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = ctx.params;

    try {
      const rubric = await getRubricById(id);

      if (!rubric) {
        return new Response(JSON.stringify({ error: "Rúbrica no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar permisos para eliminar la rúbrica
      const isOwner = rubric.createdBy === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return new Response(JSON.stringify({ error: "No autorizado para eliminar esta rúbrica" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Eliminar la rúbrica
      await deleteRubric(id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
