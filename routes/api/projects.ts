import { FreshContext, Handlers } from "$fresh/server.ts";
import { createProject, getProjectById, getProjectsByUserId, updateProject, deleteProject } from "../../db/db.ts";

export const handler: Handlers = {
  // Obtener un proyecto por ID o todos los proyectos de un usuario
  async GET(req: Request, ctx: FreshContext) {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      const userId = url.searchParams.get("userId");

      if (id) {
        const project = await getProjectById(Number(id));
        if (project.length === 0) {
          return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(project[0]), {
          headers: { "Content-Type": "application/json" },
        });
      } else if (userId) {
        const projects = await getProjectsByUserId(Number(userId));
        return new Response(JSON.stringify(projects), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "Se requiere un ID de proyecto o ID de usuario" }), {
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

  // Crear un nuevo proyecto
  async POST(req: Request) {
    try {
      const body = await req.json();
      
      if (!body.name || !body.userId) {
        return new Response(JSON.stringify({ error: "Se requiere nombre y ID de usuario" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const newProject = await createProject({
        name: body.name,
        description: body.description || null,
        userId: body.userId,
      });

      return new Response(JSON.stringify(newProject[0]), {
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

  // Actualizar un proyecto existente
  async PUT(req: Request) {
    try {
      const body = await req.json();
      
      if (!body.id) {
        return new Response(JSON.stringify({ error: "Se requiere un ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar si el proyecto existe
      const existingProject = await getProjectById(body.id);
      if (existingProject.length === 0) {
        return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const updateData: Record<string, unknown> = {};
      if (body.name) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.userId) updateData.userId = body.userId;

      const updatedProject = await updateProject(body.id, updateData);

      return new Response(JSON.stringify(updatedProject[0]), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Eliminar un proyecto
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

      // Verificar si el proyecto existe
      const existingProject = await getProjectById(Number(id));
      if (existingProject.length === 0) {
        return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      await deleteProject(Number(id));

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
