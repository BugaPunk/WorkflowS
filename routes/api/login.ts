import type { FreshContext } from "$fresh/server.ts";
import { getUserByEmail, getUserByUsername, verifyPassword } from "@/models/user.ts";
import { getKv, COLLECTIONS } from "@/utils/db.ts";

// HTTP status codes
const Status = {
  OK: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  InternalServerError: 500,
  ServiceUnavailable: 503
};

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Método no permitido" }),
      {
        status: Status.MethodNotAllowed,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (_error) {
      return new Response(
        JSON.stringify({ message: "JSON inválido en el cuerpo de la solicitud" }),
        {
          status: Status.BadRequest,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate the request body
    if (!body.identifier || !body.password) {
      return new Response(
        JSON.stringify({ 
          message: "Se requiere identificador y contraseña" 
        }),
        {
          status: Status.BadRequest,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { identifier, password } = body;

    try {
      // Try to find user by email or username
      let user = await getUserByEmail(identifier);
      
      if (!user) {
        user = await getUserByUsername(identifier);
      }

      if (!user) {
        return new Response(
          JSON.stringify({ message: "Credenciales inválidas" }),
          {
            status: Status.Unauthorized,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      
      if (!isPasswordValid) {
        return new Response(
          JSON.stringify({ message: "Credenciales inválidas" }),
          {
            status: Status.Unauthorized,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Generate a session token
      const sessionId = crypto.randomUUID();
      const kv = getKv();
      
      // Store session in KV
      const sessionData = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: new Date().getTime(),
        expiresAt: new Date().getTime() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };
      
      await kv.set([...COLLECTIONS.USERS, "sessions", sessionId], sessionData);
      
      // Return user data and session token
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      // Set cookie with session ID
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      headers.set("Set-Cookie", `sessionId=${sessionId}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
      
      return new Response(
        JSON.stringify({
          message: "Inicio de sesión exitoso",
          user: userWithoutPassword,
          sessionId
        }),
        {
          status: Status.OK,
          headers
        }
      );
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      
      // Check if it's a KV-related error
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      if (errorMessage.includes("KV is not initialized")) {
        return new Response(
          JSON.stringify({ message: "Servicio de base de datos no disponible" }),
          {
            status: Status.ServiceUnavailable,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ message: "Error interno del servidor" }),
        {
          status: Status.InternalServerError,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error inesperado en el manejador de inicio de sesión:", error);
    
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      {
        status: Status.InternalServerError,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
