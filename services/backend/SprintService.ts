import { getKv } from "@/utils/db.ts";
import {
  Sprint,
  SprintData,
  SprintStatus,
  SPRINT_COLLECTIONS,
  createSprint as createSprintModel,
  getSprintById as getSprintByIdModel,
  updateSprint as updateSprintModel,
  deleteSprint as deleteSprintModel,
  getProjectSprints as getProjectSprintsModel,
  addUserStoryToSprint as addUserStoryToSprintModel,
  removeUserStoryFromSprint as removeUserStoryFromSprintModel,
} from "@/models/sprint.ts";
import { getProjectById } from "@/models/project.ts";
import { getUserById } from "@/models/user.ts";
import { getUserStoryById, updateUserStory, UserStoryStatus } from "@/models/userStory.ts";

/**
 * Servicio para gestionar sprints en el backend
 */
export class SprintService {
  /**
   * Crea un nuevo sprint
   * @param sprintData Datos del sprint
   * @returns Sprint creado
   */
  static async createSprint(sprintData: SprintData): Promise<Sprint> {
    // Verificar que el proyecto existe
    const project = await getProjectById(sprintData.projectId);
    if (!project) {
      throw new Error("Proyecto no encontrado");
    }

    // Crear el sprint
    return await createSprintModel(sprintData);
  }

  /**
   * Obtiene un sprint por su ID
   * @param id ID del sprint
   * @returns Sprint o null si no existe
   */
  static async getSprintById(id: string): Promise<Sprint | null> {
    return await getSprintByIdModel(id);
  }

  /**
   * Obtiene un sprint por su ID con información relacionada
   * @param id ID del sprint
   * @returns Sprint con información relacionada o null si no existe
   */
  static async getSprintWithRelations(id: string): Promise<{
    sprint: Sprint;
    project: Awaited<ReturnType<typeof getProjectById>>;
    createdByUser: Awaited<ReturnType<typeof getUserById>>;
    userStories: Awaited<ReturnType<typeof getUserStoryById>>[];
  } | null> {
    const sprint = await getSprintByIdModel(id);
    if (!sprint) {
      return null;
    }

    // Obtener el proyecto relacionado
    const project = await getProjectById(sprint.projectId);
    if (!project) {
      return null;
    }

    // Obtener información del creador
    const createdByUser = await getUserById(sprint.createdBy);

    // Obtener historias de usuario
    const userStories = [];
    for (const userStoryId of sprint.userStoryIds) {
      const userStory = await getUserStoryById(userStoryId);
      if (userStory) {
        userStories.push(userStory);
      }
    }

    return {
      sprint,
      project,
      createdByUser,
      userStories,
    };
  }

  /**
   * Actualiza un sprint
   * @param id ID del sprint
   * @param updateData Datos a actualizar
   * @returns Sprint actualizado o null si no existe
   */
  static async updateSprint(
    id: string,
    updateData: Partial<SprintData>
  ): Promise<Sprint | null> {
    return await updateSprintModel(id, updateData);
  }

  /**
   * Elimina un sprint
   * @param id ID del sprint
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  static async deleteSprint(id: string): Promise<boolean> {
    // Obtener el sprint
    const sprint = await getSprintByIdModel(id);
    if (!sprint) {
      return false;
    }

    // Actualizar las historias de usuario para quitarlas del sprint
    for (const userStoryId of sprint.userStoryIds) {
      await updateUserStory(userStoryId, {
        sprintId: undefined,
        status: UserStoryStatus.BACKLOG,
      });
    }

    // Eliminar el sprint
    return await deleteSprintModel(id);
  }

  /**
   * Obtiene todos los sprints de un proyecto
   * @param projectId ID del proyecto
   * @returns Lista de sprints
   */
  static async getProjectSprints(projectId: string): Promise<Sprint[]> {
    return await getProjectSprintsModel(projectId);
  }

  /**
   * Añade una historia de usuario a un sprint
   * @param sprintId ID del sprint
   * @param userStoryId ID de la historia de usuario
   * @returns Sprint actualizado o null si no existe
   */
  static async addUserStoryToSprint(
    sprintId: string,
    userStoryId: string
  ): Promise<Sprint | null> {
    // Verificar que la historia de usuario existe
    const userStory = await getUserStoryById(userStoryId);
    if (!userStory) {
      throw new Error("Historia de usuario no encontrada");
    }

    // Verificar que el sprint existe
    const sprint = await getSprintByIdModel(sprintId);
    if (!sprint) {
      return null;
    }

    // Verificar que el sprint pertenece al mismo proyecto que la historia de usuario
    if (sprint.projectId !== userStory.projectId) {
      throw new Error("El sprint no pertenece al mismo proyecto que la historia de usuario");
    }

    // Actualizar la historia de usuario
    await updateUserStory(userStoryId, {
      sprintId,
      status: UserStoryStatus.PLANNED,
    });

    // Añadir la historia de usuario al sprint
    return await addUserStoryToSprintModel(sprintId, userStoryId);
  }

