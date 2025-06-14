import { UserRole, getUserById, updateUserRole } from "@/models/user.ts";
import { type Model, createModel, getKv } from "@/utils/db.ts";
import { getUserStoriesWithFilters, deleteUserStory } from "@/models/userStory.ts";
import { getUserStoryTasks, deleteTask } from "@/models/task.ts";
import { getProjectSprints, deleteSprint } from "@/models/sprint.ts";
/// <reference lib="deno.unstable" />
import { z } from "zod";

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
  CANCELLED = "cancelled",
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
  TEAM_MEMBER = "team_member",
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
  return projects.filter((project) => project.createdBy === userId);
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
  await kv.set(
    [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", memberData.userId, memberData.projectId],
    member.id
  );
  await kv.set(
    [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", memberData.projectId, memberData.userId],
    member.id
  );

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

  // Actualizar el rol del usuario en el sistema según su rol en el proyecto
  const user = await getUserById(memberData.userId);
  if (user) {
    let newUserRole = user.role; // Mantener el rol actual por defecto

    // Asignar el rol correspondiente según el rol en el proyecto
    if (memberData.role === ProjectRole.SCRUM_MASTER && user.role !== UserRole.ADMIN) {
      newUserRole = UserRole.SCRUM_MASTER;
    } else if (memberData.role === ProjectRole.PRODUCT_OWNER && user.role !== UserRole.ADMIN) {
      newUserRole = UserRole.PRODUCT_OWNER;
    }

    // Actualizar el rol del usuario si es diferente al actual
    if (newUserRole !== user.role) {
      await updateUserRole(user.id, newUserRole);
    }
  }

  return member;
}

// Obtener miembros de un proyecto
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const kv = getKv();
  const members: ProjectMember[] = [];

  // Listar todos los miembros del proyecto
  const membersIterator = kv.list<string>({
    prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", projectId],
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
    prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", userId],
  });

  for await (const entry of projectsIterator) {
    // El ID del proyecto está en la penúltima posición de la clave
    const projectId = String(entry.key[entry.key.length - 1]);

    // Obtener el proyecto
    const project = await getProjectById(projectId);

    if (project) {
      projects.push(project);
    }
  }

  return projects;
}

// Actualizar el estado de un proyecto
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<Project | null> {
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

  try {
    // 1. Obtener todas las historias de usuario del proyecto
    const userStories = await getUserStoriesWithFilters({ projectId });

    // 2. Obtener todos los sprints del proyecto
    const sprints = await getProjectSprints(projectId);

    // 3. Para cada historia de usuario, eliminar sus tareas asociadas
    for (const userStory of userStories) {
      // Obtener todas las tareas de la historia de usuario
      const tasks = await getUserStoryTasks(userStory.id);

      // Eliminar cada tarea
      for (const task of tasks) {
        await deleteTask(task.id);
      }

      // Eliminar la historia de usuario
      await deleteUserStory(userStory.id);
    }

    // 4. Eliminar todos los sprints del proyecto
    for (const sprint of sprints) {
      await deleteSprint(sprint.id);
    }

    // 5. Eliminar todos los miembros del proyecto y actualizar sus roles si es necesario
    const membersIterator = kv.list({
      prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", projectId],
    });

    // Recopilar todos los miembros para procesar sus roles después
    const memberData: { userId: string; role: ProjectRole; memberId: string }[] = [];

    for await (const entry of membersIterator) {
      // Obtener el ID del usuario
      const userId = String(entry.key[entry.key.length - 1]);

      // Obtener el miembro para conocer su rol
      const memberId = String(entry.value);
      const memberKey = [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, memberId];
      const memberEntry = await kv.get<ProjectMember>(memberKey);

      if (memberEntry.value) {
        memberData.push({
          userId,
          role: memberEntry.value.role,
          memberId,
        });
      }

      // Eliminar el índice by_project
      await kv.delete(entry.key);

      // Eliminar el índice by_user
      await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", userId, projectId]);

      // Eliminar el miembro
      await kv.delete(memberKey);
    }

    // Actualizar los roles de los usuarios si es necesario
    for (const member of memberData) {
      // Solo procesar usuarios con roles especiales
      if (member.role === ProjectRole.SCRUM_MASTER || member.role === ProjectRole.PRODUCT_OWNER) {
        const user = await getUserById(member.userId);
        if (!user) continue;

        // Verificar si el usuario tiene el mismo rol en otros proyectos
        const otherProjects = await getUserProjects(member.userId);
        const hasRoleInOtherProjects = otherProjects.some((p) => {
          // Ignorar el proyecto que estamos eliminando
          if (p.id === projectId) return false;

          // Buscar si el usuario tiene el mismo rol en otro proyecto
          const memberWithRole = p.members.find(
            (m) => m.userId === member.userId && m.role === member.role
          );
          return !!memberWithRole;
        });

        // Si el usuario no tiene el mismo rol en otros proyectos, cambiar a Team Developer
        if (!hasRoleInOtherProjects && user.role !== UserRole.ADMIN) {
          await updateUserRole(member.userId, UserRole.TEAM_DEVELOPER);
        }
      }
    }

    // 6. Finalmente, eliminar el proyecto
    const projectKey = [...PROJECT_COLLECTIONS.PROJECTS, projectId];
    await kv.delete(projectKey);

    return true;
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    return false;
  }
}

