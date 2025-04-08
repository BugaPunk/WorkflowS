import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { UserRole, deleteUser, getUserById } from "../../../../models/user.ts";
import { PROJECT_COLLECTIONS } from "../../../../models/project.ts";
import { getKv } from "../../../../utils/db.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Solo permitir solicitudes DELETE
  if (req.method !== "DELETE") {
    return new Response(
      JSON.stringify({ message: "Método no permitido" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
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
    
    // Verificar si el usuario es administrador
    if (session.role !== UserRole.ADMIN) {
      return new Response(
        JSON.stringify({ message: "No autorizado" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Obtener el ID del usuario a eliminar
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");
    
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Se requiere el ID del usuario" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Verificar que el usuario existe
    const user = await getUserById(userId);
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Usuario no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // No permitir eliminar al propio usuario
    if (userId === session.userId) {
      return new Response(
        JSON.stringify({ message: "No puedes eliminar tu propia cuenta" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Verificar si el usuario está asignado a algún proyecto
    const kv = getKv();
    const projectMembersIterator = kv.list({
      prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", userId]
    });
    
    let hasProjects = false;
    for await (const _ of projectMembersIterator) {
      hasProjects = true;
      break;
    }
    
    if (hasProjects) {
      return new Response(
        JSON.stringify({ 
          message: "No se puede eliminar el usuario porque está asignado a uno o más proyectos. Elimina primero las asignaciones de proyectos."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Eliminar el usuario
    const success = await deleteUser(userId);
    
    if (!success) {
      return new Response(
        JSON.stringify({ message: "Error al eliminar el usuario" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Usuario eliminado exitosamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
