import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getProjectById } from "@/models/project.ts";
import { getProjectSprints } from "@/models/sprint.ts";
import { getProjectMembers } from "@/models/project.ts";
import { requireAuth } from "@/utils/auth.ts";
import { ReportType, ReportFormat } from "@/models/report.ts";
import { MainLayout } from "@/layouts/MainLayout.tsx";
import ReportGenerator from "@/islands/Reports/ReportGenerator.tsx";

interface GenerateReportProps {
  project: {
    id: string;
    name: string;
  };
  sprints: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  members: Array<{
    userId: string;
    userName: string;
    role: string;
  }>;
}

export const handler: Handlers<GenerateReportProps> = {
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

      // Obtener los sprints del proyecto
      const sprints = await getProjectSprints(id);

      // Obtener los miembros del proyecto
      const members = await getProjectMembers(id);

      return ctx.render({
        project: {
          id: project.id,
          name: project.name,
        },
        sprints: sprints.map((sprint) => ({
          id: sprint.id,
          name: sprint.name || `Sprint ${sprint.id.substring(0, 6)}`,
          status: sprint.status,
        })),
        members: members.map((member) => ({
          userId: member.userId,
          userName: member.userName || `Usuario ${member.userId.substring(0, 6)}`,
          role: member.role,
        })),
      });
    } catch (error) {
      console.error(`Error al cargar datos para generar reporte del proyecto ${id}:`, error);
      return ctx.renderNotFound();
    }
  },
};

export default function GenerateReportPage({ data }: PageProps<GenerateReportProps>) {
  const { project, sprints, members } = data;

  return (
    <>
      <Head>
        <title>Generar Reporte | {project.name}</title>
      </Head>

      <MainLayout>
        <div class="container mx-auto py-6 px-4">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Generar Reporte: {project.name}</h1>
          </div>

          <ReportGenerator
            projectId={project.id}
            sprints={sprints}
            members={members}
            reportTypes={Object.values(ReportType)}
            exportFormats={Object.values(ReportFormat)}
          />
        </div>
      </MainLayout>
    </>
  );
}
