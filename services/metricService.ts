import { getSprintById, Sprint, SprintStatus } from "@/models/sprint.ts";
import { getUserStoriesBySprintId, UserStory, UserStoryStatus } from "@/models/userStory.ts";
import { getUserStoryTasks as getTasksByUserStoryId, Task, TaskStatus } from "@/models/task.ts";
import {
  SprintMetric,
  SprintMetricData,
  createSprintMetric,
  getSprintMetrics
} from "@/models/sprintMetric.ts";
import {
  UserMetric,
  UserMetricData,
  createUserMetric,
  getUserMetricsForSprint
} from "@/models/userMetric.ts";
import {
  ProjectMetric,
  ProjectMetricData,
  createProjectMetric,
  getProjectMetrics
} from "@/models/projectMetric.ts";
import { getProjectById } from "@/models/project.ts";

// Calcular métricas de burndown para un sprint
export async function calculateBurndown(sprintId: string): Promise<SprintMetric[]> {
  // Obtener el sprint
  const sprint = await getSprintById(sprintId);
  if (!sprint) {
    throw new Error(`Sprint con ID ${sprintId} no encontrado`);
  }

  // Obtener las historias de usuario del sprint
  const userStories = await getUserStoriesBySprintId(sprintId);

  // Calcular puntos totales del sprint
  const totalPoints = userStories.reduce((sum, story) => sum + (story.points || 0), 0);

  // Si no hay puntos, no se puede calcular el burndown
  if (totalPoints === 0) {
    return [];
  }

  // Obtener todas las tareas de las historias de usuario
  const allTasks: Task[] = [];
  for (const story of userStories) {
    const tasks = await getTasksByUserStoryId(story.id);
    allTasks.push(...tasks);
  }

  // Calcular fechas del sprint
  const startDate = sprint.startDate || Date.now();
  const endDate = sprint.endDate || (startDate + 14 * 24 * 60 * 60 * 1000); // 2 semanas por defecto

  // Calcular duración del sprint en días
  const sprintDurationMs = endDate - startDate;
  const sprintDurationDays = Math.ceil(sprintDurationMs / (24 * 60 * 60 * 1000));

  // Calcular puntos ideales por día
  const idealBurndownPerDay = totalPoints / sprintDurationDays;

  // Obtener métricas existentes
  const existingMetrics = await getSprintMetrics(sprintId);

  // Crear array para almacenar las métricas
  const burndownData: SprintMetric[] = [];

  // Calcular métricas para cada día del sprint
  for (let day = 0; day <= sprintDurationDays; day++) {
    const currentDate = new Date(startDate + day * 24 * 60 * 60 * 1000);
    const currentDateTimestamp = currentDate.setHours(0, 0, 0, 0);

    // Verificar si ya existe una métrica para este día
    const existingMetric = existingMetrics.find(
      (metric) => new Date(metric.date).setHours(0, 0, 0, 0) === currentDateTimestamp
    );

    if (existingMetric) {
      burndownData.push(existingMetric);
      continue;
    }

    // Calcular puntos completados hasta este día
    const completedPoints = calculateCompletedPointsUntilDate(userStories, allTasks, currentDate);

    // Calcular puntos restantes
    const remainingPoints = totalPoints - completedPoints;

    // Calcular tareas completadas y restantes
    const tasksCompleted = allTasks.filter(
      (task) => task.status === TaskStatus.DONE &&
      (task.updatedAt || task.createdAt) <= currentDate.getTime()
    ).length;

    const tasksRemaining = allTasks.length - tasksCompleted;

    // Calcular burndown ideal para este día
    const idealBurndown = Math.max(0, totalPoints - (day * idealBurndownPerDay));

    // Crear métrica para este día
    const metricData: SprintMetricData = {
      sprintId,
      date: currentDateTimestamp,
      totalPoints,
      completedPoints,
      remainingPoints,
      tasksCompleted,
      tasksRemaining,
      idealBurndown,
      projectId: sprint.projectId,
    };

    // Guardar la métrica en la base de datos
    const metric = await createSprintMetric(metricData);
    burndownData.push(metric);
  }

  return burndownData;
}

// Función auxiliar para calcular puntos completados hasta una fecha
function calculateCompletedPointsUntilDate(
  userStories: UserStory[],
  tasks: Task[],
  date: Date
): number {
  // Filtrar historias de usuario completadas hasta la fecha
  const completedStories = userStories.filter(
    (story) =>
      story.status === UserStoryStatus.DONE &&
      (story.updatedAt || story.createdAt) <= date.getTime()
  );

  // Calcular puntos de las historias completadas
  const completedPoints = completedStories.reduce((sum, story) => sum + (story.points || 0), 0);

  // Para historias no completadas, calcular proporción de tareas completadas
  const incompleteStories = userStories.filter(
    (story) => !completedStories.includes(story)
  );

  let additionalPoints = 0;

  for (const story of incompleteStories) {
    // Obtener tareas de esta historia
    const storyTasks = tasks.filter((task) => task.userStoryId === story.id);

    if (storyTasks.length === 0) continue;

    // Calcular proporción de tareas completadas
    const completedTasks = storyTasks.filter(
      (task) =>
        task.status === TaskStatus.DONE &&
        (task.updatedAt || task.createdAt) <= date.getTime()
    );

    const completionRatio = completedTasks.length / storyTasks.length;

    // Añadir puntos proporcionales
    additionalPoints += (story.points || 0) * completionRatio;
  }

  return completedPoints + additionalPoints;
}

