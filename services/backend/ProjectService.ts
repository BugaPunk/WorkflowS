import { getKv } from "@/utils/db.ts";
import {
  Project,
  ProjectData,
  ProjectStatus,
  ProjectMember,
  ProjectMemberData,
  ProjectRole,
  PROJECT_COLLECTIONS,
  createProject as createProjectModel,
  getProjectById as getProjectByIdModel,
  updateProject as updateProjectModel,
  deleteProject as deleteProjectModel,
  getAllProjects as getAllProjectsModel,
  getUserProjects as getUserProjectsModel,
  addProjectMember as addProjectMemberModel,
  getProjectMembers as getProjectMembersModel,
  removeProjectMember as removeProjectMemberModel,
  updateProjectMember as updateProjectMemberModel,
} from "@/models/project.ts";
import { getUserById, UserRole } from "@/models/user.ts";
import { getUserStoriesWithFilters } from "@/models/userStory.ts";

/**
 * Servicio para gestionar proyectos en el backend
 */
export class ProjectService {
  /**
   * Crea un nuevo proyecto
   * @param projectData Datos del proyecto
   * @returns Proyecto creado
   */
  static async createProject(projectData: ProjectData): Promise<Project> {
    return await createProjectModel(projectData);
  }

  /**
   * Obtiene un proyecto por su ID
   * @param id ID del proyecto
   * @returns Proyecto o null si no existe
   */
  static async getProjectById(id: string): Promise<Project | null> {
    return await getProjectByIdModel(id);
  }

  /**
   * Obtiene un proyecto por su ID con información relacionada
   * @param id ID del proyecto
   * @returns Proyecto con información relacionada o null si no existe
   */
  static async getProjectWithRelations(id: string): Promise<{
    project: Project;
    members: ProjectMember[];
    userStoriesCount: number;
    createdByUser: Awaited<ReturnType<typeof getUserById>>;
  } | null> {
    const project = await getProjectByIdModel(id);
    if (!project) {
      return null;
    }

    // Obtener miembros del proyecto
    const members = await getProjectMembersModel(id);

    // Obtener información del creador
    const createdByUser = await getUserById(project.createdBy);

    // Contar historias de usuario
    const userStories = await getUserStoriesWithFilters({ projectId: id });
    const userStoriesCount = userStories.length;

    return {
      project,
      members,
      userStoriesCount,
      createdByUser,
    };
  }

  /**
   * Actualiza un proyecto
   * @param id ID del proyecto
   * @param updateData Datos a actualizar
   * @returns Proyecto actualizado o null si no existe
   */
  static async updateProject(
    id: string,
    updateData: Partial<ProjectData>
  ): Promise<Project | null> {
    return await updateProjectModel(id, updateData);
  }

  /**
   * Elimina un proyecto
   * @param id ID del proyecto
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  static async deleteProject(id: string): Promise<boolean> {
    return await deleteProjectModel(id);
  }

  /**
   * Obtiene todos los proyectos
   * @returns Lista de proyectos
   */
  static async getAllProjects(): Promise<Project[]> {
    return await getAllProjectsModel();
  }

  /**
   * Obtiene todos los proyectos de un usuario
   * @param userId ID del usuario
   * @returns Lista de proyectos
   */
  static async getUserProjects(userId: string): Promise<Project[]> {
    return await getUserProjectsModel(userId);
  }

  /**
   * Añade un miembro a un proyecto
   * @param projectId ID del proyecto
   * @param userId ID del usuario
   * @param role Rol en el proyecto
   * @returns Miembro del proyecto creado
   */
  static async addProjectMember(
    projectId: string,
    userId: string,
    role: ProjectRole
  ): Promise<ProjectMember | null> {
    // Verificar que el proyecto existe
    const project = await getProjectByIdModel(projectId);
    if (!project) {
      return null;
    }

    // Verificar que el usuario existe
    const user = await getUserById(userId);
    if (!user) {
      return null;
    }

    // Verificar compatibilidad de roles
    if (
      (role === ProjectRole.PRODUCT_OWNER && user.role !== UserRole.PRODUCT_OWNER) ||
      (role === ProjectRole.SCRUM_MASTER && user.role !== UserRole.SCRUM_MASTER)
    ) {
      throw new Error(`El rol del usuario (${user.role}) no es compatible con el rol del proyecto (${role})`);
    }

    // Añadir miembro al proyecto
    return await addProjectMemberModel({
      projectId,
      userId,
      role,
    });
  }

