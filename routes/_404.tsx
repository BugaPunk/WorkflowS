import { Head } from "$fresh/runtime.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <MainLayout title="404 - Page not found">
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
            <div class="bg-red-50 border border-red-200 rounded-lg p-8 my-8 text-center">
              <h1 class="text-4xl font-bold text-red-600">404 - Page not found</h1>
              <p class="my-4 text-gray-700">Esta pagina no existe :v</p>
              <a
                href="/"
                class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Regresar al inicio
              </a>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
