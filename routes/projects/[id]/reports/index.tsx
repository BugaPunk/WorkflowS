import type { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getProjectById } from "@/models/project.ts";
import { getProjectReports } from "@/models/report.ts";
import { getUserScheduledReports } from "@/models/report.ts";
import { requireAuth } from "@/utils/auth.ts";
import { MainLayout } from "@/layouts/MainLayout.tsx";
import ReportsList from "@/islands/Reports/ReportsList.tsx";

interface ReportsManagementProps {
  project: {
    id: string;
    name: string;
  };
  reports: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: number;
    createdBy: string;
    exportFormats: string[];
  }>;
  scheduledReports: Array<{
    id: string;
    title: string;
    frequency: string;
    nextRunTime: number;
    createdBy: string;
  }>;
}

export const handler: Handlers<ReportsManagementProps> = {
  async GET(req, ctx) {
    // Verificar autenticación
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return ctx.renderNotFound();
    }

    const { id } = ctx.params;

    try {
      // Obtener el proyecto
      const project = await getProjectById(id);
      if (!project) {
        return ctx.renderNotFound();
      }

      // Obtener los reportes del proyecto
      const reports = await getProjectReports(id);

      // Obtener los reportes programados del usuario
      const allScheduledReports = await getUserScheduledReports(authResult.user.id);

      // Filtrar los reportes programados para este proyecto
      const scheduledReports = allScheduledReports.filter(
        (report) => report.reportConfig.projectId === id
      );

      return ctx.render({
        project: {
          id: project.id,
          name: project.name,
        },
        reports: reports.map((report) => ({
          id: report.id,
          title: report.config.title,
          type: report.config.type,
          createdAt: report.generatedAt,
          createdBy: report.createdBy,
          exportFormats: report.exportFormats || [],
        })),
        scheduledReports: scheduledReports.map((report) => ({
          id: report.id,
          title: report.reportConfig.title,
          frequency: report.frequency,
          nextRunTime: report.nextRunTime,
          createdBy: report.createdBy,
        })),
      });
    } catch (error) {
      console.error(`Error al cargar reportes del proyecto ${id}:`, error);
      return ctx.renderNotFound();
    }
  },
};

export default function ReportsManagement({ data }: PageProps<ReportsManagementProps>) {
  const { project, reports, scheduledReports } = data;

  return (
    <>
      <Head>
        <title>Reportes | {project.name}</title>
      </Head>

      <MainLayout>
        <div class="container mx-auto py-6 px-4">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Reportes: {project.name}</h1>
            <a
              href={`/projects/${project.id}/reports/generate`}
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Generar Nuevo Reporte
            </a>
          </div>

          <ReportsList
            reports={reports}
            scheduledReports={scheduledReports}
            projectId={project.id}
          />
        </div>
      </MainLayout>
    </>
  );
}