  /**
   * Obtiene los miembros de un proyecto
   * @param projectId ID del proyecto
   * @returns Lista de miembros del proyecto
   */
  static async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return await getProjectMembersModel(projectId);
  }

  /**
   * Actualiza un miembro del proyecto
   * @param projectId ID del proyecto
   * @param userId ID del usuario
   * @param role Nuevo rol en el proyecto
   * @returns Miembro del proyecto actualizado o null si no existe
   */
  static async updateProjectMember(
    projectId: string,
    userId: string,
    role: ProjectRole
  ): Promise<ProjectMember | null> {
    // Verificar que el usuario existe
    const user = await getUserById(userId);
    if (!user) {
      return null;
    }

    // Verificar compatibilidad de roles
    if (
      (role === ProjectRole.PRODUCT_OWNER && user.role !== UserRole.PRODUCT_OWNER) ||
      (role === ProjectRole.SCRUM_MASTER && user.role !== UserRole.SCRUM_MASTER)
    ) {
      throw new Error(`El rol del usuario (${user.role}) no es compatible con el rol del proyecto (${role})`);
    }

    // Actualizar miembro del proyecto
    return await updateProjectMemberModel(projectId, userId, role);
  }

  /**
   * Elimina un miembro del proyecto
   * @param projectId ID del proyecto
   * @param userId ID del usuario
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  static async removeProjectMember(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    return await removeProjectMemberModel(projectId, userId);
  }

  /**
   * Obtiene proyectos con filtros avanzados
   * @param filters Filtros para los proyectos
   * @returns Lista de proyectos filtrados
   */
  static async getProjectsWithFilters(filters: {
    status?: ProjectStatus | ProjectStatus[];
    search?: string;
    memberId?: string;
    memberRole?: ProjectRole;
  } = {}): Promise<Project[]> {
    const kv = getKv();
    const projects: Project[] = [];

    // Listar todos los proyectos
    const projectsIterator = kv.list<Project>({ prefix: PROJECT_COLLECTIONS.PROJECTS });

    // Convertir arrays de filtros a conjuntos para búsqueda más eficiente
    const statusSet = filters.status
      ? new Set(Array.isArray(filters.status) ? filters.status : [filters.status])
      : null;

    // Si se filtra por miembro, primero obtenemos los proyectos del miembro
    let memberProjectIds: Set<string> | null = null;
    if (filters.memberId) {
      const memberProjectsIterator = kv.list<string>({
        prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", filters.memberId],
      });
      memberProjectIds = new Set();

      for await (const entry of memberProjectsIterator) {
        // El ID del proyecto está en la última posición de la clave
        const projectId = String(entry.key[entry.key.length - 1]);
        memberProjectIds.add(projectId);
      }
    }

    // Si se filtra por rol de miembro, primero obtenemos los proyectos con ese rol
    let roleProjectIds: Set<string> | null = null;
    if (filters.memberRole) {
      const membersIterator = kv.list<ProjectMember>({
        prefix: PROJECT_COLLECTIONS.PROJECT_MEMBERS,
      });
      roleProjectIds = new Set();

      for await (const entry of membersIterator) {
        const member = entry.value;
        if (member && member.role === filters.memberRole) {
          roleProjectIds.add(member.projectId);
        }
      }
    }

    // Filtrar proyectos
    for await (const entry of projectsIterator) {
      // Solo incluir entradas principales de proyectos
      if (entry.key.length === 2 && entry.key[0] === PROJECT_COLLECTIONS.PROJECTS[0]) {
        const project = entry.value;
        let include = true;

        // Filtrar por estado
        if (statusSet && !statusSet.has(project.status)) {
          include = false;
        }

        // Filtrar por miembro
        if (memberProjectIds && !memberProjectIds.has(project.id)) {
          include = false;
        }

        // Filtrar por rol de miembro
        if (roleProjectIds && !roleProjectIds.has(project.id)) {
          include = false;
        }

        // Filtrar por búsqueda de texto
        if (
          filters.search &&
          !project.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(
            project.description &&
            project.description.toLowerCase().includes(filters.search.toLowerCase())
          )
        ) {
          include = false;
        }

        if (include) {
          projects.push(project);
        }
      }
    }

    return projects;
  }
}
