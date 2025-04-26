import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { createDeliverable } from "../../../models/deliverable.ts";
import { UserRole } from "../../../models/user.ts";
import { DeliverableSchema } from "../../../models/deliverable.ts";

export const handler: Handlers = {
  // POST /api/deliverables - Crear un nuevo entregable
  async POST(req, _ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Solo los profesores pueden crear entregables
    if (session.role !== UserRole.ADMIN && 
        session.role !== UserRole.PRODUCT_OWNER && 
        session.role !== UserRole.SCRUM_MASTER) {
      return new Response(JSON.stringify({ error: "No autorizado para crear entregables" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    try {
      const body = await req.json();
      
      // Asegurar que es un entregable
      body.isDeliverable = true;
      
      // Validar datos con el esquema
      const validatedData = DeliverableSchema.parse({
        ...body,
        createdBy: session.userId,
      });
      
      // Crear el entregable
      const deliverable = await createDeliverable(validatedData);
      
      return new Response(JSON.stringify(deliverable), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Determinar si es un error de validación o de otro tipo
      if (error.errors) {
        return new Response(JSON.stringify({ error: "Datos inválidos", details: error.errors }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
