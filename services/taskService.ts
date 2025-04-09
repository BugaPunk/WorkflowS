import { Task, TaskData, TaskStatus } from "../models/task.ts";

/**
 * Obtiene todas las tareas de una historia de usuario
 * @param userStoryId ID de la historia de usuario
 * @returns Lista de tareas
 */
export async function getUserStoryTasks(userStoryId: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks?userStoryId=${userStoryId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener las tareas de la historia de usuario");
  }
  
  const data = await response.json();
  return data.tasks;
}

/**
 * Obtiene todas las tareas asignadas a un usuario
 * @param userId ID del usuario
 * @returns Lista de tareas
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks?assignedTo=${userId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener las tareas del usuario");
  }
  
  const data = await response.json();
  return data.tasks;
}

/**
 * Obtiene una tarea por su ID
 * @param id ID de la tarea
 * @returns Tarea
 */
export async function getTaskById(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener la tarea");
  }
  
  const data = await response.json();
  return data.task;
}

/**
 * Crea una nueva tarea
 * @param data Datos de la tarea
 * @returns Tarea creada
 */
export async function createTask(data: TaskData): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear la tarea");
  }
  
  const responseData = await response.json();
  return responseData.task;
}

/**
 * Actualiza una tarea
 * @param id ID de la tarea
 * @param data Datos a actualizar
 * @returns Tarea actualizada
 */
export async function updateTask(id: string, data: Partial<TaskData>): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar la tarea");
  }
  
  const responseData = await response.json();
  return responseData.task;
}

/**
 * Elimina una tarea
 * @param id ID de la tarea
 */
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar la tarea");
  }
}
