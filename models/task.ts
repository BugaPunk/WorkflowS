import { type Model, createModel, getKv } from "@/utils/db.ts";
import { z } from "zod";

// Colecciones para tareas
export const TASK_COLLECTIONS = {
  TASKS: ["tasks"],
  TASK_COMMENTS: ["task_comments"],
  TASK_HISTORY: ["task_history"],
} as const;

// Estado de la tarea
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  BLOCKED = "blocked",
}

// Esquema de la tarea con Zod para validación
export const TaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  userStoryId: z.string(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assignedTo: z.string().optional(), // userId del asignado
  estimatedHours: z.number().optional(),
  spentHours: z.number().optional(),
  createdBy: z.string(), // userId del creador
  isDeliverable: z.boolean().default(false), // Indica si la tarea es un entregable
});

// Tipo de datos de la tarea
export type TaskData = z.infer<typeof TaskSchema>;

// Tipo para el historial de cambios
export enum TaskHistoryType {
  FIELD_CHANGE = "field_change",
  STATUS_CHANGE = "status_change",
  ASSIGNMENT = "assignment",
  TIME_LOGGED = "time_logged",
  COMMENT_ADDED = "comment_added",
}

export interface TaskHistoryEntry extends Model {
  taskId: string;
  userId: string;
  type: TaskHistoryType;
  field: string;
  oldValue: string;
  newValue: string;
  description?: string; // Descripción legible del cambio
}

// Tipo para comentarios
export interface TaskComment extends Model {
  taskId: string;
  userId: string;
  content: string;
}

// Modelo de la tarea
export interface Task extends Model, TaskData {
  history?: TaskHistoryEntry[];
  comments?: TaskComment[];
}

// Crear una nueva tarea
export async function createTask(taskData: TaskData): Promise<Task> {
  // Crear el modelo de la tarea
  const task = createModel<Omit<Task, keyof Model>>({
    title: taskData.title,
    description: taskData.description,
    userStoryId: taskData.userStoryId,
    status: taskData.status || TaskStatus.TODO,
    assignedTo: taskData.assignedTo,
    estimatedHours: taskData.estimatedHours,
    spentHours: taskData.spentHours,
    createdBy: taskData.createdBy,
    isDeliverable: taskData.isDeliverable || false,
  });

  // Guardar la tarea en la base de datos
  const kv = getKv();
  const key = [...TASK_COLLECTIONS.TASKS, task.id];
  await kv.set(key, task);

  return task;
}

// Obtener una tarea por ID
export async function getTaskById(id: string): Promise<Task | null> {
  const kv = getKv();
  const key = [...TASK_COLLECTIONS.TASKS, id];
  const result = await kv.get<Task>(key);
  return result.value;
}

// Obtener todas las tareas de una historia de usuario
export async function getUserStoryTasks(userStoryId: string): Promise<Task[]> {
  const kv = getKv();
  const tasks: Task[] = [];

  // Listar todas las tareas
  const tasksIterator = kv.list<Task>({ prefix: TASK_COLLECTIONS.TASKS });

  for await (const entry of tasksIterator) {
    // Solo incluir entradas principales de tareas
    if (entry.key.length === 2 && entry.key[0] === TASK_COLLECTIONS.TASKS[0]) {
      const task = entry.value;
      if (task.userStoryId === userStoryId) {
        tasks.push(task);
      }
    }
  }

  return tasks;
}

// Obtener todas las tareas asignadas a un usuario
export async function getUserTasks(userId: string): Promise<Task[]> {
  const kv = getKv();
  const tasks: Task[] = [];

  // Listar todas las tareas
  const tasksIterator = kv.list<Task>({ prefix: TASK_COLLECTIONS.TASKS });

  for await (const entry of tasksIterator) {
    // Solo incluir entradas principales de tareas
    if (entry.key.length === 2 && entry.key[0] === TASK_COLLECTIONS.TASKS[0]) {
      const task = entry.value;
      if (task.assignedTo === userId) {
        tasks.push(task);
      }
    }
  }

  return tasks;
}

