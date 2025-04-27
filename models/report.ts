import { z } from "zod";
import { getKv, type Model, createModel } from "@/utils/db.ts";

// Colecciones para reportes
export const REPORT_COLLECTIONS = {
  REPORTS: ["reports"],
  SCHEDULED_REPORTS: ["scheduled_reports"],
} as const;

// Tipo de reporte
export enum ReportType {
  SPRINT_SUMMARY = "sprint_summary",
  PROJECT_PROGRESS = "project_progress",
  TEAM_PERFORMANCE = "team_performance",
  USER_PERFORMANCE = "user_performance",
  CUSTOM = "custom",
}

// Frecuencia de reportes programados
export enum ReportFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  END_OF_SPRINT = "end_of_sprint",
}

// Formato de exportación
export enum ReportFormat {
  PDF = "pdf",
  CSV = "csv",
  JSON = "json",
  HTML = "html",
}

// Esquema de configuración de reporte con Zod para validación
export const ReportConfigSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(ReportType),
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.number().optional(), // timestamp
  endDate: z.number().optional(), // timestamp
  includeBurndown: z.boolean().optional(),
  includeVelocity: z.boolean().optional(),
  includeUserMetrics: z.boolean().optional(),
  includeProjectHealth: z.boolean().optional(),
  customSections: z.array(z.string()).optional(),
});

// Tipo de datos de configuración de reporte
export type ReportConfigData = z.infer<typeof ReportConfigSchema>;

// Esquema de reporte con Zod para validación
export const ReportSchema = z.object({
  config: ReportConfigSchema,
  createdBy: z.string(), // userId del creador
  generatedAt: z.number(), // timestamp
  data: z.record(z.any()).optional(), // Datos del reporte en formato JSON
  exportFormats: z.array(z.nativeEnum(ReportFormat)).optional(),
});

// Tipo de datos de reporte
export type ReportData = z.infer<typeof ReportSchema>;

// Modelo de reporte
export interface Report extends Model, ReportData {}

// Esquema de reporte programado con Zod para validación
export const ScheduledReportSchema = z.object({
  reportConfig: ReportConfigSchema,
  frequency: z.nativeEnum(ReportFrequency),
  nextRunTime: z.number(), // timestamp
  createdBy: z.string(), // userId del creador
  recipients: z.array(z.string()).optional(), // emails o userIds
  lastRunTime: z.number().optional(), // timestamp
  lastReportId: z.string().optional(),
  exportFormats: z.array(z.nativeEnum(ReportFormat)).optional(),
});

// Tipo de datos de reporte programado
export type ScheduledReportData = z.infer<typeof ScheduledReportSchema>;

// Modelo de reporte programado
export interface ScheduledReport extends Model, ScheduledReportData {}

// Crear un nuevo reporte
export async function createReport(reportData: ReportData): Promise<Report> {
  // Crear el modelo del reporte
  const report = createModel<Omit<Report, keyof Model>>({
    config: reportData.config,
    createdBy: reportData.createdBy,
    generatedAt: reportData.generatedAt || Date.now(),
    data: reportData.data,
    exportFormats: reportData.exportFormats,
  });

  // Guardar el reporte en la base de datos
  const kv = getKv();
  const key = [...REPORT_COLLECTIONS.REPORTS, report.id];
  await kv.set(key, report);

  // Crear índice por creador
  await kv.set(
    [...REPORT_COLLECTIONS.REPORTS, "by_user", reportData.createdBy, report.id],
    report.id
  );

  // Crear índice por proyecto si existe
  if (reportData.config.projectId) {
    await kv.set(
      [...REPORT_COLLECTIONS.REPORTS, "by_project", reportData.config.projectId, report.id],
      report.id
    );
  }

  // Crear índice por sprint si existe
  if (reportData.config.sprintId) {
    await kv.set(
      [...REPORT_COLLECTIONS.REPORTS, "by_sprint", reportData.config.sprintId, report.id],
      report.id
    );
  }

  return report;
}

// Obtener un reporte por ID
export async function getReportById(id: string): Promise<Report | null> {
  const kv = getKv();
  const key = [...REPORT_COLLECTIONS.REPORTS, id];
  const result = await kv.get<Report>(key);
  return result.value;
}

// Obtener reportes de un usuario
export async function getUserReports(userId: string): Promise<Report[]> {
  const kv = getKv();
  const reports: Report[] = [];

  // Listar todos los reportes del usuario
  const reportsIterator = kv.list<string>({
    prefix: [...REPORT_COLLECTIONS.REPORTS, "by_user", userId],
  });

  for await (const entry of reportsIterator) {
    const reportId = entry.value;
    const result = await kv.get<Report>([...REPORT_COLLECTIONS.REPORTS, reportId]);
    
    if (result.value) {
      reports.push(result.value);
    }
  }

  // Ordenar por fecha de generación descendente
  return reports.sort((a, b) => b.generatedAt - a.generatedAt);
}

// Obtener reportes de un proyecto
export async function getProjectReports(projectId: string): Promise<Report[]> {
  const kv = getKv();
  const reports: Report[] = [];

  // Listar todos los reportes del proyecto
  const reportsIterator = kv.list<string>({
    prefix: [...REPORT_COLLECTIONS.REPORTS, "by_project", projectId],
  });

  for await (const entry of reportsIterator) {
    const reportId = entry.value;
    const result = await kv.get<Report>([...REPORT_COLLECTIONS.REPORTS, reportId]);
    
    if (result.value) {
      reports.push(result.value);
    }
  }

  // Ordenar por fecha de generación descendente
  return reports.sort((a, b) => b.generatedAt - a.generatedAt);
}

