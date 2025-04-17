import { FreshContext, Handlers } from "$fresh/server.ts";
import { createTask, getTaskById, getTasksByProjectId, getTasksByAssignedTo, updateTask, deleteTask } from "../../db/db.ts";

export const handler: Handlers = {
  // Obtener una tarea por ID o todas las tareas de un proyecto o usuario
  async GET(req: Request, ctx: FreshContext) {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      const projectId = url.searchParams.get("projectId");
      const assignedTo = url.searchParams.get("assignedTo");

      if (id) {
        const task = await getTaskById(Number(id));
        if (task.length === 0) {
          return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(task[0]), {
          headers: { "Content-Type": "application/json" },
        });
      } else if (projectId) {
        const tasks = await getTasksByProjectId(Number(projectId));
        return new Response(JSON.stringify(tasks), {
          headers: { "Content-Type": "application/json" },
        });
      } else if (assignedTo) {
        const tasks = await getTasksByAssignedTo(Number(assignedTo));
        return new Response(JSON.stringify(tasks), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "Se requiere un ID de tarea, ID de proyecto o ID de usuario asignado" }), {
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

  // Crear una nueva tarea
  async POST(req: Request) {
    try {
      const body = await req.json();
      
      if (!body.title || !body.projectId) {
        return new Response(JSON.stringify({ error: "Se requiere título y ID de proyecto" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const newTask = await createTask({
        title: body.title,
        description: body.description || null,
        status: body.status || "pendiente",
        dueDate: body.dueDate || null,
        projectId: body.projectId,
        assignedTo: body.assignedTo || null,
        isComplete: body.isComplete || false,
      });

      return new Response(JSON.stringify(newTask[0]), {
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

  // Actualizar una tarea existente
  async PUT(req: Request) {
    try {
      const body = await req.json();
      
      if (!body.id) {
        return new Response(JSON.stringify({ error: "Se requiere un ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar si la tarea existe
      const existingTask = await getTaskById(body.id);
      if (existingTask.length === 0) {
        return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const updateData: Record<string, unknown> = {};
      if (body.title) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.status) updateData.status = body.status;
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
      if (body.projectId) updateData.projectId = body.projectId;
      if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
      if (body.isComplete !== undefined) updateData.isComplete = body.isComplete;

      const updatedTask = await updateTask(body.id, updateData);

      return new Response(JSON.stringify(updatedTask[0]), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // Eliminar una tarea
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

      // Verificar si la tarea existe
      const existingTask = await getTaskById(Number(id));
      if (existingTask.length === 0) {
        return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      await deleteTask(Number(id));

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
