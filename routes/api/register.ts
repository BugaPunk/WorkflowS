import type { FreshContext } from "$fresh/server.ts";
import { UserSchema, createUser, getUserByEmail, getUserByUsername } from "@/models/user.ts";
import { Status, errorResponse, handleApiError, successResponse } from "@/utils/api.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return errorResponse("Método no permitido", Status.MethodNotAllowed);
  }

  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (_error) {
      return errorResponse("JSON inválido en el cuerpo de la solicitud", Status.BadRequest);
    }

    // Validate the request body
    const result = UserSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Datos inválidos", Status.BadRequest);
    }

    const userData = result.data;

    try {
      // Check if user with the same email already exists
      const existingUserByEmail = await getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return errorResponse("El correo electrónico ya está en uso", Status.BadRequest);
      }

      // Check if user with the same username already exists
      const existingUserByUsername = await getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return errorResponse("El nombre de usuario ya está en uso", Status.BadRequest);
      }

      // Create the user
      const user = await createUser(userData);

      // Return the user without the password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return successResponse(
        { user: userWithoutPassword },
        "Usuario registrado con éxito",
        Status.Created
      );
    } catch (error) {
      console.error("Error during user registration:", error);

      return handleApiError(error);
    }
  } catch (error) {
    console.error("Unexpected error in registration handler:", error);
    return handleApiError(error);
  }
};
