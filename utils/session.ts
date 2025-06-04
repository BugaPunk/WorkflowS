import type { FreshContext } from "$fresh/server.ts";
import type { UserRole } from "../models/user.ts";
/// <reference lib="deno.unstable" />
import { COLLECTIONS, getKv } from "./db.ts";

export interface Session {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
}

// Obtener sesión por cookie
export async function getSession(req: Request): Promise<Session | null> {
  try {
    // Get session ID from cookie
    const cookies = req.headers.get("cookie");
    if (!cookies) return null;

    const sessionIdMatch = cookies.match(/sessionId=([^;]+)/);
    if (!sessionIdMatch) return null;

    const sessionId = sessionIdMatch[1];

    // Get session from KV
    const kv = getKv();
    const result = await kv.get<Session>([...COLLECTIONS.USERS, "sessions", sessionId]);
    const session = result.value;

    if (!session) return null;

    // Check if session is expired
    if (session.expiresAt < new Date().getTime()) {
      // Delete expired session
      await kv.delete([...COLLECTIONS.USERS, "sessions", sessionId]);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Definir un tipo para el contexto de Fresh con sesión
export interface FreshContextWithSession extends FreshContext {
  session?: Session;
}

// Crear un middleware para verificar si el usuario está autenticado
export function requireAuth(
  handler: (req: Request, ctx: FreshContextWithSession) => Response | Promise<Response>
) {
  return async (req: Request, ctx: FreshContextWithSession) => {
    const session = await getSession(req);

    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }

    // Agregar la sesión al contexto
    ctx.session = session;
    return handler(req, ctx);
  };
}

// Create a middleware to check if user has specific role
export function requireRole(
  role: UserRole | UserRole[],
  handler: (req: Request, ctx: FreshContextWithSession) => Response | Promise<Response>
) {
  return requireAuth((req: Request, ctx: FreshContextWithSession) => {
    const session = ctx.session as Session;

    // Check if user has required role
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(session.role)) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }

    return handler(req, ctx);
  });
}
