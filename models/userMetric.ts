import { type Model, createModel, getKv } from "@/utils/db.ts";
import { z } from "zod";

// Colecciones para métricas de usuario
export const USER_METRIC_COLLECTIONS = {
  USER_METRICS: ["user_metrics"],
  USER_METRICS_DAILY: ["user_metrics_daily"],
} as const;

// Esquema de métricas de usuario con Zod para validación
export const UserMetricSchema = z.object({
  userId: z.string(),
  sprintId: z.string(),
  date: z.number(), // timestamp
  tasksCompleted: z.number(),
  pointsContributed: z.number(),
  hoursLogged: z.number(),
  efficiency: z.number().optional(), // puntos por hora
  projectId: z.string(),
});

// Tipo de datos de métricas de usuario
export type UserMetricData = z.infer<typeof UserMetricSchema>;

// Modelo de métricas de usuario
export interface UserMetric extends Model, UserMetricData {}

// Crear una nueva métrica de usuario
export async function createUserMetric(metricData: UserMetricData): Promise<UserMetric> {
  // Calcular eficiencia si no se proporciona
  const efficiency =
    metricData.efficiency ??
    (metricData.hoursLogged > 0 ? metricData.pointsContributed / metricData.hoursLogged : 0);

  // Crear el modelo de la métrica
  const metric = createModel<Omit<UserMetric, keyof Model>>({
    userId: metricData.userId,
    sprintId: metricData.sprintId,
    date: metricData.date,
    tasksCompleted: metricData.tasksCompleted,
    pointsContributed: metricData.pointsContributed,
    hoursLogged: metricData.hoursLogged,
    efficiency,
    projectId: metricData.projectId,
  });

  // Guardar la métrica en la base de datos
  const kv = getKv();
  const key = [...USER_METRIC_COLLECTIONS.USER_METRICS, metric.id];
  await kv.set(key, metric);

  // Crear índice por usuario y fecha
  await kv.set(
    [
      ...USER_METRIC_COLLECTIONS.USER_METRICS,
      "by_user",
      metricData.userId,
      metricData.date.toString(),
    ],
    metric.id
  );

  // Crear índice por sprint
  await kv.set(
    [...USER_METRIC_COLLECTIONS.USER_METRICS, "by_sprint", metricData.sprintId, metric.id],
    metric.id
  );

  // Crear índice por proyecto
  await kv.set(
    [...USER_METRIC_COLLECTIONS.USER_METRICS, "by_project", metricData.projectId, metric.id],
    metric.id
  );

  return metric;
}

// Obtener métricas de un usuario
export async function getUserMetrics(userId: string): Promise<UserMetric[]> {
  const kv = getKv();
  const metrics: UserMetric[] = [];

  // Listar todas las métricas del usuario
  const metricsIterator = kv.list<string>({
    prefix: [...USER_METRIC_COLLECTIONS.USER_METRICS, "by_user", userId],
  });

  for await (const entry of metricsIterator) {
    const metricId = entry.value;
    const result = await kv.get<UserMetric>([...USER_METRIC_COLLECTIONS.USER_METRICS, metricId]);

    if (result.value) {
      metrics.push(result.value);
    }
  }

  // Ordenar por fecha
  return metrics.sort((a, b) => a.date - b.date);
}

// Obtener métricas de un usuario en un sprint
export async function getUserMetricsForSprint(
  userId: string,
  sprintId: string
): Promise<UserMetric[]> {
  const kv = getKv();
  const metrics: UserMetric[] = [];

  // Listar todas las métricas del usuario en el sprint
  const metricsIterator = kv.list<string>({
    prefix: [...USER_METRIC_COLLECTIONS.USER_METRICS, "by_sprint", sprintId],
  });

  for await (const entry of metricsIterator) {
    const metricId = entry.value;
    const result = await kv.get<UserMetric>([...USER_METRIC_COLLECTIONS.USER_METRICS, metricId]);

    if (result.value && result.value.userId === userId) {
      metrics.push(result.value);
    }
  }

  // Ordenar por fecha
  return metrics.sort((a, b) => a.date - b.date);
}

// Obtener métricas de todos los usuarios en un proyecto
export async function getProjectUserMetrics(projectId: string): Promise<UserMetric[]> {
  const kv = getKv();
  const metrics: UserMetric[] = [];

  // Listar todas las métricas del proyecto
  const metricsIterator = kv.list<string>({
    prefix: [...USER_METRIC_COLLECTIONS.USER_METRICS, "by_project", projectId],
  });

  for await (const entry of metricsIterator) {
    const metricId = entry.value;
    const result = await kv.get<UserMetric>([...USER_METRIC_COLLECTIONS.USER_METRICS, metricId]);

    if (result.value) {
      metrics.push(result.value);
    }
  }

  return metrics;
}

// Eliminar métricas de un usuario
export async function deleteUserMetrics(userId: string): Promise<boolean> {
  const kv = getKv();
  const metrics = await getUserMetrics(userId);

  for (const metric of metrics) {
    // Eliminar la métrica
    await kv.delete([...USER_METRIC_COLLECTIONS.USER_METRICS, metric.id]);

    // Eliminar índice por usuario y fecha
    await kv.delete([
      ...USER_METRIC_COLLECTIONS.USER_METRICS,
      "by_user",
      userId,
      metric.date.toString(),
    ]);

    // Eliminar índice por sprint
    await kv.delete([
      ...USER_METRIC_COLLECTIONS.USER_METRICS,
      "by_sprint",
      metric.sprintId,
      metric.id,
    ]);

    // Eliminar índice por proyecto
    await kv.delete([
      ...USER_METRIC_COLLECTIONS.USER_METRICS,
      "by_project",
      metric.projectId,
      metric.id,
    ]);
  }

  return true;
}
