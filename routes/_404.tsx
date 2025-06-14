import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import type { UserRole } from "../models/user.ts";
import { getSession } from "../utils/session.ts";

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
    // Verificar si es una solicitud de API
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const session = await getSession(req);
    // Convertir el tipo de session para que coincida con la interfaz Error404PageData
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
  
  // Manejar otros métodos HTTP para rutas de API
  async POST(req, _ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(null, { status: 404 });
  },
  
  async PUT(req, _ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(null, { status: 404 });
  },
  
  async DELETE(req, _ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(null, { status: 404 });
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
