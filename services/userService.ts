import type { User } from "../models/user.ts";

/**
 * Obtiene un usuario por su ID
 * @param id ID del usuario
 * @returns Usuario
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener el usuario");
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}
