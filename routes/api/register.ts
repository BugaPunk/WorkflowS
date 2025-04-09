import type { FreshContext } from "$fresh/server.ts";

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
import { UserSchema, createUser, getUserByEmail, getUserByUsername } from "@/models/user.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: Status.MethodNotAllowed,
      headers: { "Content-Type": "application/json" },
    });
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
    const result = UserSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          message: "Datos inválidos",
          errors: result.error.errors
        }),
        {
          status: Status.BadRequest,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userData = result.data;

    try {
      // Check if user with the same email already exists
      const existingUserByEmail = await getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return new Response(
          JSON.stringify({ message: "El correo electrónico ya está en uso" }),
          {
            status: Status.BadRequest,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Check if user with the same username already exists
      const existingUserByUsername = await getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return new Response(
          JSON.stringify({ message: "El nombre de usuario ya está en uso" }),
          {
            status: Status.BadRequest,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Create the user
      const user = await createUser(userData);

      // Return the user without the password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return new Response(
        JSON.stringify({
          message: "Usuario registrado con éxito",
          user: userWithoutPassword
        }),
        {
          status: Status.Created,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error during user registration:", error);

      // Check if it's a KV-related error
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
    console.error("Unexpected error in registration handler:", error);

    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      {
        status: Status.InternalServerError,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
