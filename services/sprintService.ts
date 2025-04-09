import { Sprint, SprintData, SprintStatus } from "../models/sprint.ts";

/**
 * Obtiene todos los sprints de un proyecto
 * @param projectId ID del proyecto
 * @returns Lista de sprints
 */
export async function getProjectSprints(projectId: string): Promise<Sprint[]> {
  const response = await fetch(`/api/sprints?projectId=${projectId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener los sprints del proyecto");
  }
  
  const data = await response.json();
  return data.sprints;
}

/**
 * Obtiene un sprint por su ID
 * @param id ID del sprint
 * @returns Sprint
 */
export async function getSprintById(id: string): Promise<Sprint> {
  const response = await fetch(`/api/sprints/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener el sprint");
  }
  
  const data = await response.json();
  return data.sprint;
}

/**
 * Crea un nuevo sprint
 * @param data Datos del sprint
 * @returns Sprint creado
 */
export async function createSprint(data: SprintData): Promise<Sprint> {
  const response = await fetch("/api/sprints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear el sprint");
  }
  
  const responseData = await response.json();
  return responseData.sprint;
}

/**
 * Actualiza un sprint
 * @param id ID del sprint
 * @param data Datos a actualizar
 * @returns Sprint actualizado
 */
export async function updateSprint(id: string, data: Partial<SprintData>): Promise<Sprint> {
  const response = await fetch(`/api/sprints/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar el sprint");
  }
  
  const responseData = await response.json();
  return responseData.sprint;
}

/**
 * Elimina un sprint
 * @param id ID del sprint
 */
export async function deleteSprint(id: string): Promise<void> {
  const response = await fetch(`/api/sprints/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar el sprint");
  }
}

/**
 * Añade una historia de usuario a un sprint
 * @param sprintId ID del sprint
 * @param userStoryId ID de la historia de usuario
 * @returns Sprint actualizado
 */
export async function addUserStoryToSprint(sprintId: string, userStoryId: string): Promise<Sprint> {
  const response = await fetch(`/api/sprints/${sprintId}/user-stories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userStoryId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al añadir la historia de usuario al sprint");
  }
  
  const responseData = await response.json();
  return responseData.sprint;
}

/**
 * Elimina una historia de usuario de un sprint
 * @param sprintId ID del sprint
 * @param userStoryId ID de la historia de usuario
 * @returns Sprint actualizado
 */
export async function removeUserStoryFromSprint(sprintId: string, userStoryId: string): Promise<Sprint> {
  const response = await fetch(`/api/sprints/${sprintId}/user-stories/${userStoryId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar la historia de usuario del sprint");
  }
  
  const responseData = await response.json();
  return responseData.sprint;
}
