import type { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { 
  createRubric, 
  getRubricTemplates, 
  getRubricsByUser,
  getRubricsByProject
} from "../../../services/rubricService.ts";
import { UserRole } from "../../../models/user.ts";
import { RubricSchema } from "../../../models/rubric.ts";

export const handler: Handlers = {
  // GET /api/rubrics - Obtener rúbricas (con filtros opcionales)
  async GET(req, _ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const url = new URL(req.url);
    const templateOnly = url.searchParams.get("template") === "true";
    const projectId = url.searchParams.get("projectId");
    const userId = url.searchParams.get("userId");
    
    try {
      let rubrics;
      
      // Filtrar por tipo de consulta
      if (templateOnly) {
        // Solo los profesores pueden ver las plantillas de rúbricas
        if (session.role !== UserRole.ADMIN && session.role !== UserRole.PRODUCT_OWNER) {
          return new Response(JSON.stringify({ error: "No autorizado para ver plantillas" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        rubrics = await getRubricTemplates();
      } else if (projectId) {
        // Obtener rúbricas por proyecto
        rubrics = await getRubricsByProject(projectId);
      } else if (userId) {
        // Verificar permisos para ver rúbricas de otro usuario
        if (userId !== session.userId && 
            session.role !== UserRole.ADMIN && 
            session.role !== UserRole.PRODUCT_OWNER) {
          return new Response(JSON.stringify({ error: "No autorizado para ver rúbricas de este usuario" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        rubrics = await getRubricsByUser(userId);
      } else {
        // Por defecto, obtener rúbricas del usuario actual
        rubrics = await getRubricsByUser(session.userId);
      }
      
      return new Response(JSON.stringify(rubrics), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
  
  // POST /api/rubrics - Crear una nueva rúbrica
  async POST(req, _ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Solo los profesores pueden crear rúbricas
    if (session.role !== UserRole.ADMIN && session.role !== UserRole.PRODUCT_OWNER) {
      return new Response(JSON.stringify({ error: "No autorizado para crear rúbricas" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    try {
      const body = await req.json();
      
      // Validar datos con el esquema
      const validatedData = RubricSchema.parse({
        ...body,
        createdBy: session.userId,
      });
      
      // Crear la rúbrica
      const rubric = await createRubric(validatedData);
      
      return new Response(JSON.stringify(rubric), {
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
