import type { FreshContext } from "$fresh/server.ts";
import { UserRole } from "../../models/user.ts";
import { getSession } from "../../utils/session.ts";

export const handler = {
  async GET(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);

    // Verificar si el usuario está autenticado
    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }

    // Verificar si el usuario es administrador
    if (session.role !== UserRole.ADMIN) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }

    // Redirigir a la página de administración de usuarios
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/admin/users",
      },
    });
  },
};
