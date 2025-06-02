import type { FreshContext, PageProps } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { User } from "../../models/user.ts";

interface Data {
  session: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };}

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    return ctx.render({ session });
  },
};

export default function EvaluationsReportPage({ data }: PageProps<Data>) {
  const { session } = data;

  return (
    <MainLayout session={session} title="Reporte de Evaluaciones">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Reporte de Evaluaciones</h1>
          <p class="text-gray-600">
            Resumen de evaluaciones, calificaciones y análisis de rúbricas
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <div class="mb-6">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Reporte de Evaluaciones</h3>
            <p class="text-gray-600 mb-6">
              Esta funcionalidad está en desarrollo. Pronto podrás ver:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">📊 Estadísticas Generales</h4>
              <p class="text-sm text-gray-600">
                Promedio de calificaciones, distribución de notas y tendencias
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">📋 Análisis de Rúbricas</h4>
              <p class="text-sm text-gray-600">
                Rendimiento por criterio y áreas de mejora identificadas
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">👥 Rendimiento por Estudiante</h4>
              <p class="text-sm text-gray-600">
                Progreso individual y comparación con el promedio del grupo
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">📈 Evolución Temporal</h4>
              <p class="text-sm text-gray-600">
                Mejora en calificaciones a lo largo del tiempo y proyectos
              </p>
            </div>
          </div>

          <div class="mt-8 space-x-4">
            <a
              href="/evaluations"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Ver Evaluaciones Existentes
            </a>
            <a
              href="/reports"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver a Reportes
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
