import { useState, useEffect } from "preact/hooks";
import { Project } from "../models/project.ts";

export function useProjects(initialProjects: Project[] = []) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los proyectos desde el servidor
  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Error al cargar los proyectos");
      }

      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError("Error al cargar los proyectos. Por favor, intenta de nuevo.");
      console.error("Error cargando proyectos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    isLoading,
    error,
    loadProjects,
    setProjects,
  };
}
