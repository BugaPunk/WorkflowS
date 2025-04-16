import type { Project, ProjectMember } from "../models/project.ts";

/**
 * Obtiene un proyecto por su ID
 * @param id ID del proyecto
 * @returns Proyecto
 */
export async function getProjectById(id: string): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener el proyecto");
  }
  
  const data = await response.json();
  return data.project;
}

/**
 * Obtiene los miembros de un proyecto
 * @param projectId ID del proyecto
 * @returns Lista de miembros del proyecto
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const response = await fetch(`/api/projects/${projectId}/members`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener los miembros del proyecto");
  }
  
  const data = await response.json();
  return data.members;
}
