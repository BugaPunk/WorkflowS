import type { FreshContext } from "$fresh/server.ts";
import { EvaluationStatus } from "../../../models/evaluation.ts";
import { UserRole } from "../../../models/user.ts";
import {
  deleteEvaluation,
  finalizeEvaluation,
  getEvaluationById,
  updateEvaluation,
} from "../../../services/evaluationService.ts";
import { getSession } from "../../../utils/session.ts";

export const handler = {
  // GET /api/evaluations/:id - Obtener una evaluación por ID
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
      const evaluation = await getEvaluationById(id);

      if (!evaluation) {
        return new Response(JSON.stringify({ error: "Evaluación no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar permisos para ver la evaluación
      const isEvaluator = evaluation.evaluatorId === session.userId;
      const isStudent = evaluation.studentId === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      const isProductOwner = session.role === UserRole.PRODUCT_OWNER;
      const isScrumMaster = session.role === UserRole.SCRUM_MASTER;

      // Si es borrador, solo el evaluador o admin puede verla
      if (evaluation.status === EvaluationStatus.DRAFT && !isEvaluator && !isAdmin) {
        return new Response(JSON.stringify({ error: "No autorizado para ver esta evaluación" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Si está completada, el estudiante, evaluador o roles superiores pueden verla
      if (!isStudent && !isEvaluator && !isAdmin && !isProductOwner && !isScrumMaster) {
        return new Response(JSON.stringify({ error: "No autorizado para ver esta evaluación" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(evaluation), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // PUT /api/evaluations/:id - Actualizar una evaluación
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
      const evaluation = await getEvaluationById(id);

      if (!evaluation) {
        return new Response(JSON.stringify({ error: "Evaluación no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar permisos para actualizar la evaluación
      const isEvaluator = evaluation.evaluatorId === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;

      if (!isEvaluator && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "No autorizado para actualizar esta evaluación" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Si la evaluación ya está completada, solo un admin puede modificarla
      if (evaluation.status === EvaluationStatus.COMPLETED && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "No se puede modificar una evaluación completada" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const body = await req.json();

      // No permitir cambiar ciertos campos
      body.evaluatorId = undefined;
      body.studentId = undefined;
      body.deliverableId = undefined;
      body.rubricId = undefined;

      // Actualizar la evaluación
      const updatedEvaluation = await updateEvaluation(id, body);

      return new Response(JSON.stringify(updatedEvaluation), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // DELETE /api/evaluations/:id - Eliminar una evaluación
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
      const evaluation = await getEvaluationById(id);

      if (!evaluation) {
        return new Response(JSON.stringify({ error: "Evaluación no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar permisos para eliminar la evaluación
      const isEvaluator = evaluation.evaluatorId === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;

      if (!isEvaluator && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "No autorizado para eliminar esta evaluación" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Si la evaluación ya está completada, solo un admin puede eliminarla
      if (evaluation.status === EvaluationStatus.COMPLETED && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "No se puede eliminar una evaluación completada" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Eliminar la evaluación
      await deleteEvaluation(id);

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
