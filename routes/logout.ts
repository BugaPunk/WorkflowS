import type { FreshContext } from "$fresh/server.ts";
import { getKv, COLLECTIONS } from "../utils/db.ts";

export const handler = {
  async GET(req: Request, _ctx: FreshContext) {
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
      
      // Clear cookie and redirect to login
      const headers = new Headers();
      headers.set("Set-Cookie", "sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
      headers.set("Location", "/login");
      
      return new Response(null, {
        status: 302,
        headers,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      
      // Redirect to login even if there's an error
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }
  },
};
