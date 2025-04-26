import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { 
  createEvaluation, 
  getEvaluationsByStudent,
  getEvaluationsByEvaluator,
  getEvaluationsByDeliverable
} from "../../../services/evaluationService.ts";
import { UserRole } from "../../../models/user.ts";
import { EvaluationSchema } from "../../../models/evaluation.ts";

export const handler: Handlers = {
  // GET /api/evaluations - Obtener evaluaciones (con filtros opcionales)
  async GET(req, _ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const evaluatorId = url.searchParams.get("evaluatorId");
    const deliverableId = url.searchParams.get("deliverableId");
    
    try {
      let evaluations;
      
      // Filtrar por tipo de consulta
      if (studentId) {
        // Verificar permisos: solo el propio estudiante o un profesor puede ver sus evaluaciones
        if (studentId !== session.userId && 
            session.role !== UserRole.ADMIN && 
            session.role !== UserRole.PRODUCT_OWNER) {
          return new Response(JSON.stringify({ error: "No autorizado para ver evaluaciones de este estudiante" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        evaluations = await getEvaluationsByStudent(studentId);
      } else if (evaluatorId) {
        // Verificar permisos: solo el propio evaluador o un admin puede ver sus evaluaciones
        if (evaluatorId !== session.userId && session.role !== UserRole.ADMIN) {
          return new Response(JSON.stringify({ error: "No autorizado para ver evaluaciones de este evaluador" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        evaluations = await getEvaluationsByEvaluator(evaluatorId);
      } else if (deliverableId) {
        // Para entregables, verificar permisos según el rol
        // (Esta verificación podría ser más compleja en un caso real)
        if (session.role !== UserRole.ADMIN && 
            session.role !== UserRole.PRODUCT_OWNER && 
            session.role !== UserRole.SCRUM_MASTER) {
          return new Response(JSON.stringify({ error: "No autorizado para ver evaluaciones de este entregable" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        evaluations = await getEvaluationsByDeliverable(deliverableId);
      } else {
        // Por defecto, según el rol:
        // - Estudiantes: sus propias evaluaciones
        // - Profesores: evaluaciones que han realizado
        if (session.role === UserRole.TEAM_DEVELOPER) {
          evaluations = await getEvaluationsByStudent(session.userId);
        } else {
          evaluations = await getEvaluationsByEvaluator(session.userId);
        }
      }
      
      return new Response(JSON.stringify(evaluations), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
  
  // POST /api/evaluations - Crear una nueva evaluación
  async POST(req, _ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Solo los profesores pueden crear evaluaciones
    if (session.role !== UserRole.ADMIN && 
        session.role !== UserRole.PRODUCT_OWNER && 
        session.role !== UserRole.SCRUM_MASTER) {
      return new Response(JSON.stringify({ error: "No autorizado para crear evaluaciones" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    try {
      const body = await req.json();
      
      // Validar datos con el esquema
      const validatedData = EvaluationSchema.parse({
        ...body,
        evaluatorId: session.userId,
      });
      
      // Crear la evaluación
      const evaluation = await createEvaluation(validatedData);
      
      return new Response(JSON.stringify(evaluation), {
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
