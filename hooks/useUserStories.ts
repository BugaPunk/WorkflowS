import { useState, useEffect, useCallback } from "preact/hooks";
import type { UserStory } from "../models/userStory.ts";

interface UseUserStoriesOptions {
  projectId?: string;
  status?: string;
  initialUserStories?: UserStory[];
}

/**
 * Hook personalizado para gestionar historias de usuario
 * @param options Opciones para el hook
 * @returns Un objeto con las historias de usuario, estado de carga, error y funciones para gestionar las historias
 */
export function useUserStories({
  projectId,
  status,
  initialUserStories = [],
}: UseUserStoriesOptions = {}) {
  const [userStories, setUserStories] = useState<UserStory[]>(initialUserStories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar historias de usuario
  const loadUserStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Construir la URL con los parámetros de filtro
      let url = "/api/user-stories";
      const params = new URLSearchParams();

      if (projectId) {
        params.append("projectId", projectId);
      }

      if (status) {
        params.append("status", status);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al cargar las historias de usuario");
      }

      const data = await response.json();
      setUserStories(data.userStories);
    } catch (err) {
      setError("Error al cargar las historias de usuario. Por favor, intenta de nuevo.");
      console.error("Error cargando historias de usuario:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, status]);

  // Función para crear una historia de usuario
  const createUserStory = useCallback(async (userStoryData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userStoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la historia de usuario");
      }

      // Recargar las historias de usuario
      await loadUserStories();
      return true;
    } catch (err) {
      setError("Error al crear la historia de usuario. Por favor, intenta de nuevo.");
      console.error("Error creando historia de usuario:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserStories]);

  // Función para actualizar una historia de usuario
  const updateUserStory = useCallback(async (id: string, userStoryData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-stories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userStoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar la historia de usuario");
      }

      // Recargar las historias de usuario
      await loadUserStories();
      return true;
    } catch (err) {
      setError("Error al actualizar la historia de usuario. Por favor, intenta de nuevo.");
      console.error("Error actualizando historia de usuario:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserStories]);

  // Función para eliminar una historia de usuario
  const deleteUserStory = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-stories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la historia de usuario");
      }

      // Recargar las historias de usuario
      await loadUserStories();
      return true;
    } catch (err) {
      setError("Error al eliminar la historia de usuario. Por favor, intenta de nuevo.");
      console.error("Error eliminando historia de usuario:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserStories]);

  // Cargar historias de usuario al montar el componente o cuando cambian los filtros
  useEffect(() => {
    loadUserStories();
  }, [loadUserStories]);

  return {
    userStories,
    isLoading,
    error,
    loadUserStories,
    createUserStory,
    updateUserStory,
    deleteUserStory,
    setUserStories,
  };
}
