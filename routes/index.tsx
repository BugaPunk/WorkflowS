import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>WorkflowS - Sistema de Gestión de Flujo de Trabajo</title>
      </Head>
      <div class="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <header class="bg-white shadow">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div class="flex items-center">
              <img
                class="h-10 w-auto"
                src="/logo.svg"
                alt="WorkflowS Logo"
              />
              <h1 class="ml-3 text-2xl font-bold text-gray-900">WorkflowS</h1>
            </div>
            <div class="flex space-x-4">
              <a
                href="/login"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
              >
                Iniciar Sesión
              </a>
              <a
                href="/register"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Registrarse
              </a>
            </div>
          </div>
        </header>
        <main>
          <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="text-center">
              <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Sistema de Gestión de Flujo de Trabajo
              </h2>
              <p class="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                Gestiona tus proyectos y tareas de manera eficiente con nuestro sistema de flujo de trabajo.
              </p>
              <div class="mt-10">
                <a
                  href="/register"
                  class="mx-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Comenzar Ahora
                </a>
                <a
                  href="#features"
                  class="mx-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                >
                  Conocer Más
                </a>
              </div>
            </div>

            <div id="features" class="py-12">
              <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h3 class="text-lg font-medium text-gray-900">Gestión de Proyectos</h3>
                  <p class="mt-2 text-base text-gray-500">
                    Crea y administra proyectos con facilidad, asignando tareas y siguiendo su progreso.
                  </p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h3 class="text-lg font-medium text-gray-900">Seguimiento de Tareas</h3>
                  <p class="mt-2 text-base text-gray-500">
                    Mantén un registro detallado de todas las tareas, con estados y fechas de vencimiento.
                  </p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h3 class="text-lg font-medium text-gray-900">Colaboración en Equipo</h3>
                  <p class="mt-2 text-base text-gray-500">
                    Trabaja en conjunto con tu equipo, asignando roles y responsabilidades.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer class="bg-white">
          <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p class="text-center text-gray-500 text-sm">
              &copy; 2025 WorkflowS. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
