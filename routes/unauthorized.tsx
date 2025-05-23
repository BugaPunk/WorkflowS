import type { Handlers, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import { getSession } from "../utils/session.ts";
import type { UserRole } from "../models/user.ts";
import UnauthorizedLogoutButton from "../islands/UnauthorizedLogoutButton.tsx";

interface UnauthorizedPageData {
  session?: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export const handler: Handlers<UnauthorizedPageData> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    // Convertir el tipo de session para que coincida con la interfaz UnauthorizedPageData
    const typedSession = session
      ? {
          userId: session.userId,
          username: session.username,
          email: session.email,
          role: session.role,
        }
      : undefined;

    return ctx.render({ session: typedSession });
  },
};

export default function Unauthorized({ data }: PageProps<UnauthorizedPageData>) {
  const { session } = data;

  return (
    <MainLayout title="No Autorizado - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-8 my-8 text-center">
            <h1 class="text-4xl font-bold text-red-600">Acceso No Autorizado</h1>
            <p class="my-4 text-gray-700">
              No tienes permisos suficientes para acceder a esta página.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <a
                href="/welcome"
                class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Volver al Inicio
              </a>
              <UnauthorizedLogoutButton />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
