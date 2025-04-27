import { z } from "zod";
import { getKv, type Model, createModel } from "@/utils/db.ts";

// Colecciones para historias de usuario
export const USER_STORY_COLLECTIONS = {
  USER_STORIES: ["userStories"],
} as const;

// Prioridad de la historia de usuario
export enum UserStoryPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Estado de la historia de usuario
export enum UserStoryStatus {
  BACKLOG = "backlog",
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  TESTING = "testing",
  DONE = "done",
}

// Esquema de la historia de usuario con Zod para validación
export const UserStorySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string(),
  acceptanceCriteria: z.string(),
  priority: z.nativeEnum(UserStoryPriority).default(UserStoryPriority.MEDIUM),
  status: z.nativeEnum(UserStoryStatus).default(UserStoryStatus.BACKLOG),
  points: z.number().optional(),
  projectId: z.string(),
  createdBy: z.string(), // userId del creador
  assignedTo: z.string().optional(), // userId del asignado
  sprintId: z.string().optional(),
});

// Esquema para crear una historia de usuario
export const CreateUserStorySchema = UserStorySchema.omit({
  status: true,
  assignedTo: true,
  sprintId: true,
  createdBy: true,
});

// Esquema para actualizar una historia de usuario
export const UpdateUserStorySchema = UserStorySchema.partial().omit({
  projectId: true,
  createdBy: true,
});

// Tipo de datos de la historia de usuario
export type UserStoryData = z.infer<typeof UserStorySchema>;
export type CreateUserStoryData = z.infer<typeof CreateUserStorySchema>;
export type UpdateUserStoryData = z.infer<typeof UpdateUserStorySchema>;

// Modelo de la historia de usuario
export interface UserStory extends Model, UserStoryData {}

// Crear una nueva historia de usuario
export async function createUserStory(userStoryData: CreateUserStoryData, createdBy: string): Promise<UserStory> {
  // Crear el modelo de la historia de usuario
  const userStory = createModel<Omit<UserStory, keyof Model>>({
    title: userStoryData.title,
    description: userStoryData.description,
    acceptanceCriteria: userStoryData.acceptanceCriteria,
    priority: userStoryData.priority,
    status: UserStoryStatus.BACKLOG,
    points: userStoryData.points,
    projectId: userStoryData.projectId,
    createdBy: createdBy,
  });

  // Guardar la historia de usuario en la base de datos
  const kv = getKv();
  const key = [...USER_STORY_COLLECTIONS.USER_STORIES, userStory.id];
  await kv.set(key, userStory);

  return userStory;
}

// Obtener una historia de usuario por su ID
export async function getUserStoryById(id: string): Promise<UserStory | null> {
  const kv = getKv();
  const userStoryEntry = await kv.get<UserStory>([...USER_STORY_COLLECTIONS.USER_STORIES, id]);
  return userStoryEntry.value || null;
}

// Obtener todas las historias de usuario de un proyecto
export async function getProjectUserStories(projectId: string): Promise<UserStory[]> {
  const kv = getKv();
  const userStories: UserStory[] = [];

  // Listar todas las historias de usuario
  const userStoriesIterator = kv.list<UserStory>({ prefix: USER_STORY_COLLECTIONS.USER_STORIES });

  for await (const entry of userStoriesIterator) {
    const userStory = entry.value;
    if (userStory.projectId === projectId) {
      userStories.push(userStory);
    }
  }

  return userStories;
}

/**
 * Obtener historias de usuario con filtros
 * @param filters Filtros para las historias de usuario
 * @returns Lista de historias de usuario filtradas
 */
export async function getUserStoriesWithFilters(filters: {
  projectId?: string;
  status?: string | string[];
  sprintId?: string;
  priority?: string | string[];
  search?: string;
} = {}): Promise<UserStory[]> {
  const kv = getKv();
  const userStories: UserStory[] = [];

  // Listar todas las historias de usuario
  const userStoriesIterator = kv.list<UserStory>({ prefix: USER_STORY_COLLECTIONS.USER_STORIES });

  // Convertir arrays de filtros a conjuntos para búsqueda más eficiente
  const statusSet = filters.status ?
    new Set(Array.isArray(filters.status) ? filters.status : [filters.status]) :
    null;

  const prioritySet = filters.priority ?
    new Set(Array.isArray(filters.priority) ? filters.priority : [filters.priority]) :
    null;

  // Convertir búsqueda a minúsculas para comparación insensible a mayúsculas/minúsculas
  const searchLower = filters.search ? filters.search.toLowerCase() : null;

  for await (const entry of userStoriesIterator) {
    const userStory = entry.value;
    let include = true;

    // Filtrar por proyecto
    if (filters.projectId && userStory.projectId !== filters.projectId) {
      include = false;
    }

    // Filtrar por estado
    if (include && statusSet && !statusSet.has(userStory.status)) {
      include = false;
    }

    // Filtrar por sprint
    if (include && filters.sprintId && userStory.sprintId !== filters.sprintId) {
      include = false;
    }

    // Filtrar por prioridad
    if (include && prioritySet && !prioritySet.has(userStory.priority)) {
      include = false;
    }

    // Filtrar por búsqueda en título o descripción
    if (include && searchLower &&
        !userStory.title.toLowerCase().includes(searchLower) &&
        !userStory.description.toLowerCase().includes(searchLower)) {
      include = false;
    }

    if (include) {
      userStories.push(userStory);
    }
  }

  return userStories;
}

// Actualizar una historia de usuario
export async function updateUserStory(id: string, updateData: UpdateUserStoryData): Promise<UserStory | null> {
  const kv = getKv();
  const key = [...USER_STORY_COLLECTIONS.USER_STORIES, id];

  // Obtener la historia de usuario actual
  const result = await kv.get<UserStory>(key);
  if (!result.value) {
    return null;
  }

  // Actualizar los campos
  const updatedUserStory: UserStory = {
    ...result.value,
    ...updateData,
    updatedAt: Date.now(),
  };

  // Guardar la historia de usuario actualizada
  await kv.set(key, updatedUserStory);

  return updatedUserStory;
}

// Eliminar una historia de usuario
export async function deleteUserStory(id: string): Promise<boolean> {
  const kv = getKv();
  const key = [...USER_STORY_COLLECTIONS.USER_STORIES, id];

  // Verificar si la historia de usuario existe
  const result = await kv.get<UserStory>(key);
  if (!result.value) {
    return false;
  }

  // Eliminar la historia de usuario
  await kv.delete(key);

  return true;
}

// Obtener todas las historias de usuario de un sprint
export async function getUserStoriesBySprintId(sprintId: string): Promise<UserStory[]> {
  return await getUserStoriesWithFilters({ sprintId });
}
