import type { CreateUserStoryData, UpdateUserStoryData, UserStory } from "../models/userStory.ts";

/**
 * Obtiene todas las historias de usuario según los filtros proporcionados
 * @param filters Filtros para las historias de usuario
 * @returns Lista de historias de usuario
 */
export async function getUserStories(filters: {
  projectId?: string;
  status?: string;
  sprintId?: string;
} = {}): Promise<UserStory[]> {
  const params = new URLSearchParams();
  
  if (filters.projectId) {
    params.append("projectId", filters.projectId);
  }
  
  if (filters.status) {
    params.append("status", filters.status);
  }
  
  if (filters.sprintId) {
    params.append("sprintId", filters.sprintId);
  }
  
  const url = `/api/user-stories${params.toString() ? `?${params.toString()}` : ""}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener historias de usuario");
  }
  
  const data = await response.json();
  return data.userStories;
}

/**
 * Obtiene una historia de usuario por su ID
 * @param id ID de la historia de usuario
 * @returns Historia de usuario
 */
export async function getUserStoryById(id: string): Promise<UserStory> {
  const response = await fetch(`/api/user-stories/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener la historia de usuario");
  }
  
  const data = await response.json();
  return data.userStory;
}

/**
 * Crea una nueva historia de usuario
 * @param data Datos de la historia de usuario
 * @returns Historia de usuario creada
 */
export async function createUserStory(data: CreateUserStoryData): Promise<UserStory> {
  const response = await fetch("/api/user-stories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear la historia de usuario");
  }
  
  const responseData = await response.json();
  return responseData.userStory;
}

/**
 * Actualiza una historia de usuario
 * @param id ID de la historia de usuario
 * @param data Datos a actualizar
 * @returns Historia de usuario actualizada
 */
export async function updateUserStory(id: string, data: UpdateUserStoryData): Promise<UserStory> {
  const response = await fetch(`/api/user-stories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar la historia de usuario");
  }
  
  const responseData = await response.json();
  return responseData.userStory;
}

/**
 * Elimina una historia de usuario
 * @param id ID de la historia de usuario
 */
export async function deleteUserStory(id: string): Promise<void> {
  const response = await fetch(`/api/user-stories/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar la historia de usuario");
  }
}