// Calcular velocidad del sprint
export async function calculateSprintVelocity(sprintId: string): Promise<number> {
  // Obtener el sprint
  const sprint = await getSprintById(sprintId);
  if (!sprint) {
    throw new Error(`Sprint con ID ${sprintId} no encontrado`);
  }

  // Solo calcular velocidad para sprints completados
  if (sprint.status !== SprintStatus.COMPLETED) {
    return 0;
  }

  // Obtener las historias de usuario del sprint
  const userStories = await getUserStoriesBySprintId(sprintId);

  // Filtrar historias completadas
  const completedStories = userStories.filter(
    (story) => story.status === UserStoryStatus.DONE
  );

  // Calcular puntos completados
  const completedPoints = completedStories.reduce((sum, story) => sum + (story.points || 0), 0);

  return completedPoints;
}

// Calcular métricas de usuario para un sprint
export async function calculateUserContributions(
  userId: string,
  sprintId: string
): Promise<UserMetric[]> {
  // Obtener el sprint
  const sprint = await getSprintById(sprintId);
  if (!sprint) {
    throw new Error(`Sprint con ID ${sprintId} no encontrado`);
  }

  // Obtener las historias de usuario del sprint
  const userStories = await getUserStoriesBySprintId(sprintId);

  // Obtener todas las tareas de las historias de usuario
  const allTasks: Task[] = [];
  for (const story of userStories) {
    const tasks = await getTasksByUserStoryId(story.id);
    allTasks.push(...tasks);
  }

  // Filtrar tareas asignadas al usuario
  const userTasks = allTasks.filter((task) => task.assignedTo === userId);

  // Calcular fechas del sprint
  const startDate = sprint.startDate || Date.now();
  const endDate = sprint.endDate || (startDate + 14 * 24 * 60 * 60 * 1000); // 2 semanas por defecto

  // Calcular duración del sprint en días
  const sprintDurationMs = endDate - startDate;
  const sprintDurationDays = Math.ceil(sprintDurationMs / (24 * 60 * 60 * 1000));

  // Obtener métricas existentes
  const existingMetrics = await getUserMetricsForSprint(userId, sprintId);

  // Crear array para almacenar las métricas
  const userMetrics: UserMetric[] = [];

  // Calcular métricas para cada día del sprint
  for (let day = 0; day <= sprintDurationDays; day++) {
    const currentDate = new Date(startDate + day * 24 * 60 * 60 * 1000);
    const currentDateTimestamp = currentDate.setHours(0, 0, 0, 0);

    // Verificar si ya existe una métrica para este día
    const existingMetric = existingMetrics.find(
      (metric) => new Date(metric.date).setHours(0, 0, 0, 0) === currentDateTimestamp
    );

    if (existingMetric) {
      userMetrics.push(existingMetric);
      continue;
    }

    // Calcular tareas completadas hasta este día
    const tasksCompleted = userTasks.filter(
      (task) =>
        task.status === TaskStatus.DONE &&
        (task.updatedAt || task.createdAt) <= currentDate.getTime()
    ).length;

    // Calcular puntos contribuidos
    const pointsContributed = calculateUserPointsContribution(
      userId,
      userStories,
      allTasks,
      currentDate
    );

    // Calcular horas registradas
    const hoursLogged = userTasks.reduce((sum, task) => sum + (task.spentHours || 0), 0);

    // Calcular eficiencia
    const efficiency = hoursLogged > 0 ? pointsContributed / hoursLogged : 0;

    // Crear métrica para este día
    const metricData: UserMetricData = {
      userId,
      sprintId,
      date: currentDateTimestamp,
      tasksCompleted,
      pointsContributed,
      hoursLogged,
      efficiency,
      projectId: sprint.projectId,
    };

    // Guardar la métrica en la base de datos
    const metric = await createUserMetric(metricData);
    userMetrics.push(metric);
  }

  return userMetrics;
}

// Función auxiliar para calcular puntos contribuidos por un usuario
function calculateUserPointsContribution(
  userId: string,
  userStories: UserStory[],
  tasks: Task[],
  date: Date
): number {
  let pointsContributed = 0;

  for (const story of userStories) {
    // Obtener tareas de esta historia
    const storyTasks = tasks.filter((task) => task.userStoryId === story.id);

    if (storyTasks.length === 0) continue;

    // Calcular tareas completadas por el usuario
    const userCompletedTasks = storyTasks.filter(
      (task) =>
        task.assignedTo === userId &&
        task.status === TaskStatus.DONE &&
        (task.updatedAt || task.createdAt) <= date.getTime()
    );

    // Calcular contribución proporcional
    const contributionRatio = storyTasks.length > 0
      ? userCompletedTasks.length / storyTasks.length
      : 0;

    // Añadir puntos proporcionales
    pointsContributed += (story.points || 0) * contributionRatio;
  }

  return pointsContributed;
}

