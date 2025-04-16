import { getKv } from "@/utils/db.ts";
import {
  UserStory,
  UserStoryData,
  CreateUserStoryData,
  UpdateUserStoryData,
  UserStoryPriority,
  UserStoryStatus,
  USER_STORY_COLLECTIONS,
  createUserStory as createUserStoryModel,
  getUserStoryById as getUserStoryByIdModel,
  updateUserStory as updateUserStoryModel,
  deleteUserStory as deleteUserStoryModel,
  getProjectUserStories as getProjectUserStoriesModel,
  getUserStoriesWithFilters as getUserStoriesWithFiltersModel,
} from "@/models/userStory.ts";
import { getProjectById } from "@/models/project.ts";
import { getUserById } from "@/models/user.ts";
import { getUserStoryTasks } from "@/models/task.ts";
import { getSprintById } from "@/models/sprint.ts";

/**
 * Servicio para gestionar historias de usuario en el backend
 */
export class UserStoryService {
  /**
   * Crea una nueva historia de usuario
   * @param userStoryData Datos de la historia de usuario
   * @param createdBy ID del usuario que crea la historia
   * @returns Historia de usuario creada
   */
  static async createUserStory(
    userStoryData: CreateUserStoryData,
    createdBy: string
  ): Promise<UserStory> {
    // Verificar que el proyecto existe
    const project = await getProjectById(userStoryData.projectId);
    if (!project) {
      throw new Error("Proyecto no encontrado");
    }

    // Crear la historia de usuario
    return await createUserStoryModel(userStoryData, createdBy);
  }

  /**
   * Obtiene una historia de usuario por su ID
   * @param id ID de la historia de usuario
   * @returns Historia de usuario o null si no existe
   */
  static async getUserStoryById(id: string): Promise<UserStory | null> {
    return await getUserStoryByIdModel(id);
  }

  /**
   * Obtiene una historia de usuario por su ID con información relacionada
   * @param id ID de la historia de usuario
   * @returns Historia de usuario con información relacionada o null si no existe
   */
  static async getUserStoryWithRelations(id: string): Promise<{
    userStory: UserStory;
    project: Awaited<ReturnType<typeof getProjectById>>;
    assignedUser: Awaited<ReturnType<typeof getUserById>>;
    createdByUser: Awaited<ReturnType<typeof getUserById>>;
    tasks: Awaited<ReturnType<typeof getUserStoryTasks>>;
    sprint: Awaited<ReturnType<typeof getSprintById>>;
  } | null> {
    const userStory = await getUserStoryByIdModel(id);
    if (!userStory) {
      return null;
    }

    // Obtener el proyecto relacionado
    const project = await getProjectById(userStory.projectId);
    if (!project) {
      return null;
    }

    // Obtener información del usuario asignado
    let assignedUser = null;
    if (userStory.assignedTo) {
      assignedUser = await getUserById(userStory.assignedTo);
    }

    // Obtener información del creador
    const createdByUser = await getUserById(userStory.createdBy);

    // Obtener tareas
    const tasks = await getUserStoryTasks(id);

    // Obtener sprint
    let sprint = null;
    if (userStory.sprintId) {
      sprint = await getSprintById(userStory.sprintId);
    }

    return {
      userStory,
      project,
      assignedUser,
      createdByUser,
      tasks,
      sprint,
    };
  }

  /**
   * Actualiza una historia de usuario
   * @param id ID de la historia de usuario
   * @param updateData Datos a actualizar
   * @returns Historia de usuario actualizada o null si no existe
   */
  static async updateUserStory(
    id: string,
    updateData: UpdateUserStoryData
  ): Promise<UserStory | null> {
    return await updateUserStoryModel(id, updateData);
  }

  /**
   * Elimina una historia de usuario
   * @param id ID de la historia de usuario
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  static async deleteUserStory(id: string): Promise<boolean> {
    return await deleteUserStoryModel(id);
  }

  /**
   * Obtiene todas las historias de usuario de un proyecto
   * @param projectId ID del proyecto
   * @returns Lista de historias de usuario
   */
  static async getProjectUserStories(projectId: string): Promise<UserStory[]> {
    return await getProjectUserStoriesModel(projectId);
  }

  /**
   * Obtiene historias de usuario con filtros
   * @param filters Filtros para las historias de usuario
   * @returns Lista de historias de usuario filtradas
   */
  static async getUserStoriesWithFilters(filters: {
    projectId?: string;
    status?: UserStoryStatus | UserStoryStatus[];
    sprintId?: string;
    priority?: UserStoryPriority | UserStoryPriority[];
    search?: string;
    assignedTo?: string;
  } = {}): Promise<UserStory[]> {
    return await getUserStoriesWithFiltersModel(filters);
  }

  /**
   * Asigna una historia de usuario a un sprint
   * @param userStoryId ID de la historia de usuario
   * @param sprintId ID del sprint
   * @returns Historia de usuario actualizada o null si no existe
   */
  static async assignUserStoryToSprint(
    userStoryId: string,
    sprintId: string
  ): Promise<UserStory | null> {
    // Verificar que la historia de usuario existe
    const userStory = await getUserStoryByIdModel(userStoryId);
    if (!userStory) {
      return null;
    }

    // Verificar que el sprint existe
    const sprint = await getSprintById(sprintId);
    if (!sprint) {
      throw new Error("Sprint no encontrado");
    }

    // Verificar que el sprint pertenece al mismo proyecto que la historia de usuario
    if (sprint.projectId !== userStory.projectId) {
      throw new Error("El sprint no pertenece al mismo proyecto que la historia de usuario");
    }

    // Actualizar la historia de usuario
    return await updateUserStoryModel(userStoryId, {
      sprintId,
      status: UserStoryStatus.PLANNED,
    });
  }

  /**
   * Elimina una historia de usuario de un sprint
   * @param userStoryId ID de la historia de usuario
   * @returns Historia de usuario actualizada o null si no existe
   */
  static async removeUserStoryFromSprint(
    userStoryId: string
  ): Promise<UserStory | null> {
    // Verificar que la historia de usuario existe
    const userStory = await getUserStoryByIdModel(userStoryId);
    if (!userStory) {
      return null;
    }

    // Actualizar la historia de usuario
    return await updateUserStoryModel(userStoryId, {
      sprintId: undefined,
      status: UserStoryStatus.BACKLOG,
    });
  }

  /**
   * Asigna una historia de usuario a un usuario
   * @param userStoryId ID de la historia de usuario
   * @param userId ID del usuario
   * @returns Historia de usuario actualizada o null si no existe
   */
  static async assignUserStoryToUser(
    userStoryId: string,
    userId: string
  ): Promise<UserStory | null> {
    // Verificar que la historia de usuario existe
    const userStory = await getUserStoryByIdModel(userStoryId);
    if (!userStory) {
      return null;
    }

    // Verificar que el usuario existe
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Actualizar la historia de usuario
    return await updateUserStoryModel(userStoryId, {
      assignedTo: userId,
    });
  }
}
