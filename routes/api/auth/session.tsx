import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";

export const handler = {
  async GET(req: Request, _ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response(JSON.stringify({ error: "No hay sesión activa" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Devolver información de la sesión (sin datos sensibles)
    return new Response(
      JSON.stringify({
        userId: session.userId,
        username: session.username,
        email: session.email,
        role: session.role,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};