// Actualizar un miembro del proyecto
export async function updateProjectMember(
  projectId: string,
  userId: string,
  role: ProjectRole
): Promise<ProjectMember | null> {
  const kv = getKv();

  // Buscar el ID del miembro
  const memberIdEntry = await kv.get<string>([
    ...PROJECT_COLLECTIONS.PROJECT_MEMBERS,
    "by_project",
    projectId,
    userId,
  ]);

  if (!memberIdEntry.value) {
    return null;
  }

  const memberId = memberIdEntry.value;
  const memberKey = [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, memberId];
  const memberEntry = await kv.get<ProjectMember>(memberKey);

  if (!memberEntry.value) {
    return null;
  }

  // Actualizar el rol del miembro
  const updatedMember = {
    ...memberEntry.value,
    role,
    updatedAt: new Date().getTime(),
  };

  await kv.set(memberKey, updatedMember);

  // Actualizar el rol del usuario en el sistema según su rol en el proyecto
  const user = await getUserById(userId);
  if (user) {
    let newUserRole = user.role; // Mantener el rol actual por defecto

    // Asignar el rol correspondiente según el rol en el proyecto
    if (role === ProjectRole.SCRUM_MASTER && user.role !== UserRole.ADMIN) {
      newUserRole = UserRole.SCRUM_MASTER;
    } else if (role === ProjectRole.PRODUCT_OWNER && user.role !== UserRole.ADMIN) {
      newUserRole = UserRole.PRODUCT_OWNER;
    }

    // Actualizar el rol del usuario si es diferente al actual
    if (newUserRole !== user.role) {
      await updateUserRole(user.id, newUserRole);
    }
  }

  return updatedMember;
}

// Eliminar un miembro del proyecto
export async function removeProjectMember(projectId: string, userId: string): Promise<boolean> {
  const kv = getKv();

  // Buscar el ID del miembro
  const memberIdEntry = await kv.get<string>([
    ...PROJECT_COLLECTIONS.PROJECT_MEMBERS,
    "by_project",
    projectId,
    userId,
  ]);

  if (!memberIdEntry.value) {
    return false;
  }

  const memberId = memberIdEntry.value;

  // Eliminar el miembro
  await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, memberId]);

  // Eliminar los índices
  await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", projectId, userId]);
  await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", userId, projectId]);

  // Actualizar la lista de miembros del proyecto
  const project = await getProjectById(projectId);
  if (project) {
    const updatedProject = {
      ...project,
      members: project.members.filter((member) => member.userId !== userId),
    };

    const projectKey = [...PROJECT_COLLECTIONS.PROJECTS, project.id];
    await kv.set(projectKey, updatedProject);
  }

  return true;
}

// Actualizar un proyecto
export async function updateProject(
  id: string,
  updateData: Partial<ProjectData>
): Promise<Project | null> {
  const project = await getProjectById(id);

  if (!project) {
    return null;
  }

  const updatedProject = {
    ...project,
    ...updateData,
    updatedAt: new Date().getTime(),
  };

  const kv = getKv();
  const key = [...PROJECT_COLLECTIONS.PROJECTS, id];
  await kv.set(key, updatedProject);

  return updatedProject;
}
