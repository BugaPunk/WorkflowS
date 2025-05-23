import type { FreshContext } from "$fresh/server.ts";
import { Status } from "../../utils/api.ts";
import { COLLECTIONS, getKv } from "../../utils/db.ts";

export const handler = {
  async POST(req: Request, _ctx: FreshContext) {
    try {
      // Get session ID from cookie
      const cookies = req.headers.get("cookie");
      if (cookies) {
        const sessionIdMatch = cookies.match(/sessionId=([^;]+)/);
        if (sessionIdMatch) {
          const sessionId = sessionIdMatch[1];

          // Delete session from KV
          const kv = getKv();
          await kv.delete([...COLLECTIONS.USERS, "sessions", sessionId]);
        }
      }

      // Return success response with cookie clearing instructions
      const headers = new Headers();
      headers.set(
        "Set-Cookie",
        "sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
      );
      headers.set("Content-Type", "application/json");

      return new Response(
        JSON.stringify({ success: true, message: "Sesión cerrada correctamente" }),
        {
          status: Status.OK,
          headers,
        }
      );
    } catch (error) {
      console.error("Error during logout:", error);

      // Return error response
      return new Response(JSON.stringify({ success: false, message: "Error al cerrar sesión" }), {
        status: Status.InternalServerError,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
