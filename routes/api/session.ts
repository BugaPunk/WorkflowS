import { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  try {
    const session = await getSession(req);
    
    return new Response(
      JSON.stringify({ 
        session,
        isAuthenticated: !!session
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error getting session:", error);
    
    return new Response(
      JSON.stringify({ 
        session: null,
        isAuthenticated: false,
        error: "Error getting session"
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
