import type { Handlers } from "$fresh/server.ts";
import {
  getDeliverableById,
  getDeliverableFromTask,
  updateDeliverable,
} from "../../../models/deliverable.ts";
import { getTaskById } from "../../../models/task.ts";
import { UserRole } from "../../../models/user.ts";
import { getSession } from "../../../utils/session.ts";

export const handler: Handlers = {
  // GET /api/deliverables/:id - Obtener un entregable por ID
  async GET(req, ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = ctx.params;

    try {
      // Primero intentar obtener como entregable directo
      let deliverable = await getDeliverableById(id);

      // Si no se encuentra, intentar obtener como tarea y convertir
      if (!deliverable) {
        const task = await getTaskById(id);

        if (!task) {
          return new Response(JSON.stringify({ error: "Entregable no encontrado" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        deliverable = await getDeliverableFromTask(task);

        if (!deliverable) {
          return new Response(JSON.stringify({ error: "La tarea no es un entregable" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Verificar permisos según el rol
      const isAssigned = deliverable.assignedTo === session.userId;
      const _isCreator = deliverable.createdBy === session.userId;
      const _isAdmin = session.role === UserRole.ADMIN;
      const _isProductOwner = session.role === UserRole.PRODUCT_OWNER;
      const _isScrumMaster = session.role === UserRole.SCRUM_MASTER;

      // Los estudiantes solo pueden ver entregables asignados a ellos
      if (session.role === UserRole.TEAM_DEVELOPER && !isAssigned) {
        return new Response(JSON.stringify({ error: "No autorizado para ver este entregable" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(deliverable), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // PUT /api/deliverables/:id - Actualizar un entregable
  async PUT(req, ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = ctx.params;

    try {
      const deliverable = await getDeliverableById(id);

      if (!deliverable) {
        return new Response(JSON.stringify({ error: "Entregable no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar permisos para actualizar el entregable
      const isCreator = deliverable.createdBy === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
      const isScrumMaster = session.role === UserRole.SCRUM_MASTER;

      // Solo profesores pueden actualizar entregables
      if (!isAdmin && !isProductOwner && !isScrumMaster && !isCreator) {
        return new Response(
          JSON.stringify({ error: "No autorizado para actualizar este entregable" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const body = await req.json();

      // Asegurar que sigue siendo un entregable
      body.isDeliverable = true;

      // No permitir cambiar ciertos campos
      body.createdBy = undefined;

      // Actualizar el entregable
      const updatedDeliverable = await updateDeliverable(id, body, session.userId);

      return new Response(JSON.stringify(updatedDeliverable), {
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
