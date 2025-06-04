import { getSprintById } from "../models/sprint.ts";
import { getUserStoriesBySprintId } from "../models/userStory.ts";
import { getUserStoryTasks } from "../models/task.ts";
import { getKv } from "../utils/db.ts";

export interface BurndownData {
  date: string;
  remaining: number;
  ideal: number;
  completed: number;
}

export interface BurndownPoint {
  date: number; // timestamp
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  idealRemaining: number;
}

// Colecciones para datos de burndown
export const BURNDOWN_COLLECTIONS = {
  BURNDOWN_DATA: ["burndown_data"],
} as const;

/**
 * Calcula los datos de burndown para un sprint
 */
export async function calculateBurndownData(sprintId: string): Promise<BurndownData[]> {
  try {
    // Obtener el sprint
    const sprint = await getSprintById(sprintId);
    if (!sprint) {
      throw new Error(`Sprint ${sprintId} no encontrado`);
    }

    // Verificar que el sprint tenga fechas
    if (!sprint.startDate || !sprint.endDate) {
      throw new Error("El sprint debe tener fechas de inicio y fin definidas");
    }

    // Obtener historias de usuario del sprint
    const userStories = await getUserStoriesBySprintId(sprintId);
    
    // Calcular puntos totales del sprint
    const totalPoints = userStories.reduce((sum, story) => sum + (story.points || 0), 0);
    
    if (totalPoints === 0) {
      throw new Error("El sprint no tiene puntos asignados");
    }

    // Obtener todas las tareas del sprint
    const allTasks = [];
    for (const story of userStories) {
      const tasks = await getUserStoryTasks(story.id);
      allTasks.push(...tasks.map(task => ({ ...task, storyPoints: story.points || 0 })));
    }

    // Generar datos de burndown día por día
    const burndownData: BurndownData[] = [];
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const today = new Date();
    
    // Calcular duración del sprint en días
    const sprintDurationMs = endDate.getTime() - startDate.getTime();
    const sprintDurationDays = Math.ceil(sprintDurationMs / (1000 * 60 * 60 * 24));
    const idealBurndownPerDay = totalPoints / sprintDurationDays;

    // Generar datos desde el inicio del sprint hasta hoy (o fin del sprint si ya terminó)
    const currentDate = new Date(startDate);
    let dayIndex = 0;

    while (currentDate <= today && currentDate <= endDate) {
      // Calcular puntos completados hasta esta fecha
      const completedPoints = calculateCompletedPointsUpToDate(allTasks, userStories, currentDate);
      const remainingPoints = totalPoints - completedPoints;
      
      // Calcular burndown ideal para este día
      const idealRemaining = Math.max(0, totalPoints - (dayIndex * idealBurndownPerDay));

      burndownData.push({
        date: currentDate.toISOString().split('T')[0],
        remaining: Math.round(remainingPoints * 10) / 10,
        ideal: Math.round(idealRemaining * 10) / 10,
        completed: Math.round(completedPoints * 10) / 10
      });

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }

    return burndownData;
  } catch (error) {
    console.error("Error calculando burndown:", error);
    throw error;
  }
}

/**
 * Calcula los puntos completados hasta una fecha específica
 */
function calculateCompletedPointsUpToDate(
  tasks: any[], 
  userStories: any[], 
  targetDate: Date
): number {
  let completedPoints = 0;

  for (const story of userStories) {
    const storyTasks = tasks.filter(task => task.userStoryId === story.id);
    
    if (storyTasks.length === 0) {
      // Si no hay tareas, considerar la historia completada si su estado es "done"
      if (story.status === "done" && story.updatedAt <= targetDate.getTime()) {
        completedPoints += story.points || 0;
      }
    } else {
      // Verificar si todas las tareas están completadas hasta la fecha
      const completedTasks = storyTasks.filter(task => 
        task.status === "done" && task.updatedAt <= targetDate.getTime()
      );
      
      if (completedTasks.length === storyTasks.length) {
        // Todas las tareas completadas = historia completada
        completedPoints += story.points || 0;
      }
    }
  }

  return completedPoints;
}

/**
 * Guarda un punto de burndown en la base de datos
 */
export async function saveBurndownPoint(sprintId: string, data: Omit<BurndownPoint, 'date'>) {
  const kv = getKv();
  
  const burndownPoint: BurndownPoint = {
    ...data,
    date: Date.now()
  };

  const key = [
    ...BURNDOWN_COLLECTIONS.BURNDOWN_DATA,
    sprintId,
    burndownPoint.date.toString()
  ];

  await kv.set(key, burndownPoint);
  return burndownPoint;
}

/**
 * Obtiene los datos históricos de burndown de un sprint
 */
export async function getBurndownHistory(sprintId: string): Promise<BurndownPoint[]> {
  const kv = getKv();
  const burndownPoints: BurndownPoint[] = [];

  const iterator = kv.list<BurndownPoint>({
    prefix: [...BURNDOWN_COLLECTIONS.BURNDOWN_DATA, sprintId]
  });

  for await (const entry of iterator) {
    burndownPoints.push(entry.value);
  }

  // Ordenar por fecha
  return burndownPoints.sort((a, b) => a.date - b.date);
}

/**
 * Recalcula y actualiza los datos de burndown para un sprint
 */
export async function recalculateBurndown(sprintId: string): Promise<BurndownData[]> {
  try {
    console.log(`Recalculando burndown para sprint ${sprintId}`);
    
    // Limpiar datos anteriores
    const kv = getKv();
    const iterator = kv.list({
      prefix: [...BURNDOWN_COLLECTIONS.BURNDOWN_DATA, sprintId]
    });

    for await (const entry of iterator) {
      await kv.delete(entry.key);
    }

    // Calcular nuevos datos
    const burndownData = await calculateBurndownData(sprintId);
    
    // Guardar puntos históricos
    for (const point of burndownData) {
      await saveBurndownPoint(sprintId, {
        totalPoints: point.completed + point.remaining,
        completedPoints: point.completed,
        remainingPoints: point.remaining,
        idealRemaining: point.ideal
      });
    }

    console.log(`Burndown recalculado: ${burndownData.length} puntos de datos`);
    return burndownData;
  } catch (error) {
    console.error("Error recalculando burndown:", error);
    throw error;
  }
}
