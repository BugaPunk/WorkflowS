/// <reference lib="deno.unstable" />
import { z } from "zod";
import { getKv, Model, createModel } from "@/utils/db.ts";

// Actualizar las colecciones para incluir proyectos
export const PROJECT_COLLECTIONS = {
  PROJECTS: ["projects"],
  PROJECT_MEMBERS: ["project_members"],
} as const;

// Definir el estado del proyecto
export enum ProjectStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

// Definir el esquema del proyecto con Zod para validación
export const ProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  startDate: z.number().optional(), // timestamp
  endDate: z.number().optional(), // timestamp
  createdBy: z.string(), // userId del creador
});

// Definir el tipo de datos del proyecto
export type ProjectData = z.infer<typeof ProjectSchema>;

// Definir el modelo del proyecto
export interface Project extends Model, ProjectData {
  members: ProjectMember[];
}

// Definir el rol en el proyecto
export enum ProjectRole {
  PRODUCT_OWNER = "product_owner",
  SCRUM_MASTER = "scrum_master",
  TEAM_MEMBER = "team_member"
}

// Definir el esquema de miembro del proyecto
export const ProjectMemberSchema = z.object({
  userId: z.string(),
  projectId: z.string(),
  role: z.nativeEnum(ProjectRole),
});

// Definir el tipo de datos de miembro del proyecto
export type ProjectMemberData = z.infer<typeof ProjectMemberSchema>;

// Definir el modelo de miembro del proyecto
export interface ProjectMember extends Model, ProjectMemberData {
  username?: string;
  email?: string;
}

// Crear un nuevo proyecto
export async function createProject(projectData: ProjectData): Promise<Project> {
  // Crear el modelo del proyecto
  const project = createModel<Omit<Project, keyof Model | "members">>({
    name: projectData.name,
    description: projectData.description,
    status: projectData.status || ProjectStatus.PLANNING,
    startDate: projectData.startDate,
    endDate: projectData.endDate,
    createdBy: projectData.createdBy,
  });

  // Guardar el proyecto en la base de datos
  const kv = getKv();
  const key = [...PROJECT_COLLECTIONS.PROJECTS, project.id];
  await kv.set(key, { ...project, members: [] });

  return { ...project, members: [] };
}

// Obtener un proyecto por ID
export async function getProjectById(id: string): Promise<Project | null> {
  const kv = getKv();
  const key = [...PROJECT_COLLECTIONS.PROJECTS, id];
  const result = await kv.get<Project>(key);
  return result.value;
}

// Obtener todos los proyectos
export async function getAllProjects(): Promise<Project[]> {
  const kv = getKv();
  const projects: Project[] = [];

  // Listar todos los proyectos
  const projectsIterator = kv.list<Project>({ prefix: PROJECT_COLLECTIONS.PROJECTS });

  for await (const entry of projectsIterator) {
    // Solo incluir entradas principales de proyectos
    if (entry.key.length === 2 && entry.key[0] === PROJECT_COLLECTIONS.PROJECTS[0]) {
      projects.push(entry.value);
    }
  }

  return projects;
}

// Obtener proyectos por creador
export async function getProjectsByCreator(userId: string): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter(project => project.createdBy === userId);
}

// Agregar un miembro al proyecto
export async function addProjectMember(memberData: ProjectMemberData): Promise<ProjectMember> {
  // Crear el modelo de miembro del proyecto
  const member = createModel<Omit<ProjectMember, keyof Model | "username" | "email">>({
    userId: memberData.userId,
    projectId: memberData.projectId,
    role: memberData.role,
  });

  // Guardar el miembro en la base de datos
  const kv = getKv();
  const memberKey = [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, member.id];
  await kv.set(memberKey, member);

  // Crear índices para búsqueda rápida
  await kv.set([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", memberData.userId, memberData.projectId], member.id);
  await kv.set([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", memberData.projectId, memberData.userId], member.id);

  // Actualizar la lista de miembros del proyecto
  const project = await getProjectById(memberData.projectId);
  if (project) {
    const updatedProject = {
      ...project,
      members: [...project.members, member],
    };

    const projectKey = [...PROJECT_COLLECTIONS.PROJECTS, project.id];
    await kv.set(projectKey, updatedProject);
  }

  return member;
}

// Obtener miembros de un proyecto
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const kv = getKv();
  const members: ProjectMember[] = [];

  // Listar todos los miembros del proyecto
  const membersIterator = kv.list<string>({
    prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", projectId]
  });

  for await (const entry of membersIterator) {
    const memberId = entry.value;
    const memberKey = [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, memberId];
    const memberResult = await kv.get<ProjectMember>(memberKey);

    if (memberResult.value) {
      members.push(memberResult.value);
    }
  }

  return members;
}

// Obtener proyectos de un usuario
export async function getUserProjects(userId: string): Promise<Project[]> {
  const kv = getKv();
  const projects: Project[] = [];

  // Listar todos los proyectos del usuario
  const projectsIterator = kv.list<string>({
    prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", userId]
  });

  for await (const entry of projectsIterator) {
    const projectId = String(entry.key[entry.key.length - 2]); // El ID del proyecto está en la penúltima posición
    const project = await getProjectById(projectId);

    if (project) {
      projects.push(project);
    }
  }

  return projects;
}

// Actualizar el estado de un proyecto
export async function updateProjectStatus(projectId: string, status: ProjectStatus): Promise<Project | null> {
  const project = await getProjectById(projectId);

  if (!project) {
    return null;
  }

  const updatedProject = {
    ...project,
    status,
    updatedAt: new Date().getTime(),
  };

  const kv = getKv();
  const key = [...PROJECT_COLLECTIONS.PROJECTS, projectId];
  await kv.set(key, updatedProject);

  return updatedProject;
}

// Eliminar un proyecto
export async function deleteProject(projectId: string): Promise<boolean> {
  const kv = getKv();

  // Eliminar el proyecto
  const projectKey = [...PROJECT_COLLECTIONS.PROJECTS, projectId];
  await kv.delete(projectKey);

  // Eliminar todos los miembros del proyecto
  const membersIterator = kv.list({
    prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", projectId]
  });

  for await (const entry of membersIterator) {
    // Eliminar el índice by_project
    await kv.delete(entry.key);

    // Eliminar el índice by_user
    const userId = entry.key[entry.key.length - 1];
    await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", userId, projectId]);

    // Eliminar el miembro
    const memberId = String(entry.value);
    await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, memberId]);
  }

  return true;
}
