import { z } from "zod";
import { getKv, type Model, createModel, generateId } from "@/utils/db.ts";

// Colecciones para tareas
export const TASK_COLLECTIONS = {
  TASKS: ["tasks"],
} as const;

// Estado de la tarea
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  BLOCKED = "blocked"
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
});

// Tipo de datos de la tarea
export type TaskData = z.infer<typeof TaskSchema>;

// Modelo de la tarea
export interface Task extends Model, TaskData {}

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
export async function updateTask(id: string, updateData: Partial<TaskData>): Promise<Task | null> {
  const kv = getKv();
  const key = [...TASK_COLLECTIONS.TASKS, id];
  
  // Obtener la tarea actual
  const result = await kv.get<Task>(key);
  if (!result.value) {
    return null;
  }
  
  // Actualizar los campos
  const updatedTask: Task = {
    ...result.value,
    ...updateData,
    updatedAt: Date.now(),
  };
  
  // Guardar la tarea actualizada
  await kv.set(key, updatedTask);
  
  return updatedTask;
}

// Eliminar una tarea
export async function deleteTask(id: string): Promise<boolean> {
  const kv = getKv();
  const key = [...TASK_COLLECTIONS.TASKS, id];
  
  // Eliminar la tarea
  await kv.delete(key);
  
  return true;
}