// Calcular salud del proyecto
export async function calculateProjectHealth(projectId: string): Promise<number> {
  // Obtener el proyecto
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error(`Proyecto con ID ${projectId} no encontrado`);
  }

  // Obtener métricas del proyecto
  const projectMetrics = await getProjectMetrics(projectId);

  // Si no hay métricas, calcular métricas iniciales
  if (projectMetrics.length === 0) {
    await calculateProjectMetrics(projectId);
    return 50; // Valor neutral por defecto
  }

  // Obtener la última métrica
  const latestMetric = projectMetrics.sort((a, b) => b.date - a.date)[0];

  return latestMetric.healthScore;
}

// Calcular métricas del proyecto
export async function calculateProjectMetrics(projectId: string): Promise<ProjectMetric> {
  // Obtener el proyecto
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error(`Proyecto con ID ${projectId} no encontrado`);
  }

  // Obtener todas las historias de usuario del proyecto
  // Esta función debe implementarse en el modelo de historias de usuario
  const userStories = await getUserStoriesByProjectId(projectId);

  // Calcular total de historias de usuario
  const totalUserStories = userStories.length;

  // Calcular historias de usuario completadas
  const completedUserStories = userStories.filter(
    (story) => story.status === UserStoryStatus.DONE
  ).length;

  // Calcular total de puntos
  const totalPoints = userStories.reduce((sum, story) => sum + (story.points || 0), 0);

  // Calcular puntos completados
  const completedPoints = userStories
    .filter((story) => story.status === UserStoryStatus.DONE)
    .reduce((sum, story) => sum + (story.points || 0), 0);

  // Calcular velocidad promedio
  const averageVelocity = await calculateAverageVelocity(projectId);

  // Calcular fecha de finalización prevista
  let predictedCompletion: number | undefined;

  if (averageVelocity > 0) {
    const remainingPoints = totalPoints - completedPoints;
    const remainingSprints = Math.ceil(remainingPoints / averageVelocity);
    // Asumiendo sprints de 2 semanas
    predictedCompletion = Date.now() + (remainingSprints * 14 * 24 * 60 * 60 * 1000);
  }

  // Calcular puntuación de salud
  const healthScore = calculateHealthScore(
    totalUserStories,
    completedUserStories,
    totalPoints,
    completedPoints,
    averageVelocity
  );

  // Crear métrica del proyecto
  const metricData: ProjectMetricData = {
    projectId,
    date: Date.now(),
    totalUserStories,
    completedUserStories,
    totalPoints,
    completedPoints,
    averageVelocity,
    predictedCompletion,
    healthScore,
  };

  // Guardar la métrica en la base de datos
  return await createProjectMetric(metricData);
}

// Función auxiliar para calcular la velocidad promedio
async function calculateAverageVelocity(projectId: string): Promise<number> {
  // Esta función debe implementarse para obtener los sprints de un proyecto
  const sprints = await getProjectSprints(projectId);

  // Filtrar sprints completados
  const completedSprints = sprints.filter(
    (sprint) => sprint.status === SprintStatus.COMPLETED
  );

  if (completedSprints.length === 0) {
    return 0;
  }

  // Calcular velocidad de cada sprint
  const velocities: number[] = [];

  for (const sprint of completedSprints) {
    const velocity = await calculateSprintVelocity(sprint.id);
    velocities.push(velocity);
  }

  // Calcular promedio
  const sum = velocities.reduce((a, b) => a + b, 0);
  return sum / velocities.length;
}

// Función auxiliar para calcular la puntuación de salud
function calculateHealthScore(
  totalUserStories: number,
  completedUserStories: number,
  totalPoints: number,
  completedPoints: number,
  averageVelocity: number
): number {
  // Si no hay historias de usuario, la salud es neutral
  if (totalUserStories === 0) {
    return 50;
  }

  // Calcular porcentaje de completitud
  const completionPercentage = totalPoints > 0
    ? (completedPoints / totalPoints) * 100
    : 0;

  // Calcular porcentaje de historias completadas
  const storiesCompletionPercentage = (completedUserStories / totalUserStories) * 100;

  // Calcular salud basada en completitud y velocidad
  // Esta es una fórmula simple, puede ajustarse según necesidades
  const healthScore = (completionPercentage * 0.4) + (storiesCompletionPercentage * 0.4) + (averageVelocity > 0 ? 20 : 0);

  // Limitar entre 0 y 100
  return Math.min(100, Math.max(0, healthScore));
}

// Función auxiliar para obtener historias de usuario por proyecto
// Esta función debe implementarse en el modelo de historias de usuario
async function getUserStoriesByProjectId(_projectId: string): Promise<UserStory[]> {
  // Implementación temporal
  return await Promise.resolve([]);
}

// Función auxiliar para obtener sprints de un proyecto
// Esta función debe implementarse en el modelo de sprint
async function getProjectSprints(_projectId: string): Promise<Sprint[]> {
  // Implementación temporal
  return await Promise.resolve([]);
}