// Actualizar una tarea
export async function updateTask(
  id: string,
  updateData: Partial<TaskData>,
  userId?: string
): Promise<Task | null> {
  const kv = getKv();
  const key = [...TASK_COLLECTIONS.TASKS, id];

  // Obtener la tarea actual
  const result = await kv.get<Task>(key);
  if (!result.value) {
    return null;
  }

  const currentTask = result.value;

  // Actualizar los campos
  const updatedTask: Task = {
    ...currentTask,
    ...updateData,
    updatedAt: Date.now(),
  };

  // Guardar la tarea actualizada
  await kv.set(key, updatedTask);

  // Registrar cambios en el historial si se proporciona un userId
  if (userId) {
    for (const [field, newValue] of Object.entries(updateData)) {
      const oldValue = currentTask[field as keyof Task];

      // Solo registrar si el valor ha cambiado
      if (oldValue !== newValue) {
        // Determinar el tipo de cambio
        let type = TaskHistoryType.FIELD_CHANGE;
        let description: string | undefined;

        if (field === "status") {
          type = TaskHistoryType.STATUS_CHANGE;
          description = `Estado cambiado de "${getStatusText(oldValue as TaskStatus)}" a "${getStatusText(newValue as TaskStatus)}"`;
        } else if (field === "assignedTo") {
          type = TaskHistoryType.ASSIGNMENT;
          if (!oldValue && newValue) {
            description = "Tarea asignada";
          } else if (oldValue && !newValue) {
            description = "Asignación removida";
          } else {
            description = "Tarea reasignada";
          }
        } else if (field === "spentHours") {
          type = TaskHistoryType.TIME_LOGGED;
          const oldHours = oldValue ? Number(oldValue) : 0;
          const newHours = newValue ? Number(newValue) : 0;
          const hoursLogged = newHours - oldHours;
          description = `${hoursLogged > 0 ? `${hoursLogged} horas registradas` : "Horas ajustadas"}`;
        }

        await addTaskHistoryEntry({
          taskId: id,
          userId,
          type,
          field,
          oldValue: oldValue !== undefined ? String(oldValue) : "",
          newValue: newValue !== undefined ? String(newValue) : "",
          description,
        });
      }
    }
  }

  // Si se cambió el estado de la tarea, actualizar el estado de la historia de usuario
  if (updateData.status && updateData.status !== currentTask.status) {
    try {
      const { onTaskStatusChanged } = await import("../services/userStoryStatusService.ts");
      await onTaskStatusChanged(id);
    } catch (error) {
      console.error("Error actualizando estado de historia de usuario:", error);
      // No fallar la actualización de la tarea por este error
    }
  }

  return updatedTask;
}

// Función auxiliar para obtener texto legible del estado
function getStatusText(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return "Por hacer";
    case TaskStatus.IN_PROGRESS:
      return "En progreso";
    case TaskStatus.REVIEW:
      return "En revisión";
    case TaskStatus.DONE:
      return "Completada";
    case TaskStatus.BLOCKED:
      return "Bloqueada";
    default:
      return String(status);
  }
}

// Añadir una entrada al historial de cambios
export async function addTaskHistoryEntry(
  entryData: Omit<TaskHistoryEntry, keyof Model>
): Promise<TaskHistoryEntry> {
  const kv = getKv();

  // Crear el modelo de la entrada de historial
  const entry = createModel<Omit<TaskHistoryEntry, keyof Model>>({
    taskId: entryData.taskId,
    userId: entryData.userId,
    type: entryData.type,
    field: entryData.field,
    oldValue: entryData.oldValue,
    newValue: entryData.newValue,
    description: entryData.description,
  });

  // Guardar la entrada de historial
  const key = [...TASK_COLLECTIONS.TASK_HISTORY, entry.id];
  await kv.set(key, entry);

  // Crear un índice para buscar por tarea
  await kv.set([...TASK_COLLECTIONS.TASK_HISTORY, "by_task", entryData.taskId, entry.id], entry.id);

  return entry;
}

