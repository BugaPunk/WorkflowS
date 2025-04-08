import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { UserRole } from "../../../models/user.ts";
import { ProjectMemberSchema, addProjectMember, getProjectById } from "../../../models/project.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Verificar si el usuario está autenticado
  const session = await getSession(req);
  
  if (!session) {
    return new Response(
      JSON.stringify({ message: "No autenticado" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Solo los administradores pueden asignar usuarios a proyectos
  if (session.role !== UserRole.ADMIN) {
    return new Response(
      JSON.stringify({ message: "No autorizado" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Manejar solicitudes POST (asignar usuario a proyecto)
  if (req.method === "POST") {
    try {
      // Parsear el cuerpo de la solicitud
      const body = await req.json();
      
      // Validar los datos del miembro del proyecto
      const result = ProjectMemberSchema.safeParse(body);
      
      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            message: "Datos inválidos", 
            errors: result.error.errors 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Verificar que el proyecto existe
      const project = await getProjectById(result.data.projectId);
      
      if (!project) {
        return new Response(
          JSON.stringify({ message: "Proyecto no encontrado" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Verificar si el usuario ya está asignado al proyecto
      const isUserAlreadyAssigned = project.members.some(
        member => member.userId === result.data.userId
      );
      
      if (isUserAlreadyAssigned) {
        return new Response(
          JSON.stringify({ message: "El usuario ya está asignado a este proyecto" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Asignar el usuario al proyecto
      const member = await addProjectMember(result.data);
      
      return new Response(
        JSON.stringify({ 
          message: "Usuario asignado exitosamente al proyecto", 
          member 
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al asignar usuario a proyecto:", error);
      
      return new Response(
        JSON.stringify({ message: "Error interno del servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
  
  // Método no permitido
  return new Response(
    JSON.stringify({ message: "Método no permitido" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
};
