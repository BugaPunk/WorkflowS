import { UserRole } from "../models/user.ts";
import { ProjectRole } from "../models/project.ts";
import type { Session } from "./session.ts";

/**
 * Verifica si un usuario tiene un rol específico
 * @param session Sesión del usuario
 * @param roles Roles permitidos
 * @returns true si el usuario tiene alguno de los roles especificados
 */
export function hasRole(session: Session, roles: UserRole | UserRole[]): boolean {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(session.role);
}

/**
 * Verifica si un usuario es administrador
 * @param session Sesión del usuario
 * @returns true si el usuario es administrador
 */
export function isAdmin(session: Session): boolean {
  return session.role === UserRole.ADMIN;
}

/**
 * Verifica si un usuario es Scrum Master
 * @param session Sesión del usuario
 * @returns true si el usuario es Scrum Master
 */
export function isScrumMaster(session: Session): boolean {
  return session.role === UserRole.SCRUM_MASTER;
}

/**
 * Verifica si un usuario es Product Owner
 * @param session Sesión del usuario
 * @returns true si el usuario es Product Owner
 */
export function isProductOwner(session: Session): boolean {
  return session.role === UserRole.PRODUCT_OWNER;
}

/**
 * Verifica si un usuario es Team Developer
 * @param session Sesión del usuario
 * @returns true si el usuario es Team Developer
 */
export function isTeamDeveloper(session: Session): boolean {
  return session.role === UserRole.TEAM_DEVELOPER;
}

/**
 * Verifica si un usuario puede gestionar proyectos
 * @param session Sesión del usuario
 * @returns true si el usuario puede gestionar proyectos
 */
export function canManageProjects(session: Session): boolean {
  return isAdmin(session);
}

/**
 * Verifica si un usuario puede gestionar usuarios
 * @param session Sesión del usuario
 * @returns true si el usuario puede gestionar usuarios
 */
export function canManageUsers(session: Session): boolean {
  return isAdmin(session);
}

/**
 * Verifica si un usuario puede gestionar sprints
 * @param session Sesión del usuario
 * @returns true si el usuario puede gestionar sprints
 */
export function canManageSprints(session: Session): boolean {
  return isAdmin(session) || isScrumMaster(session);
}

/**
 * Verifica si un usuario puede gestionar historias de usuario
 * @param session Sesión del usuario
 * @returns true si el usuario puede gestionar historias de usuario
 */
export function canManageUserStories(session: Session): boolean {
  return isAdmin(session) || isProductOwner(session);
}

/**
 * Verifica si un usuario puede gestionar tareas
 * @param session Sesión del usuario
 * @returns true si el usuario puede gestionar tareas
 */
export function canManageTasks(session: Session): boolean {
  return isAdmin(session) || isScrumMaster(session) || isProductOwner(session) || isTeamDeveloper(session);
}

/**
 * Verifica si un usuario puede ver el backlog
 * @param session Sesión del usuario
 * @returns true si el usuario puede ver el backlog
 */
export function canViewBacklog(session: Session): boolean {
  return isAdmin(session) || isProductOwner(session) || isScrumMaster(session);
}

/**
 * Verifica si un usuario puede actualizar una tarea específica
 * @param session Sesión del usuario
 * @param task Tarea a actualizar
 * @returns true si el usuario puede actualizar la tarea
 */
export function canUpdateTask(session: Session, task: { assignedTo?: string; createdBy: string }): boolean {
  const isAssignedToUser = task.assignedTo === session.userId;
  const isCreator = task.createdBy === session.userId;

  return isAdmin(session) || isScrumMaster(session) || isAssignedToUser || isCreator;
}

/**
 * Verifica si un usuario puede eliminar una tarea específica
 * @param session Sesión del usuario
 * @param task Tarea a eliminar
 * @returns true si el usuario puede eliminar la tarea
 */
export function canDeleteTask(session: Session, task: { createdBy: string }): boolean {
  const isCreator = task.createdBy === session.userId;

  return isAdmin(session) || isScrumMaster(session) || isCreator;
}

/**
 * Verifica si un usuario es miembro de un proyecto con un rol específico
 * @param session Sesión del usuario
 * @param project Proyecto a verificar
 * @param role Rol en el proyecto (opcional)
 * @returns true si el usuario es miembro del proyecto con el rol especificado
 */
export function isProjectMember(
  session: Session,
  project: { members: Array<{ userId: string; role?: string }> },
  role?: ProjectRole
): boolean {
  if (!role) {
    return project.members.some(member => member.userId === session.userId);
  }

  return project.members.some(
    member => member.userId === session.userId && member.role === role
  );
}

/**
 * Verifica si un usuario puede ver un proyecto específico
 * @param session Sesión del usuario
 * @param project Proyecto a verificar
 * @returns true si el usuario puede ver el proyecto
 */
export function canViewProject(
  session: Session,
  project: { members: Array<{ userId: string; role?: string }> }
): boolean {
  return isAdmin(session) || isProjectMember(session, project);
}
