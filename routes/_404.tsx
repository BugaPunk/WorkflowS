import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import { getSession } from "../utils/session.ts";
import { UserRole } from "../models/user.ts";

interface Error404PageData {
  session?: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export const handler: Handlers<Error404PageData> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    return ctx.render({ session });
  },
};

export default function Error404({ data }: PageProps<Error404PageData>) {
  const { session } = data;

  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <MainLayout title="404 - Page not found" session={session}>
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
