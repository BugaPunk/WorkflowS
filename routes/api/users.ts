import { FreshContext, Handlers } from "$fresh/server.ts";
import { createUser, getUserById, getUserByEmail, updateUser, deleteUser } from "../../db/db.ts";

export const handler: Handlers = {
  // Obtener un usuario por ID
  async GET(req: Request, ctx: FreshContext) {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      const email = url.searchParams.get("email");

      if (id) {
        const user = await getUserById(Number(id));
        if (user.length === 0) {
          return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(user[0]), {
          headers: { "Content-Type": "application/json" },
        });
      } else if (email) {
        const user = await getUserByEmail(email);
        if (user.length === 0) {
          return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(user[0]), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "Se requiere un ID o email" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Crear un nuevo usuario
  async POST(req: Request) {
    try {
      const body = await req.json();
      
      if (!body.name || !body.email) {
        return new Response(JSON.stringify({ error: "Se requiere nombre y email" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar si el email ya existe
      const existingUser = await getUserByEmail(body.email);
      if (existingUser.length > 0) {
        return new Response(JSON.stringify({ error: "El email ya está registrado" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const newUser = await createUser({
        name: body.name,
        email: body.email,
      });

      return new Response(JSON.stringify(newUser[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Actualizar un usuario existente
  async PUT(req: Request) {
    try {
      const body = await req.json();
      
      if (!body.id) {
        return new Response(JSON.stringify({ error: "Se requiere un ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar si el usuario existe
      const existingUser = await getUserById(body.id);
      if (existingUser.length === 0) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const updateData: Record<string, unknown> = {};
      if (body.name) updateData.name = body.name;
      if (body.email) updateData.email = body.email;

      const updatedUser = await updateUser(body.id, updateData);

      return new Response(JSON.stringify(updatedUser[0]), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Eliminar un usuario
  async DELETE(req: Request) {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "Se requiere un ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar si el usuario existe
      const existingUser = await getUserById(Number(id));
      if (existingUser.length === 0) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      await deleteUser(Number(id));

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
