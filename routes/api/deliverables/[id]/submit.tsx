import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { 
  getDeliverableById, 
  submitDeliverable 
} from "../../../../models/deliverable.ts";
import { UserRole } from "../../../../models/user.ts";

export const handler: Handlers = {
  // POST /api/deliverables/:id/submit - Enviar un entregable
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
      const deliverable = await getDeliverableById(id);
      
      if (!deliverable) {
        return new Response(JSON.stringify({ error: "Entregable no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Verificar permisos para enviar el entregable
      const isAssigned = deliverable.assignedTo === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      
      // Solo el asignado o un admin puede enviar el entregable
      if (!isAssigned && !isAdmin) {
        return new Response(JSON.stringify({ error: "No autorizado para enviar este entregable" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Verificar si ya fue enviado
      if (deliverable.submittedAt) {
        return new Response(JSON.stringify({ 
          message: "El entregable ya fue enviado",
          deliverable
        }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Enviar el entregable
      const updatedDeliverable = await submitDeliverable(id, session.userId);
      
      if (!updatedDeliverable) {
        return new Response(JSON.stringify({ error: "Error al enviar el entregable" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({
        message: "Entregable enviado correctamente",
        deliverable: updatedDeliverable
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
