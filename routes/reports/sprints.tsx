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

export default function SprintsReportPage({ data }: PageProps<Data>) {
  const { session } = data;

  return (
    <MainLayout session={session} title="Métricas de Sprint">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Métricas de Sprint</h1>
          <p class="text-gray-600">
            Velocidad del equipo, burndown charts y análisis de sprints
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <div class="mb-6">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Métricas de Sprint</h3>
            <p class="text-gray-600 mb-6">
              Esta funcionalidad está en desarrollo. Pronto podrás ver:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">📈 Burndown Charts</h4>
              <p class="text-sm text-gray-600">
                Gráficos de progreso del sprint con trabajo restante vs tiempo
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">⚡ Velocidad del Equipo</h4>
              <p class="text-sm text-gray-600">
                Puntos de historia completados por sprint y tendencias
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">📊 Métricas de Calidad</h4>
              <p class="text-sm text-gray-600">
                Defectos encontrados, tiempo de resolución y satisfacción
              </p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">🎯 Cumplimiento de Objetivos</h4>
              <p class="text-sm text-gray-600">
                Porcentaje de objetivos del sprint alcanzados exitosamente
              </p>
            </div>
          </div>

          <div class="mt-8">
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
