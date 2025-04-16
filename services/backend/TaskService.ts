import { getKv } from "@/utils/db.ts";
import { 
  Task, 
  TaskData, 
  TaskStatus, 
  TaskComment, 
  TaskHistoryEntry,
  TASK_COLLECTIONS,
  createTask as createTaskModel,
  getTaskById as getTaskByIdModel,
  updateTask as updateTaskModel,
  deleteTask as deleteTaskModel,
  getUserStoryTasks as getUserStoryTasksModel,
  getUserTasks as getUserTasksModel,
  addTaskComment as addTaskCommentModel,
  getTaskComments as getTaskCommentsModel,
  addTaskHistoryEntry as addTaskHistoryEntryModel,
  getTaskHistory as getTaskHistoryModel
} from "@/models/task.ts";
import { getUserStoryById } from "@/models/userStory.ts";
import { getProjectById } from "@/models/project.ts";
import { getUserById } from "@/models/user.ts";

/**
 * Servicio para gestionar tareas en el backend
 */
export class TaskService {
  /**
   * Crea una nueva tarea
   * @param taskData Datos de la tarea
   * @returns Tarea creada
   */
  static async createTask(taskData: TaskData): Promise<Task> {
    // Verificar que la historia de usuario existe
    const userStory = await getUserStoryById(taskData.userStoryId);
    if (!userStory) {
      throw new Error("Historia de usuario no encontrada");
    }

    // Crear la tarea
    return await createTaskModel(taskData);
  }

  /**
   * Obtiene una tarea por su ID
   * @param id ID de la tarea
   * @returns Tarea o null si no existe
   */
  static async getTaskById(id: string): Promise<Task | null> {
    return await getTaskByIdModel(id);
  }

  /**
   * Obtiene una tarea por su ID con información relacionada
   * @param id ID de la tarea
   * @returns Tarea con información relacionada o null si no existe
   */
  static async getTaskWithRelations(id: string): Promise<{
    task: Task;
    userStory: Awaited<ReturnType<typeof getUserStoryById>>;
    project: Awaited<ReturnType<typeof getProjectById>>;
    assignedUser: Awaited<ReturnType<typeof getUserById>>;
    createdByUser: Awaited<ReturnType<typeof getUserById>>;
    comments: TaskComment[];
    history: TaskHistoryEntry[];
  } | null> {
    const task = await getTaskByIdModel(id);
    if (!task) {
      return null;
    }

    // Obtener la historia de usuario relacionada
    const userStory = await getUserStoryById(task.userStoryId);
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
    if (task.assignedTo) {
      assignedUser = await getUserById(task.assignedTo);
    }

    // Obtener información del creador
    const createdByUser = await getUserById(task.createdBy);

    // Obtener comentarios
    const comments = await getTaskCommentsModel(id);

    // Obtener historial
    const history = await getTaskHistoryModel(id);

    return {
      task,
      userStory,
      project,
      assignedUser,
      createdByUser,
      comments,
      history,
    };
  }

  /**
   * Actualiza una tarea
   * @param id ID de la tarea
   * @param updateData Datos a actualizar
   * @param userId ID del usuario que realiza la actualización (para historial)
   * @returns Tarea actualizada o null si no existe
   */
  static async updateTask(
    id: string,
    updateData: Partial<TaskData>,
    userId: string
  ): Promise<Task | null> {
    // Obtener la tarea actual
    const task = await getTaskByIdModel(id);
    if (!task) {
      return null;
    }

    // Registrar cambios en el historial
    for (const [field, newValue] of Object.entries(updateData)) {
      const oldValue = task[field as keyof Task];
      
      // Solo registrar si el valor ha cambiado
      if (oldValue !== newValue) {
        await addTaskHistoryEntryModel({
          taskId: id,
          userId,
          field,
          oldValue: String(oldValue),
          newValue: String(newValue),
        });
      }
    }

    // Actualizar la tarea
    return await updateTaskModel(id, updateData);
  }

  /**
   * Elimina una tarea
   * @param id ID de la tarea
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  static async deleteTask(id: string): Promise<boolean> {
    return await deleteTaskModel(id);
  }

  /**
   * Obtiene todas las tareas de una historia de usuario
   * @param userStoryId ID de la historia de usuario
   * @returns Lista de tareas
   */
  static async getUserStoryTasks(userStoryId: string): Promise<Task[]> {
    return await getUserStoryTasksModel(userStoryId);
  }

