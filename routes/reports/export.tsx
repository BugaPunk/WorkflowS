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

export default function ExportPage({ data }: PageProps<Data>) {
  const { session } = data;

  return (
    <MainLayout session={session} title="Exportar Datos">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Exportar Datos</h1>
          <p class="text-gray-600">
            Descarga reportes y datos en diferentes formatos
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Exportar Proyectos */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="bg-green-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Datos de Proyectos</h3>
                <p class="text-sm text-gray-600">Información completa de proyectos</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              Exporta información detallada de todos los proyectos, incluyendo progreso, tareas y equipos.
            </p>
            <div class="space-y-2">
              <button class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                📄 Exportar como PDF
              </button>
              <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                📊 Exportar como Excel
              </button>
              <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                📋 Exportar como CSV
              </button>
            </div>
          </div>

          {/* Exportar Usuarios */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="bg-purple-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Datos de Usuarios</h3>
                <p class="text-sm text-gray-600">Información de usuarios y actividad</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              Exporta datos de usuarios, roles, actividad y métricas de rendimiento.
            </p>
            <div class="space-y-2">
              <button class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                📄 Exportar como PDF
              </button>
              <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                📊 Exportar como Excel
              </button>
              <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                📋 Exportar como CSV
              </button>
            </div>
          </div>

          {/* Exportar Tareas */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="bg-orange-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Datos de Tareas</h3>
                <p class="text-sm text-gray-600">Información detallada de tareas</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              Exporta información de tareas, estados, asignaciones y tiempo invertido.
            </p>
            <div class="space-y-2">
              <button class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                📄 Exportar como PDF
              </button>
              <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                📊 Exportar como Excel
              </button>
              <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                📋 Exportar como CSV
              </button>
            </div>
          </div>

          {/* Exportar Evaluaciones */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="bg-red-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Datos de Evaluaciones</h3>
                <p class="text-sm text-gray-600">Calificaciones y rúbricas</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              Exporta evaluaciones, calificaciones, rúbricas y análisis de rendimiento.
            </p>
            <div class="space-y-2">
              <button class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                📄 Exportar como PDF
              </button>
              <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                📊 Exportar como Excel
              </button>
              <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                📋 Exportar como CSV
              </button>
            </div>
          </div>

          {/* Exportar Métricas */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="bg-blue-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Métricas y Reportes</h3>
                <p class="text-sm text-gray-600">Datos de rendimiento</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              Exporta métricas de rendimiento, estadísticas y análisis del sistema.
            </p>
            <div class="space-y-2">
              <button class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                📄 Exportar como PDF
              </button>
              <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                📊 Exportar como Excel
              </button>
              <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                📋 Exportar como CSV
              </button>
            </div>
          </div>

          {/* Exportar Todo */}
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="bg-gray-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Exportación Completa</h3>
                <p class="text-sm text-gray-600">Todos los datos del sistema</p>
              </div>
            </div>
            <p class="text-gray-700 mb-4">
              Exporta un respaldo completo de todos los datos del sistema.
            </p>
            <div class="space-y-2">
              <button class="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                💾 Respaldo Completo (ZIP)
              </button>
              <button class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                🗄️ Base de Datos (JSON)
              </button>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Funcionalidad en Desarrollo
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>
                  Las funciones de exportación están actualmente en desarrollo. 
                  Los botones mostrados son prototipos de la interfaz final.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div class="mt-8">
          <a
            href="/reports"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a Reportes
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
