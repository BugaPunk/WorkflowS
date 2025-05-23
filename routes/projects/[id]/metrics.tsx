import type { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getProjectById } from "@/models/project.ts";
import { getProjectSprints } from "@/models/sprint.ts";
import { requireAuth } from "@/utils/auth.ts";
import BurndownChart from "@/islands/Metrics/BurndownChart.tsx";
import TeamVelocityChart from "@/islands/Metrics/TeamVelocityChart.tsx";
import ProjectHealthGauge from "@/islands/Metrics/ProjectHealthGauge.tsx";
import WorkDistributionChart from "@/islands/Metrics/WorkDistributionChart.tsx";
import { MainLayout } from "@/layouts/MainLayout.tsx";

interface MetricsDashboardProps {
  project: {
    id: string;
    name: string;
  };
  sprints: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  activeSprint: {
    id: string;
    name: string;
  } | null;
}

export const handler: Handlers<MetricsDashboardProps> = {
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

      // Encontrar el sprint activo
      const activeSprint = sprints.find((sprint) => sprint.status === "active") || null;

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
        activeSprint: activeSprint
          ? {
              id: activeSprint.id,
              name: activeSprint.name || `Sprint ${activeSprint.id.substring(0, 6)}`,
            }
          : null,
      });
    } catch (error) {
      console.error(`Error al cargar métricas del proyecto ${id}:`, error);
      return ctx.renderNotFound();
    }
  },
};

export default function MetricsDashboard({ data }: PageProps<MetricsDashboardProps>) {
  const { project, sprints, activeSprint } = data;

  return (
    <>
      <Head>
        <title>Métricas del Proyecto | {project.name}</title>
      </Head>

      <MainLayout>
        <div class="container mx-auto py-6 px-4">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Métricas del Proyecto: {project.name}</h1>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Salud del proyecto */}
            <ProjectHealthGauge projectId={project.id} />

            {/* Velocidad del equipo */}
            <TeamVelocityChart projectId={project.id} />
          </div>

          {activeSprint && (
            <div class="mb-6">
              <h2 class="text-xl font-semibold mb-4">Sprint Actual: {activeSprint.name}</h2>

              <div class="bg-white p-4 rounded-lg shadow mb-6">
                <BurndownChart sprintId={activeSprint.id} width={800} />
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <WorkDistributionChart
                  projectId={project.id}
                  sprintId={activeSprint.id}
                  width={800}
                />
              </div>
            </div>
          )}

          {sprints.length > 0 && !activeSprint && (
            <div class="bg-white p-4 rounded-lg shadow mb-6">
              <div class="text-center py-8">
                <p class="text-gray-500">
                  No hay un sprint activo actualmente. Selecciona un sprint para ver sus métricas.
                </p>
              </div>
            </div>
          )}

          {sprints.length === 0 && (
            <div class="bg-white p-4 rounded-lg shadow mb-6">
              <div class="text-center py-8">
                <p class="text-gray-500">
                  No hay sprints en este proyecto. Crea un sprint para comenzar a recopilar métricas.
                </p>
              </div>
            </div>
          )}

          {sprints.length > 0 && (
            <div class="bg-white p-4 rounded-lg shadow">
              <h2 class="text-xl font-semibold mb-4">Sprints Anteriores</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sprints
                  .filter((sprint) => sprint.status === "completed")
                  .map((sprint) => (
                    <div
                      key={sprint.id}
                      class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <h3 class="font-medium mb-2">{sprint.name}</h3>
                      <div class="flex justify-between">
                        <a
                          href={`/projects/${project.id}/sprints/${sprint.id}/metrics`}
                          class="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Ver métricas
                        </a>
                      </div>
                    </div>
                  ))}
              </div>

              {sprints.filter((sprint) => sprint.status === "completed").length === 0 && (
                <div class="text-center py-4">
                  <p class="text-gray-500">
                    No hay sprints completados en este proyecto.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
