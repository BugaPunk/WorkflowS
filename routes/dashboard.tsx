import { Head } from "$fresh/runtime.ts";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - WorkflowS</title>
      </Head>
      <div class="min-h-screen bg-gray-100">
        <header class="bg-white shadow">
          <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
              <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4 flex items-center justify-center">
                <p class="text-xl text-gray-500">
                  ¡Bienvenido al Dashboard de WorkflowS!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
