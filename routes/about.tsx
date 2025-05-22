import { Handlers, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import { getSession } from "../utils/session.ts";
import { UserRole } from "../models/user.ts";

interface AboutPageData {
  session?: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export const handler: Handlers<AboutPageData> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    return ctx.render({ session });
  },
};

export default function About({ data }: PageProps<AboutPageData>) {
  const { session } = data;
  
  return (
    <MainLayout title="Acerca de - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto">
          <h1 class="text-4xl font-bold mb-6">Acerca de WorkflowS</h1>

          <div class="prose lg:prose-xl">
            <p class="mb-4">
              WorkflowS es una plataforma moderna de gestión de proyectos diseñada específicamente para equipos que utilizan la metodología Scrum.
              Nuestra plataforma facilita la colaboración, el seguimiento del progreso y la gestión eficiente de proyectos ágiles.
            </p>

            <h2 class="text-2xl font-semibold mt-6 mb-3">Metodología Scrum</h2>
            <p class="mb-4">
              Scrum es un marco de trabajo ágil que permite a los equipos abordar problemas complejos de manera adaptativa,
              entregando productos de alto valor de forma incremental y colaborativa.
            </p>

            <h2 class="text-2xl font-semibold mt-6 mb-3">Características Principales</h2>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Gestión de Proyectos</strong> - Crea y administra múltiples proyectos Scrum</li>
              <li><strong>Roles Específicos</strong> - Funcionalidades adaptadas para Product Owners, Scrum Masters y Desarrolladores</li>
              <li><strong>Historias de Usuario</strong> - Crea, prioriza y gestiona historias de usuario</li>
              <li><strong>Sprints</strong> - Planifica y realiza seguimiento de sprints</li>
              <li><strong>Backlog</strong> - Administra el backlog del producto</li>
              <li><strong>Colaboración</strong> - Facilita la comunicación entre los miembros del equipo</li>
            </ul>

            <h2 class="text-2xl font-semibold mt-6 mb-3">Tecnologías Utilizadas</h2>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Deno</strong> - Un entorno de ejecución seguro para JavaScript y TypeScript</li>
              <li><strong>Fresh</strong> - Un framework web de última generación para Deno</li>
              <li><strong>Preact</strong> - Una alternativa ligera a React con la misma API</li>
              <li><strong>Tailwind CSS</strong> - Un framework CSS basado en utilidades</li>
              <li><strong>Deno KV</strong> - Base de datos de clave-valor para almacenamiento persistente</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
