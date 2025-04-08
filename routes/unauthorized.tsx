import { MainLayout } from "../layouts/MainLayout.tsx";

export default function Unauthorized() {
  return (
    <MainLayout title="No Autorizado - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-8 my-8 text-center">
            <h1 class="text-4xl font-bold text-red-600">Acceso No Autorizado</h1>
            <p class="my-4 text-gray-700">
              No tienes permisos suficientes para acceder a esta página.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <a href="/welcome" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Volver al Inicio
              </a>
              <a href="/logout" class="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Cerrar Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
