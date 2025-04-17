import { FreshContext, Handlers } from "$fresh/server.ts";
import { createUser, getUserByEmail, getUserByUsername } from "../../db/db.ts";
import { UserRole } from "../../db/schema.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    try {
      const body = await req.json();
      
      // Validar campos requeridos
      const requiredFields = ["firstName", "lastName", "username", "email", "password", "role"];
      for (const field of requiredFields) {
        if (!body[field]) {
          return new Response(JSON.stringify({ error: `El campo ${field} es requerido` }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Validar que el rol sea válido
      const validRoles = Object.values(UserRole);
      if (!validRoles.includes(body.role)) {
        return new Response(JSON.stringify({ error: "Rol no válido" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar si el email ya existe
      const existingUserByEmail = await getUserByEmail(body.email);
      if (existingUserByEmail.length > 0) {
        return new Response(JSON.stringify({ error: "El correo electrónico ya está registrado" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar si el nombre de usuario ya existe
      const existingUserByUsername = await getUserByUsername(body.username);
      if (existingUserByUsername.length > 0) {
        return new Response(JSON.stringify({ error: "El nombre de usuario ya está en uso" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(body.password);

      // Crear el usuario
      const newUser = await createUser({
        firstName: body.firstName,
        lastName: body.lastName,
        username: body.username,
        email: body.email,
        password: hashedPassword,
        role: body.role,
      });

      // Eliminar la contraseña del objeto de respuesta
      const userResponse = { ...newUser[0] };
      delete userResponse.password;

      return new Response(JSON.stringify(userResponse), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