// Eliminar un reporte
export async function deleteReport(id: string): Promise<boolean> {
  const kv = getKv();
  const report = await getReportById(id);
  
  if (!report) {
    return false;
  }
  
  // Eliminar el reporte
  await kv.delete([...REPORT_COLLECTIONS.REPORTS, id]);
  
  // Eliminar índice por creador
  await kv.delete([
    ...REPORT_COLLECTIONS.REPORTS,
    "by_user",
    report.createdBy,
    id,
  ]);
  
  // Eliminar índice por proyecto si existe
  if (report.config.projectId) {
    await kv.delete([
      ...REPORT_COLLECTIONS.REPORTS,
      "by_project",
      report.config.projectId,
      id,
    ]);
  }
  
  // Eliminar índice por sprint si existe
  if (report.config.sprintId) {
    await kv.delete([
      ...REPORT_COLLECTIONS.REPORTS,
      "by_sprint",
      report.config.sprintId,
      id,
    ]);
  }
  
  return true;
}

// Crear un nuevo reporte programado
export async function createScheduledReport(reportData: ScheduledReportData): Promise<ScheduledReport> {
  // Crear el modelo del reporte programado
  const scheduledReport = createModel<Omit<ScheduledReport, keyof Model>>({
    reportConfig: reportData.reportConfig,
    frequency: reportData.frequency,
    nextRunTime: reportData.nextRunTime,
    createdBy: reportData.createdBy,
    recipients: reportData.recipients,
    lastRunTime: reportData.lastRunTime,
    lastReportId: reportData.lastReportId,
    exportFormats: reportData.exportFormats,
  });

  // Guardar el reporte programado en la base de datos
  const kv = getKv();
  const key = [...REPORT_COLLECTIONS.SCHEDULED_REPORTS, scheduledReport.id];
  await kv.set(key, scheduledReport);

  // Crear índice por creador
  await kv.set(
    [...REPORT_COLLECTIONS.SCHEDULED_REPORTS, "by_user", reportData.createdBy, scheduledReport.id],
    scheduledReport.id
  );

  // Crear índice por proyecto si existe
  if (reportData.reportConfig.projectId) {
    await kv.set(
      [...REPORT_COLLECTIONS.SCHEDULED_REPORTS, "by_project", reportData.reportConfig.projectId, scheduledReport.id],
      scheduledReport.id
    );
  }

  return scheduledReport;
}

// Obtener un reporte programado por ID
export async function getScheduledReportById(id: string): Promise<ScheduledReport | null> {
  const kv = getKv();
  const key = [...REPORT_COLLECTIONS.SCHEDULED_REPORTS, id];
  const result = await kv.get<ScheduledReport>(key);
  return result.value;
}

// Obtener reportes programados de un usuario
export async function getUserScheduledReports(userId: string): Promise<ScheduledReport[]> {
  const kv = getKv();
  const reports: ScheduledReport[] = [];

  // Listar todos los reportes programados del usuario
  const reportsIterator = kv.list<string>({
    prefix: [...REPORT_COLLECTIONS.SCHEDULED_REPORTS, "by_user", userId],
  });

  for await (const entry of reportsIterator) {
    const reportId = entry.value;
    const result = await kv.get<ScheduledReport>([...REPORT_COLLECTIONS.SCHEDULED_REPORTS, reportId]);
    
    if (result.value) {
      reports.push(result.value);
    }
  }

  // Ordenar por próxima ejecución
  return reports.sort((a, b) => a.nextRunTime - b.nextRunTime);
}

// Actualizar un reporte programado
export async function updateScheduledReport(
  id: string,
  updateData: Partial<ScheduledReportData>
): Promise<ScheduledReport | null> {
  const kv = getKv();
  const key = [...REPORT_COLLECTIONS.SCHEDULED_REPORTS, id];
  
  // Obtener el reporte programado actual
  const result = await kv.get<ScheduledReport>(key);
  if (!result.value) {
    return null;
  }
  
  // Actualizar los campos
  const updatedReport: ScheduledReport = {
    ...result.value,
    ...updateData,
    updatedAt: Date.now(),
  };
  
  // Guardar el reporte programado actualizado
  await kv.set(key, updatedReport);
  
  return updatedReport;
}

// Eliminar un reporte programado
export async function deleteScheduledReport(id: string): Promise<boolean> {
  const kv = getKv();
  const report = await getScheduledReportById(id);
  
  if (!report) {
    return false;
  }
  
  // Eliminar el reporte programado
  await kv.delete([...REPORT_COLLECTIONS.SCHEDULED_REPORTS, id]);
  
  // Eliminar índice por creador
  await kv.delete([
    ...REPORT_COLLECTIONS.SCHEDULED_REPORTS,
    "by_user",
    report.createdBy,
    id,
  ]);
  
  // Eliminar índice por proyecto si existe
  if (report.reportConfig.projectId) {
    await kv.delete([
      ...REPORT_COLLECTIONS.SCHEDULED_REPORTS,
      "by_project",
      report.reportConfig.projectId,
      id,
    ]);
  }
  
  return true;
}
