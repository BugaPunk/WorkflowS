import { 
  Report, 
  ReportData, 
  ReportConfigData, 
  createReport,
  ReportFormat,
  ScheduledReport,
  ScheduledReportData,
  createScheduledReport,
  updateScheduledReport,
  getScheduledReportById,
  ReportFrequency
} from "@/models/report.ts";
import { 
  calculateBurndown, 
  calculateSprintVelocity,
  calculateUserContributions,
  calculateProjectHealth,
  calculateProjectMetrics
} from "@/services/metricService.ts";
import { getSprintById } from "@/models/sprint.ts";
import { getProjectById } from "@/models/project.ts";
import { getUserById } from "@/models/user.ts";

// Generar un reporte basado en la configuración
export async function generateReport(config: ReportConfigData, userId: string): Promise<Report> {
  // Validar la configuración
  validateReportConfig(config);
  
  // Inicializar datos del reporte
  const reportData: Record<string, unknown> = {};
  
  // Obtener datos según configuración
  if (config.sprintId) {
    // Verificar que el sprint existe
    const sprint = await getSprintById(config.sprintId);
    if (!sprint) {
      throw new Error(`Sprint con ID ${config.sprintId} no encontrado`);
    }
    
    // Incluir datos del sprint
    reportData.sprint = sprint;
    
    // Incluir burndown si se solicita
    if (config.includeBurndown) {
      reportData.burndown = await calculateBurndown(config.sprintId);
    }
    
    // Incluir velocidad del sprint
    reportData.velocity = await calculateSprintVelocity(config.sprintId);
  }
  
  if (config.projectId) {
    // Verificar que el proyecto existe
    const project = await getProjectById(config.projectId);
    if (!project) {
      throw new Error(`Proyecto con ID ${config.projectId} no encontrado`);
    }
    
    // Incluir datos del proyecto
    reportData.project = project;
    
    // Incluir salud del proyecto si se solicita
    if (config.includeProjectHealth) {
      reportData.healthScore = await calculateProjectHealth(config.projectId);
    }
    
    // Incluir métricas del proyecto
    reportData.projectMetrics = await calculateProjectMetrics(config.projectId);
    
    // Incluir velocidad si se solicita
    if (config.includeVelocity) {
      // Obtener velocidad de los últimos sprints
      // Esta función debe implementarse
      reportData.velocityHistory = await getProjectVelocityHistory(config.projectId);
    }
  }
  
  if (config.userId && config.sprintId && config.includeUserMetrics) {
    // Verificar que el usuario existe
    const user = await getUserById(config.userId);
    if (!user) {
      throw new Error(`Usuario con ID ${config.userId} no encontrado`);
    }
    
    // Incluir métricas del usuario
    reportData.userMetrics = await calculateUserContributions(config.userId, config.sprintId);
  }
  
  // Crear datos del reporte
  const reportDataObj: ReportData = {
    config,
    createdBy: userId,
    generatedAt: Date.now(),
    data: reportData,
    exportFormats: [ReportFormat.HTML, ReportFormat.PDF, ReportFormat.CSV],
  };
  
  // Crear el reporte
  return await createReport(reportDataObj);
}

// Validar la configuración del reporte
function validateReportConfig(config: ReportConfigData): void {
  // Validar que al menos uno de los IDs está presente
  if (!config.projectId && !config.sprintId && !config.userId) {
    throw new Error("La configuración del reporte debe incluir al menos un ID de proyecto, sprint o usuario");
  }
  
  // Validar que si se incluye burndown, se proporciona un ID de sprint
  if (config.includeBurndown && !config.sprintId) {
    throw new Error("Para incluir el burndown, se debe proporcionar un ID de sprint");
  }
  
  // Validar que si se incluyen métricas de usuario, se proporciona un ID de usuario y sprint
  if (config.includeUserMetrics && (!config.userId || !config.sprintId)) {
    throw new Error("Para incluir métricas de usuario, se deben proporcionar IDs de usuario y sprint");
  }
}

