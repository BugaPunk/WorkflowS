import type { TaskComment, TaskHistoryEntry } from "../models/task.ts";

/**
 * Obtiene los comentarios de una tarea
 * @param taskId ID de la tarea
 * @returns Lista de comentarios
 */
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const response = await fetch(`/api/tasks/${taskId}/comments`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener comentarios");
  }
  
  const data = await response.json();
  return data.comments;
}

/**
 * Añade un comentario a una tarea
 * @param taskId ID de la tarea
 * @param content Contenido del comentario
 * @returns Comentario creado
 */
export async function addTaskComment(taskId: string, content: string): Promise<TaskComment> {
  const response = await fetch(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al añadir comentario");
  }
  
  const data = await response.json();
  return data.comment;
}

/**
 * Obtiene el historial de cambios de una tarea
 * @param taskId ID de la tarea
 * @returns Lista de entradas de historial
 */
export async function getTaskHistory(taskId: string): Promise<TaskHistoryEntry[]> {
  const response = await fetch(`/api/tasks/${taskId}/history`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener historial");
  }
  
  const data = await response.json();
  return data.history;
}

/**
 * Registra tiempo en una tarea
 * @param taskId ID de la tarea
 * @param hours Horas a registrar
 * @param action Acción a realizar (añadir o establecer)
 * @returns Tarea actualizada
 */
export async function logTaskTime(
  taskId: string, 
  hours: number, 
  action: "add" | "set" = "add"
): Promise<any> {
  const response = await fetch(`/api/tasks/${taskId}/time`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hours, action }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al registrar tiempo");
  }
  
  const data = await response.json();
  return data.task;
}