  /**
   * Obtiene todas las tareas asignadas a un usuario
   * @param userId ID del usuario
   * @returns Lista de tareas
   */
  static async getUserTasks(userId: string): Promise<Task[]> {
    return await getUserTasksModel(userId);
  }

  /**
   * Añade un comentario a una tarea
   * @param taskId ID de la tarea
   * @param userId ID del usuario que comenta
   * @param content Contenido del comentario
   * @returns Comentario creado
   */
  static async addComment(
    taskId: string,
    userId: string,
    content: string
  ): Promise<TaskComment> {
    return await addTaskCommentModel({
      taskId,
      userId,
      content,
    });
  }

  /**
   * Obtiene los comentarios de una tarea
   * @param taskId ID de la tarea
   * @returns Lista de comentarios
   */
  static async getComments(taskId: string): Promise<TaskComment[]> {
    return await getTaskCommentsModel(taskId);
  }

  /**
   * Registra tiempo en una tarea
   * @param taskId ID de la tarea
   * @param hours Horas a registrar
   * @param action Acción a realizar (añadir o establecer)
   * @param userId ID del usuario que registra el tiempo
   * @returns Tarea actualizada o null si no existe
   */
  static async logTime(
    taskId: string,
    hours: number,
    action: "add" | "set",
    userId: string
  ): Promise<Task | null> {
    // Obtener la tarea actual
    const task = await getTaskByIdModel(taskId);
    if (!task) {
      return null;
    }

    // Calcular el nuevo valor de horas
    const currentHours = task.spentHours || 0;
    const newHours = action === "add" ? currentHours + hours : hours;

    // Registrar el cambio en el historial
    await addTaskHistoryEntryModel({
      taskId,
      userId,
      field: "spentHours",
      oldValue: String(currentHours),
      newValue: String(newHours),
    });

    // Actualizar la tarea
    return await updateTaskModel(taskId, { spentHours: newHours });
  }

  /**
   * Obtiene tareas con filtros avanzados
   * @param filters Filtros para las tareas
   * @returns Lista de tareas filtradas
   */
  static async getTasksWithFilters(filters: {
    userStoryId?: string;
    projectId?: string;
    assignedTo?: string;
    status?: TaskStatus | TaskStatus[];
    search?: string;
  } = {}): Promise<Task[]> {
    const kv = getKv();
    const tasks: Task[] = [];

    // Listar todas las tareas
    const tasksIterator = kv.list<Task>({ prefix: TASK_COLLECTIONS.TASKS });

    // Convertir arrays de filtros a conjuntos para búsqueda más eficiente
    const statusSet = filters.status
      ? new Set(Array.isArray(filters.status) ? filters.status : [filters.status])
      : null;

    // Si se filtra por proyecto, primero obtenemos las historias de usuario del proyecto
    let projectUserStoryIds: Set<string> | null = null;
    if (filters.projectId) {
      const userStoriesIterator = kv.list<any>({ prefix: ["userStories"] });
      projectUserStoryIds = new Set();

      for await (const entry of userStoriesIterator) {
        const userStory = entry.value;
        if (userStory && userStory.projectId === filters.projectId) {
          projectUserStoryIds.add(userStory.id);
        }
      }
    }

    // Filtrar tareas
    for await (const entry of tasksIterator) {
      // Solo incluir entradas principales de tareas
      if (entry.key.length === 2 && entry.key[0] === TASK_COLLECTIONS.TASKS[0]) {
        const task = entry.value;
        let include = true;

        // Filtrar por historia de usuario
        if (filters.userStoryId && task.userStoryId !== filters.userStoryId) {
          include = false;
        }

        // Filtrar por proyecto (a través de historias de usuario)
        if (projectUserStoryIds && !projectUserStoryIds.has(task.userStoryId)) {
          include = false;
        }

        // Filtrar por usuario asignado
        if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
          include = false;
        }

        // Filtrar por estado
        if (statusSet && !statusSet.has(task.status)) {
          include = false;
        }

        // Filtrar por búsqueda de texto
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
          include = false;
        }

        if (include) {
          tasks.push(task);
        }
      }
    }

    return tasks;
  }
}