  /**
   * Elimina una historia de usuario de un sprint
   * @param sprintId ID del sprint
   * @param userStoryId ID de la historia de usuario
   * @returns Sprint actualizado o null si no existe
   */
  static async removeUserStoryFromSprint(
    sprintId: string,
    userStoryId: string
  ): Promise<Sprint | null> {
    // Verificar que la historia de usuario existe
    const userStory = await getUserStoryById(userStoryId);
    if (!userStory) {
      throw new Error("Historia de usuario no encontrada");
    }

    // Verificar que el sprint existe
    const sprint = await getSprintByIdModel(sprintId);
    if (!sprint) {
      return null;
    }

    // Actualizar la historia de usuario
    await updateUserStory(userStoryId, {
      sprintId: undefined,
      status: UserStoryStatus.BACKLOG,
    });

    // Eliminar la historia de usuario del sprint
    return await removeUserStoryFromSprintModel(sprintId, userStoryId);
  }

  /**
   * Inicia un sprint
   * @param id ID del sprint
   * @returns Sprint actualizado o null si no existe
   */
  static async startSprint(id: string): Promise<Sprint | null> {
    // Verificar que el sprint existe
    const sprint = await getSprintByIdModel(id);
    if (!sprint) {
      return null;
    }

    // Verificar que el sprint no está ya activo o completado
    if (sprint.status === SprintStatus.ACTIVE || sprint.status === SprintStatus.COMPLETED) {
      throw new Error(`El sprint ya está ${sprint.status}`);
    }

    // Actualizar el sprint
    return await updateSprintModel(id, {
      status: SprintStatus.ACTIVE,
      startDate: Date.now(),
    });
  }

  /**
   * Completa un sprint
   * @param id ID del sprint
   * @returns Sprint actualizado o null si no existe
   */
  static async completeSprint(id: string): Promise<Sprint | null> {
    // Verificar que el sprint existe
    const sprint = await getSprintByIdModel(id);
    if (!sprint) {
      return null;
    }

    // Verificar que el sprint está activo
    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new Error("El sprint no está activo");
    }

    // Actualizar el sprint
    return await updateSprintModel(id, {
      status: SprintStatus.COMPLETED,
      endDate: Date.now(),
    });
  }

  /**
   * Cancela un sprint
   * @param id ID del sprint
   * @returns Sprint actualizado o null si no existe
   */
  static async cancelSprint(id: string): Promise<Sprint | null> {
    // Verificar que el sprint existe
    const sprint = await getSprintByIdModel(id);
    if (!sprint) {
      return null;
    }

    // Verificar que el sprint no está completado
    if (sprint.status === SprintStatus.COMPLETED) {
      throw new Error("No se puede cancelar un sprint completado");
    }

    // Actualizar las historias de usuario para quitarlas del sprint
    for (const userStoryId of sprint.userStoryIds) {
      await updateUserStory(userStoryId, {
        sprintId: undefined,
        status: UserStoryStatus.BACKLOG,
      });
    }

    // Actualizar el sprint
    return await updateSprintModel(id, {
      status: SprintStatus.CANCELLED,
      userStoryIds: [],
    });
  }

  /**
   * Obtiene sprints con filtros avanzados
   * @param filters Filtros para los sprints
   * @returns Lista de sprints filtrados
   */
  static async getSprintsWithFilters(filters: {
    projectId?: string;
    status?: SprintStatus | SprintStatus[];
    search?: string;
    userStoryId?: string;
  } = {}): Promise<Sprint[]> {
    const kv = getKv();
    const sprints: Sprint[] = [];

    // Listar todos los sprints
    const sprintsIterator = kv.list<Sprint>({ prefix: SPRINT_COLLECTIONS.SPRINTS });

    // Convertir arrays de filtros a conjuntos para búsqueda más eficiente
    const statusSet = filters.status
      ? new Set(Array.isArray(filters.status) ? filters.status : [filters.status])
      : null;

    // Filtrar sprints
    for await (const entry of sprintsIterator) {
      // Solo incluir entradas principales de sprints
      if (entry.key.length === 2 && entry.key[0] === SPRINT_COLLECTIONS.SPRINTS[0]) {
        const sprint = entry.value;
        let include = true;

        // Filtrar por proyecto
        if (filters.projectId && sprint.projectId !== filters.projectId) {
          include = false;
        }

        // Filtrar por estado
        if (statusSet && !statusSet.has(sprint.status)) {
          include = false;
        }

        // Filtrar por historia de usuario
        if (filters.userStoryId && !sprint.userStoryIds.includes(filters.userStoryId)) {
          include = false;
        }

        // Filtrar por búsqueda de texto
        if (
          filters.search &&
          !sprint.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(sprint.goal && sprint.goal.toLowerCase().includes(filters.search.toLowerCase()))
        ) {
          include = false;
        }

        if (include) {
          sprints.push(sprint);
        }
      }
    }

    return sprints;
  }
}
