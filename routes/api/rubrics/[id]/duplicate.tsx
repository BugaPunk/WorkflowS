import type { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { getRubricById, duplicateRubric } from "../../../../services/rubricService.ts";
import { UserRole } from "../../../../models/user.ts";

export const handler: Handlers = {
  // POST /api/rubrics/:id/duplicate - Duplicar una rúbrica
  async POST(req, ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Solo los profesores pueden duplicar rúbricas
    if (session.role !== UserRole.ADMIN && session.role !== UserRole.PRODUCT_OWNER) {
      return new Response(JSON.stringify({ error: "No autorizado para duplicar rúbricas" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { id } = ctx.params;
    
    try {
      const sourceRubric = await getRubricById(id);
      
      if (!sourceRubric) {
        return new Response(JSON.stringify({ error: "Rúbrica no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Verificar permisos para duplicar la rúbrica
      // Si no es plantilla, solo el propietario o admin puede duplicarla
      if (!sourceRubric.isTemplate && 
          sourceRubric.createdBy !== session.userId && 
          session.role !== UserRole.ADMIN) {
        return new Response(JSON.stringify({ error: "No autorizado para duplicar esta rúbrica" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      const body = await req.json();
      
      // Validar datos mínimos
      if (!body.name) {
        return new Response(JSON.stringify({ error: "Se requiere un nombre para la nueva rúbrica" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Duplicar la rúbrica
      const newRubric = await duplicateRubric(id, {
        name: body.name,
        projectId: body.projectId,
        createdBy: session.userId,
        isTemplate: body.isTemplate || false,
      });
      
      return new Response(JSON.stringify(newRubric), {
        status: 201,
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
