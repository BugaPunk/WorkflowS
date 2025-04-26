import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { 
  getEvaluationById, 
  finalizeEvaluation 
} from "../../../../services/evaluationService.ts";
import { UserRole } from "../../../../models/user.ts";
import { EvaluationStatus } from "../../../../models/evaluation.ts";

export const handler: Handlers = {
  // POST /api/evaluations/:id/finalize - Finalizar una evaluación
  async POST(req, ctx) {
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
      
      // Verificar permisos para finalizar la evaluación
      const isEvaluator = evaluation.evaluatorId === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      
      if (!isEvaluator && !isAdmin) {
        return new Response(JSON.stringify({ error: "No autorizado para finalizar esta evaluación" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Si la evaluación ya está completada, no hacer nada
      if (evaluation.status === EvaluationStatus.COMPLETED) {
        return new Response(JSON.stringify({ 
          message: "La evaluación ya está finalizada",
          evaluation
        }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Finalizar la evaluación
      const finalizedEvaluation = await finalizeEvaluation(id);
      
      if (!finalizedEvaluation) {
        return new Response(JSON.stringify({ error: "Error al finalizar la evaluación" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({
        message: "Evaluación finalizada correctamente",
        evaluation: finalizedEvaluation
      }), {
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