// Exportar un reporte a un formato específico
export async function exportReport(reportId: string, format: ReportFormat): Promise<string> {
  // Esta función debe implementarse para exportar el reporte al formato especificado
  // Retorna la URL del archivo exportado
  
  switch (format) {
    case ReportFormat.PDF:
      return await exportReportToPdf(reportId);
    case ReportFormat.CSV:
      return await exportReportToCsv(reportId);
    case ReportFormat.JSON:
      return await exportReportToJson(reportId);
    case ReportFormat.HTML:
      return await exportReportToHtml(reportId);
    default:
      throw new Error(`Formato de exportación ${format} no soportado`);
  }
}

// Exportar un reporte a PDF
async function exportReportToPdf(reportId: string): Promise<string> {
  // Implementación temporal
  return `/api/reports/${reportId}/export?format=pdf`;
}

// Exportar un reporte a CSV
async function exportReportToCsv(reportId: string): Promise<string> {
  // Implementación temporal
  return `/api/reports/${reportId}/export?format=csv`;
}

// Exportar un reporte a JSON
async function exportReportToJson(reportId: string): Promise<string> {
  // Implementación temporal
  return `/api/reports/${reportId}/export?format=json`;
}

// Exportar un reporte a HTML
async function exportReportToHtml(reportId: string): Promise<string> {
  // Implementación temporal
  return `/api/reports/${reportId}/export?format=html`;
}

// Programar un reporte
export async function scheduleReport(
  config: ScheduledReportData,
  userId: string
): Promise<ScheduledReport> {
  // Validar la configuración del reporte
  validateReportConfig(config.reportConfig);
  
  // Calcular la próxima ejecución si no se proporciona
  if (!config.nextRunTime) {
    config.nextRunTime = calculateNextRunTime(config.frequency);
  }
  
  // Crear el reporte programado
  return await createScheduledReport({
    ...config,
    createdBy: userId,
  });
}

// Calcular la próxima ejecución de un reporte programado
export function calculateNextRunTime(frequency: ReportFrequency): number {
  const now = new Date();
  
  switch (frequency) {
    case ReportFrequency.DAILY:
      // Próximo día a la misma hora
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        now.getHours(),
        now.getMinutes()
      ).getTime();
    
    case ReportFrequency.WEEKLY:
      // Próxima semana, mismo día de la semana
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 7,
        now.getHours(),
        now.getMinutes()
      ).getTime();
    
    case ReportFrequency.MONTHLY:
      // Próximo mes, mismo día del mes
      return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes()
      ).getTime();
    
    case ReportFrequency.END_OF_SPRINT:
      // Este caso es especial y debe manejarse cuando se conoce el sprint
      // Por ahora, asumimos 2 semanas
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 14,
        now.getHours(),
        now.getMinutes()
      ).getTime();
    
    default:
      // Por defecto, programar para mañana
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        now.getHours(),
        now.getMinutes()
      ).getTime();
  }
}

// Ejecutar un reporte programado
export async function runScheduledReport(scheduledReportId: string): Promise<Report | null> {
  // Obtener el reporte programado
  const scheduledReport = await getScheduledReportById(scheduledReportId);
  if (!scheduledReport) {
    throw new Error(`Reporte programado con ID ${scheduledReportId} no encontrado`);
  }
  
  try {
    // Generar el reporte
    const report = await generateReport(
      scheduledReport.reportConfig,
      scheduledReport.createdBy
    );
    
    // Actualizar el reporte programado
    await updateScheduledReport(scheduledReportId, {
      lastRunTime: Date.now(),
      lastReportId: report.id,
      nextRunTime: calculateNextRunTime(scheduledReport.frequency),
    });
    
    return report;
  } catch (error) {
    console.error(`Error al ejecutar el reporte programado ${scheduledReportId}:`, error);
    return null;
  }
}

// Función auxiliar para obtener el historial de velocidad de un proyecto
// Esta función debe implementarse
async function getProjectVelocityHistory(projectId: string): Promise<unknown> {
  // Implementación temporal
  return [];
}
