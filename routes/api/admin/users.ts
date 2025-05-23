import type { FreshContext } from "$fresh/server.ts";
import { UserRole, getAllUsers } from "../../../models/user.ts";
import { getSession } from "../../../utils/session.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Solo permitir solicitudes GET
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ message: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Verificar si el usuario está autenticado
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ message: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar si el usuario es administrador
    if (session.role !== UserRole.ADMIN) {
      return new Response(JSON.stringify({ message: "No autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obtener todos los usuarios
    const users = await getAllUsers();

    // Eliminar las contraseñas hash antes de enviar
    const safeUsers = users.map((user) => {
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return new Response(JSON.stringify({ users: safeUsers }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    return new Response(JSON.stringify({ message: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
