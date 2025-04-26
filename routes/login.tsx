import { MainLayout } from "../layouts/MainLayout.tsx";
import LoginForm from "../islands/LoginForm.tsx";
import { getSession } from "../utils/session.ts";
import type { FreshContext } from "$fresh/server.ts";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    // Si el usuario ya está autenticado, redirigir a la página de bienvenida
    if (session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/welcome",
        },
      });
    }

    return ctx.render({ session });
  },
};

export default function Login({ data }: { data: { session: unknown } }) {
  const { session } = data;

  return (
    <MainLayout title="Iniciar Sesión - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-md mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h1>

          <LoginForm />

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              ¿No tienes una cuenta?{" "}
              <a href="/register" class="text-blue-600 hover:underline">
                Registrarse
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
