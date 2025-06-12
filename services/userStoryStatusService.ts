import { getUserStoryById, updateUserStory, UserStoryStatus } from "../models/userStory.ts";
import { getUserStoryTasks, TaskStatus } from "../models/task.ts";

/**
 * Actualiza automáticamente el estado de una historia de usuario basándose en el estado de sus tareas
 * @param userStoryId ID de la historia de usuario
 * @returns Historia de usuario actualizada o null si no se encontró
 */
export async function updateUserStoryStatusBasedOnTasks(userStoryId: string) {
  try {
    // Obtener la historia de usuario
    const userStory = await getUserStoryById(userStoryId);
    if (!userStory) {
      console.warn(`Historia de usuario ${userStoryId} no encontrada`);
      return null;
    }

    // Obtener todas las tareas de la historia de usuario
    const tasks = await getUserStoryTasks(userStoryId);
    
    // Analizar el estado de las tareas
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const totalTasks = tasks.length;
    const completedTasks = tasksByStatus[TaskStatus.DONE] || 0;
    const inProgressTasks = (tasksByStatus[TaskStatus.IN_PROGRESS] || 0) + 
                           (tasksByStatus[TaskStatus.REVIEW] || 0);
    const todoTasks = tasksByStatus[TaskStatus.TODO] || 0;

    // Determinar el nuevo estado basándose en las tareas
    let newStatus: UserStoryStatus;

    if (!userStory.sprintId) { // Not in a sprint
      if (tasks.length === 0) {
        newStatus = UserStoryStatus.BACKLOG;
      } else if (completedTasks === totalTasks) {
        newStatus = UserStoryStatus.DONE;
      } else if (inProgressTasks > 0 || completedTasks > 0) { // Any task started or done
        newStatus = UserStoryStatus.IN_PROGRESS;
      } else { // Has tasks, but all are TODO (or other non-started/non-completed states like BLOCKED etc if those existed)
        newStatus = UserStoryStatus.BACKLOG;
      }
    } else { // In a sprint
      if (tasks.length === 0) {
        // If in a sprint with no tasks:
        // If its current status is BACKLOG (e.g. just added to sprint from product backlog), make it PLANNED.
        // Otherwise, maintain its current status (could be PLANNED already, or IN_PROGRESS from before tasks were removed, etc.)
        newStatus = (userStory.status === UserStoryStatus.BACKLOG) ? UserStoryStatus.PLANNED : userStory.status;
      } else if (completedTasks === totalTasks) {
        newStatus = UserStoryStatus.DONE;
      } else if (inProgressTasks > 0 || completedTasks > 0) {
        newStatus = UserStoryStatus.IN_PROGRESS;
      } else if (todoTasks === totalTasks) { // All tasks are TODO, and it's in a sprint
        newStatus = UserStoryStatus.PLANNED;
      } else {
        // This case implies a mix of non-TODO tasks that aren't IN_PROGRESS or DONE (e.g. custom statuses not accounted for).
        // Maintaining current status is a safe fallback.
        newStatus = userStory.status;
      }
    }

    // Actualizar solo si el estado ha cambiado
    if (userStory.status !== newStatus) {
      console.log(`Actualizando historia ${userStoryId} de ${userStory.status} a ${newStatus}`);
      return await updateUserStory(userStoryId, { status: newStatus });
    }

    return userStory;
  } catch (error) {
    console.error(`Error actualizando estado de historia ${userStoryId}:`, error);
    return null;
  }
}

/**
 * Actualiza el estado de todas las historias de usuario de un proyecto
 * @param projectId ID del proyecto
 */
export async function updateAllUserStoryStatusesInProject(projectId: string) {
  try {
    const { getUserStoriesWithFilters } = await import("../models/userStory.ts");
    
    // Obtener todas las historias del proyecto
    const userStories = await getUserStoriesWithFilters({ projectId });
    
    console.log(`Actualizando ${userStories.length} historias de usuario del proyecto ${projectId}`);
    
    const results = [];
    for (const userStory of userStories) {
      const result = await updateUserStoryStatusBasedOnTasks(userStory.id);
      results.push(result);
    }
    
    const updatedCount = results.filter(r => r !== null).length;
    console.log(`Se actualizaron ${updatedCount} historias de usuario`);
    
    return results;
  } catch (error) {
    console.error(`Error actualizando historias del proyecto ${projectId}:`, error);
    throw error;
  }
}

/**
 * Hook para llamar después de actualizar una tarea
 * @param taskId ID de la tarea actualizada
 */
export async function onTaskStatusChanged(taskId: string) {
  try {
    const { getTaskById } = await import("../models/task.ts");
    
    // Obtener la tarea para conocer su historia de usuario
    const task = await getTaskById(taskId);
    if (!task) {
      console.warn(`Tarea ${taskId} no encontrada`);
      return;
    }

    // Actualizar el estado de la historia de usuario
    await updateUserStoryStatusBasedOnTasks(task.userStoryId);
  } catch (error) {
    console.error(`Error en hook de cambio de estado de tarea ${taskId}:`, error);
  }
}
