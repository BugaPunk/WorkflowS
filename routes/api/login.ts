import { FreshContext, Handlers } from "$fresh/server.ts";
import { getUserByEmail, getUserByUsername } from "../../db/db.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    try {
      const body = await req.json();
      
      // Validar campos requeridos
      if (!body.usernameOrEmail || !body.password) {
        return new Response(JSON.stringify({ error: "Se requiere nombre de usuario/email y contraseña" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Buscar usuario por email o nombre de usuario
      let user;
      if (body.usernameOrEmail.includes("@")) {
        // Es un email
        const users = await getUserByEmail(body.usernameOrEmail);
        if (users.length > 0) {
          user = users[0];
        }
      } else {
        // Es un nombre de usuario
        const users = await getUserByUsername(body.usernameOrEmail);
        if (users.length > 0) {
          user = users[0];
        }
      }

      // Verificar si el usuario existe
      if (!user) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar la contraseña
      const passwordMatch = await bcrypt.compare(body.password, user.password);
      if (!passwordMatch) {
        return new Response(JSON.stringify({ error: "Contraseña incorrecta" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Eliminar la contraseña del objeto de respuesta
      const userResponse = { ...user };
      delete userResponse.password;

      // En una aplicación real, aquí se generaría un token JWT o una cookie de sesión
      
      return new Response(JSON.stringify({
        message: "Inicio de sesión exitoso",
        user: userResponse,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
