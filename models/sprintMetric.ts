import { z } from "zod";
import { getKv, type Model, createModel } from "@/utils/db.ts";

// Colecciones para métricas de sprint
export const SPRINT_METRIC_COLLECTIONS = {
  SPRINT_METRICS: ["sprint_metrics"],
  SPRINT_METRICS_DAILY: ["sprint_metrics_daily"],
} as const;

// Esquema de métricas de sprint con Zod para validación
export const SprintMetricSchema = z.object({
  sprintId: z.string(),
  date: z.number(), // timestamp
  totalPoints: z.number(),
  completedPoints: z.number(),
  remainingPoints: z.number(),
  tasksCompleted: z.number(),
  tasksRemaining: z.number(),
  idealBurndown: z.number(),
  projectId: z.string(),
});

// Tipo de datos de métricas de sprint
export type SprintMetricData = z.infer<typeof SprintMetricSchema>;

// Modelo de métricas de sprint
export interface SprintMetric extends Model, SprintMetricData {}

// Crear una nueva métrica de sprint
export async function createSprintMetric(metricData: SprintMetricData): Promise<SprintMetric> {
  // Crear el modelo de la métrica
  const metric = createModel<Omit<SprintMetric, keyof Model>>({
    sprintId: metricData.sprintId,
    date: metricData.date,
    totalPoints: metricData.totalPoints,
    completedPoints: metricData.completedPoints,
    remainingPoints: metricData.remainingPoints,
    tasksCompleted: metricData.tasksCompleted,
    tasksRemaining: metricData.tasksRemaining,
    idealBurndown: metricData.idealBurndown,
    projectId: metricData.projectId,
  });

  // Guardar la métrica en la base de datos
  const kv = getKv();
  const key = [...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS, metric.id];
  await kv.set(key, metric);

  // Crear índice por sprint y fecha
  await kv.set(
    [...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS, "by_sprint", metricData.sprintId, metricData.date.toString()],
    metric.id
  );

  // Crear índice por proyecto
  await kv.set(
    [...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS, "by_project", metricData.projectId, metric.id],
    metric.id
  );

  return metric;
}

// Obtener métricas de un sprint
export async function getSprintMetrics(sprintId: string): Promise<SprintMetric[]> {
  const kv = getKv();
  const metrics: SprintMetric[] = [];

  // Listar todas las métricas del sprint
  const metricsIterator = kv.list<string>({
    prefix: [...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS, "by_sprint", sprintId],
  });

  for await (const entry of metricsIterator) {
    const metricId = entry.value;
    const result = await kv.get<SprintMetric>([...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS, metricId]);
    
    if (result.value) {
      metrics.push(result.value);
    }
  }

  // Ordenar por fecha
  return metrics.sort((a, b) => a.date - b.date);
}

// Obtener la última métrica de un sprint
export async function getLatestSprintMetric(sprintId: string): Promise<SprintMetric | null> {
  const metrics = await getSprintMetrics(sprintId);
  
  if (metrics.length === 0) {
    return null;
  }
  
  // Ordenar por fecha descendente y tomar la primera
  return metrics.sort((a, b) => b.date - a.date)[0];
}

// Eliminar métricas de un sprint
export async function deleteSprintMetrics(sprintId: string): Promise<boolean> {
  const kv = getKv();
  const metrics = await getSprintMetrics(sprintId);
  
  for (const metric of metrics) {
    // Eliminar la métrica
    await kv.delete([...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS, metric.id]);
    
    // Eliminar índice por sprint y fecha
    await kv.delete([
      ...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS,
      "by_sprint",
      sprintId,
      metric.date.toString(),
    ]);
    
    // Eliminar índice por proyecto
    await kv.delete([
      ...SPRINT_METRIC_COLLECTIONS.SPRINT_METRICS,
      "by_project",
      metric.projectId,
      metric.id,
    ]);
  }
  
  return true;
}