// Obtener el historial de cambios de una tarea
export async function getTaskHistory(taskId: string): Promise<TaskHistoryEntry[]> {
  const kv = getKv();
  const history: TaskHistoryEntry[] = [];

  // Listar todas las entradas de historial para esta tarea
  const historyIterator = kv.list<string>({
    prefix: [...TASK_COLLECTIONS.TASK_HISTORY, "by_task", taskId],
  });

  for await (const entry of historyIterator) {
    const historyId = entry.value;
    const historyKey = [...TASK_COLLECTIONS.TASK_HISTORY, historyId];
    const historyResult = await kv.get<TaskHistoryEntry>(historyKey);

    if (historyResult.value) {
      history.push(historyResult.value);
    }
  }

  // Ordenar por fecha de creación (más reciente primero)
  return history.sort((a, b) => b.createdAt - a.createdAt);
}

// Añadir un comentario a una tarea
export async function addTaskComment(commentData: {
  taskId: string;
  userId: string;
  content: string;
}): Promise<TaskComment> {
  const kv = getKv();

  // Crear el modelo del comentario
  const comment = createModel<Omit<TaskComment, keyof Model>>({
    taskId: commentData.taskId,
    userId: commentData.userId,
    content: commentData.content,
  });

  // Guardar el comentario
  const key = [...TASK_COLLECTIONS.TASK_COMMENTS, comment.id];
  await kv.set(key, comment);

  // Crear un índice para buscar por tarea
  await kv.set(
    [...TASK_COLLECTIONS.TASK_COMMENTS, "by_task", commentData.taskId, comment.id],
    comment.id
  );

  // Registrar en el historial la adición del comentario
  await addTaskHistoryEntry({
    taskId: commentData.taskId,
    userId: commentData.userId,
    type: TaskHistoryType.COMMENT_ADDED,
    field: "comments",
    oldValue: "",
    newValue: comment.id,
    description: "Comentario añadido",
  });

  return comment;
}

// Obtener los comentarios de una tarea
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const kv = getKv();
  const comments: TaskComment[] = [];

  // Listar todos los comentarios para esta tarea
  const commentsIterator = kv.list<string>({
    prefix: [...TASK_COLLECTIONS.TASK_COMMENTS, "by_task", taskId],
  });

  for await (const entry of commentsIterator) {
    const commentId = entry.value;
    const commentKey = [...TASK_COLLECTIONS.TASK_COMMENTS, commentId];
    const commentResult = await kv.get<TaskComment>(commentKey);

    if (commentResult.value) {
      comments.push(commentResult.value);
    }
  }

  // Ordenar por fecha de creación (más antiguo primero)
  return comments.sort((a, b) => a.createdAt - b.createdAt);
}

// Eliminar una tarea
export async function deleteTask(id: string): Promise<boolean> {
  const kv = getKv();
  const key = [...TASK_COLLECTIONS.TASKS, id];

  // Eliminar la tarea
  await kv.delete(key);

  // Eliminar comentarios asociados
  const commentsIterator = kv.list({
    prefix: [...TASK_COLLECTIONS.TASK_COMMENTS, "by_task", id],
  });

  for await (const entry of commentsIterator) {
    const commentId = String(entry.value);
    await kv.delete([...TASK_COLLECTIONS.TASK_COMMENTS, commentId]);
    await kv.delete(entry.key);
  }

  // Eliminar historial asociado
  const historyIterator = kv.list({
    prefix: [...TASK_COLLECTIONS.TASK_HISTORY, "by_task", id],
  });

  for await (const entry of historyIterator) {
    const historyId = String(entry.value);
    await kv.delete([...TASK_COLLECTIONS.TASK_HISTORY, historyId]);
    await kv.delete(entry.key);
  }

  return true;
}
