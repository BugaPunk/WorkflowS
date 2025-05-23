import { type Model, createModel, generateId, getKv } from "@/utils/db.ts";
import { z } from "zod";

// Colecciones para sprints
export const SPRINT_COLLECTIONS = {
  SPRINTS: ["sprints"],
} as const;

// Estado del sprint
export enum SprintStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Esquema del sprint con Zod para validación
export const SprintSchema = z.object({
  name: z.string().min(3).max(100),
  goal: z.string().optional(),
  projectId: z.string(),
  status: z.nativeEnum(SprintStatus).default(SprintStatus.PLANNED),
  startDate: z.number().optional(), // timestamp
  endDate: z.number().optional(), // timestamp
  createdBy: z.string(), // userId del creador
});

// Tipo de datos del sprint
export type SprintData = z.infer<typeof SprintSchema>;

// Modelo del sprint
export interface Sprint extends Model, SprintData {
  userStoryIds: string[]; // IDs de las historias de usuario asignadas al sprint
}

// Crear un nuevo sprint
export async function createSprint(sprintData: SprintData): Promise<Sprint> {
  // Crear el modelo del sprint
  const sprint = createModel<Omit<Sprint, keyof Model | "userStoryIds">>({
    name: sprintData.name,
    goal: sprintData.goal,
    projectId: sprintData.projectId,
    status: sprintData.status || SprintStatus.PLANNED,
    startDate: sprintData.startDate,
    endDate: sprintData.endDate,
    createdBy: sprintData.createdBy,
  });

  // Añadir array vacío de historias de usuario
  const sprintWithUserStories: Sprint = {
    ...sprint,
    userStoryIds: [],
  };

  // Guardar el sprint en la base de datos
  const kv = getKv();
  const key = [...SPRINT_COLLECTIONS.SPRINTS, sprint.id];
  await kv.set(key, sprintWithUserStories);

  return sprintWithUserStories;
}

// Obtener un sprint por ID
export async function getSprintById(id: string): Promise<Sprint | null> {
  const kv = getKv();
  const key = [...SPRINT_COLLECTIONS.SPRINTS, id];
  const result = await kv.get<Sprint>(key);
  return result.value;
}

// Obtener todos los sprints de un proyecto
export async function getProjectSprints(projectId: string): Promise<Sprint[]> {
  const kv = getKv();
  const sprints: Sprint[] = [];

  // Listar todos los sprints
  const sprintsIterator = kv.list<Sprint>({ prefix: SPRINT_COLLECTIONS.SPRINTS });

  for await (const entry of sprintsIterator) {
    // Solo incluir entradas principales de sprints
    if (entry.key.length === 2 && entry.key[0] === SPRINT_COLLECTIONS.SPRINTS[0]) {
      const sprint = entry.value;
      if (sprint.projectId === projectId) {
        sprints.push(sprint);
      }
    }
  }

  return sprints;
}

// Actualizar un sprint
export async function updateSprint(
  id: string,
  updateData: Partial<SprintData>
): Promise<Sprint | null> {
  const kv = getKv();
  const key = [...SPRINT_COLLECTIONS.SPRINTS, id];

  // Obtener el sprint actual
  const result = await kv.get<Sprint>(key);
  if (!result.value) {
    return null;
  }

  // Actualizar los campos
  const updatedSprint: Sprint = {
    ...result.value,
    ...updateData,
    updatedAt: Date.now(),
  };

  // Guardar el sprint actualizado
  await kv.set(key, updatedSprint);

  return updatedSprint;
}

// Añadir una historia de usuario a un sprint
export async function addUserStoryToSprint(
  sprintId: string,
  userStoryId: string
): Promise<Sprint | null> {
  const kv = getKv();
  const key = [...SPRINT_COLLECTIONS.SPRINTS, sprintId];

  // Obtener el sprint actual
  const result = await kv.get<Sprint>(key);
  if (!result.value) {
    return null;
  }

  // Verificar si la historia ya está en el sprint
  if (result.value.userStoryIds.includes(userStoryId)) {
    return result.value;
  }

  // Añadir la historia al sprint
  const updatedSprint: Sprint = {
    ...result.value,
    userStoryIds: [...result.value.userStoryIds, userStoryId],
    updatedAt: Date.now(),
  };

  // Guardar el sprint actualizado
  await kv.set(key, updatedSprint);

  return updatedSprint;
}

// Eliminar una historia de usuario de un sprint
export async function removeUserStoryFromSprint(
  sprintId: string,
  userStoryId: string
): Promise<Sprint | null> {
  const kv = getKv();
  const key = [...SPRINT_COLLECTIONS.SPRINTS, sprintId];

  // Obtener el sprint actual
  const result = await kv.get<Sprint>(key);
  if (!result.value) {
    return null;
  }

  // Eliminar la historia del sprint
  const updatedSprint: Sprint = {
    ...result.value,
    userStoryIds: result.value.userStoryIds.filter((id) => id !== userStoryId),
    updatedAt: Date.now(),
  };

  // Guardar el sprint actualizado
  await kv.set(key, updatedSprint);

  return updatedSprint;
}

// Eliminar un sprint
export async function deleteSprint(id: string): Promise<boolean> {
  const kv = getKv();
  const key = [...SPRINT_COLLECTIONS.SPRINTS, id];

  // Eliminar el sprint
  await kv.delete(key);

  return true;
}
