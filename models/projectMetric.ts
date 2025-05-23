import { type Model, createModel, getKv } from "@/utils/db.ts";
import { z } from "zod";

// Colecciones para métricas de proyecto
export const PROJECT_METRIC_COLLECTIONS = {
  PROJECT_METRICS: ["project_metrics"],
  PROJECT_METRICS_WEEKLY: ["project_metrics_weekly"],
} as const;

// Esquema de métricas de proyecto con Zod para validación
export const ProjectMetricSchema = z.object({
  projectId: z.string(),
  date: z.number(), // timestamp
  totalUserStories: z.number(),
  completedUserStories: z.number(),
  totalPoints: z.number(),
  completedPoints: z.number(),
  averageVelocity: z.number(),
  predictedCompletion: z.number().optional(), // timestamp
  healthScore: z.number(), // 0-100
});

// Tipo de datos de métricas de proyecto
export type ProjectMetricData = z.infer<typeof ProjectMetricSchema>;

// Modelo de métricas de proyecto
export interface ProjectMetric extends Model, ProjectMetricData {}

// Crear una nueva métrica de proyecto
export async function createProjectMetric(metricData: ProjectMetricData): Promise<ProjectMetric> {
  // Crear el modelo de la métrica
  const metric = createModel<Omit<ProjectMetric, keyof Model>>({
    projectId: metricData.projectId,
    date: metricData.date,
    totalUserStories: metricData.totalUserStories,
    completedUserStories: metricData.completedUserStories,
    totalPoints: metricData.totalPoints,
    completedPoints: metricData.completedPoints,
    averageVelocity: metricData.averageVelocity,
    predictedCompletion: metricData.predictedCompletion,
    healthScore: metricData.healthScore,
  });

  // Guardar la métrica en la base de datos
  const kv = getKv();
  const key = [...PROJECT_METRIC_COLLECTIONS.PROJECT_METRICS, metric.id];
  await kv.set(key, metric);

  // Crear índice por proyecto y fecha
  await kv.set(
    [
      ...PROJECT_METRIC_COLLECTIONS.PROJECT_METRICS,
      "by_project",
      metricData.projectId,
      metricData.date.toString(),
    ],
    metric.id
  );

  return metric;
}

// Obtener métricas de un proyecto
export async function getProjectMetrics(projectId: string): Promise<ProjectMetric[]> {
  const kv = getKv();
  const metrics: ProjectMetric[] = [];

  // Listar todas las métricas del proyecto
  const metricsIterator = kv.list<string>({
    prefix: [...PROJECT_METRIC_COLLECTIONS.PROJECT_METRICS, "by_project", projectId],
  });

  for await (const entry of metricsIterator) {
    const metricId = entry.value;
    const result = await kv.get<ProjectMetric>([
      ...PROJECT_METRIC_COLLECTIONS.PROJECT_METRICS,
      metricId,
    ]);

    if (result.value) {
      metrics.push(result.value);
    }
  }

  // Ordenar por fecha
  return metrics.sort((a, b) => a.date - b.date);
}

// Obtener la última métrica de un proyecto
export async function getLatestProjectMetric(projectId: string): Promise<ProjectMetric | null> {
  const metrics = await getProjectMetrics(projectId);

  if (metrics.length === 0) {
    return null;
  }

  // Ordenar por fecha descendente y tomar la primera
  return metrics.sort((a, b) => b.date - a.date)[0];
}

// Eliminar métricas de un proyecto
export async function deleteProjectMetrics(projectId: string): Promise<boolean> {
  const kv = getKv();
  const metrics = await getProjectMetrics(projectId);

  for (const metric of metrics) {
    // Eliminar la métrica
    await kv.delete([...PROJECT_METRIC_COLLECTIONS.PROJECT_METRICS, metric.id]);

    // Eliminar índice por proyecto y fecha
    await kv.delete([
      ...PROJECT_METRIC_COLLECTIONS.PROJECT_METRICS,
      "by_project",
      projectId,
      metric.date.toString(),
    ]);
  }

  return true;
}
