import type { FreshContext } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { UserRole } from "../../../models/user.ts";
import { getKv } from "../../../utils/db.ts";
import { ProjectSchema, createProject, getAllProjects, getUserProjects, getProjectById, deleteProject, PROJECT_COLLECTIONS } from "../../../models/project.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Verificar si el usuario está autenticado
  const session = await getSession(req);

  if (!session) {
    return new Response(
      JSON.stringify({ message: "No autenticado" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Manejar solicitudes GET
  if (req.method === "GET") {
    try {
      let projects;

      // Los administradores pueden ver todos los proyectos
      if (session.role === UserRole.ADMIN) {
        projects = await getAllProjects();
      } else {
        // Los usuarios no administradores solo pueden ver sus proyectos
        projects = await getUserProjects(session.userId);
      }

      return new Response(
        JSON.stringify({ projects }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al obtener proyectos:", error);

      return new Response(
        JSON.stringify({ message: "Error interno del servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Manejar solicitudes POST (crear proyecto)
  if (req.method === "POST") {
    // Solo los administradores pueden crear proyectos
    if (session.role !== UserRole.ADMIN) {
      return new Response(
        JSON.stringify({ message: "No autorizado" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Parsear el cuerpo de la solicitud
      const body = await req.json();

      // Validar los datos del proyecto
      const result = ProjectSchema.safeParse(body);

      if (!result.success) {
        return new Response(
          JSON.stringify({
            message: "Datos inválidos",
            errors: result.error.errors
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Crear el proyecto
      const project = await createProject(result.data);

      return new Response(
        JSON.stringify({
          message: "Proyecto creado exitosamente",
          project
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al crear proyecto:", error);

      return new Response(
        JSON.stringify({ message: "Error interno del servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Manejar solicitudes PUT (actualizar proyecto)
  if (req.method === "PUT") {
    // Solo los administradores pueden actualizar proyectos
    if (session.role !== UserRole.ADMIN) {
      return new Response(
        JSON.stringify({ message: "No autorizado" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Parsear el cuerpo de la solicitud
      const body = await req.json();

      // Verificar que se proporcionó un ID de proyecto
      if (!body.id) {
        return new Response(
          JSON.stringify({ message: "Se requiere el ID del proyecto" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Verificar que el proyecto existe
      const project = await getProjectById(body.id);

      if (!project) {
        return new Response(
          JSON.stringify({ message: "Proyecto no encontrado" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Validar los datos del proyecto
      const result = ProjectSchema.partial().safeParse(body);

      if (!result.success) {
        return new Response(
          JSON.stringify({
            message: "Datos inválidos",
            errors: result.error.errors
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Actualizar el proyecto
      const kv = getKv();
      const updatedProject = {
        ...project,
        ...result.data,
        updatedAt: new Date().getTime(),
      };

      const key = [...PROJECT_COLLECTIONS.PROJECTS, project.id];
      await kv.set(key, updatedProject);

      return new Response(
        JSON.stringify({
          message: "Proyecto actualizado exitosamente",
          project: updatedProject
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);

      return new Response(
        JSON.stringify({ message: "Error interno del servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Manejar solicitudes DELETE (eliminar proyecto)
  if (req.method === "DELETE") {
    // Solo los administradores pueden eliminar proyectos
    if (session.role !== UserRole.ADMIN) {
      return new Response(
        JSON.stringify({ message: "No autorizado" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Obtener el ID del proyecto de la URL
      const url = new URL(req.url);
      const projectId = url.searchParams.get("id");

      if (!projectId) {
        return new Response(
          JSON.stringify({ message: "Se requiere el ID del proyecto" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Verificar que el proyecto existe
      const project = await getProjectById(projectId);

      if (!project) {
        return new Response(
          JSON.stringify({ message: "Proyecto no encontrado" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Eliminar el proyecto
      await deleteProject(projectId);

      return new Response(
        JSON.stringify({ message: "Proyecto eliminado exitosamente" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);

      return new Response(
        JSON.stringify({ message: "Error interno del servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Método no permitido
  return new Response(
    JSON.stringify({ message: "Método no permitido" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
};
