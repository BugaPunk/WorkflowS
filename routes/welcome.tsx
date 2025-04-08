import { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import { getSession } from "../utils/session.ts";
import { UserRole } from "../models/user.ts";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }

    return ctx.render({ session });
  },
};

interface WelcomeProps {
  session: {
    username: string;
    email: string;
    role: UserRole;
  };
}

export default function Welcome({ data }: { data: WelcomeProps }) {
  const { session } = data;

  // Get role display name
  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrador";
      case UserRole.SCRUM_MASTER:
        return "Scrum Master";
      case UserRole.PRODUCT_OWNER:
        return "Product Owner";
      case UserRole.TEAM_DEVELOPER:
        return "Desarrollador de Equipo";
      default:
        return role;
    }
  };

  return (
    <MainLayout title="Bienvenido - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto">
          <div class="bg-white shadow-md rounded-lg p-8 my-8">
            <h1 class="text-3xl font-bold text-blue-600 mb-6">¡Bienvenido, {session.username}!</h1>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 class="text-lg font-semibold text-blue-800 mb-2">Información de tu cuenta</h2>
              <ul class="space-y-2 text-gray-700">
                <li><strong>Nombre de usuario:</strong> {session.username}</li>
                <li><strong>Correo electrónico:</strong> {session.email}</li>
                <li><strong>Rol:</strong> {getRoleDisplay(session.role)}</li>
              </ul>
            </div>

            <div class="mt-6">
              <h2 class="text-xl font-semibold mb-4">¿Qué puedes hacer ahora?</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.role === UserRole.ADMIN && (
                  <>
                    <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 class="font-bold text-lg mb-2">Administrar Usuarios</h3>
                      <p class="text-gray-600 mb-3">Visualiza y gestiona todos los usuarios registrados en el sistema.</p>
                      <a href="/admin/users" class="text-purple-600 hover:underline">Ir a administración →</a>
                    </div>

                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 class="font-bold text-lg mb-2">Gestionar Proyectos</h3>
                      <p class="text-gray-600 mb-3">Crea y asigna proyectos a los miembros del equipo.</p>
                      <a href="/projects" class="text-blue-600 hover:underline">Ir a proyectos →</a>
                    </div>
                  </>
                )}

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 class="font-bold text-lg mb-2">Explorar el sistema</h3>
                  <p class="text-gray-600 mb-3">Descubre todas las funcionalidades disponibles para tu rol.</p>
                  <a href="#" class="text-blue-600 hover:underline">Comenzar exploración →</a>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 class="font-bold text-lg mb-2">Completar tu perfil</h3>
                  <p class="text-gray-600 mb-3">Añade más información a tu perfil para mejorar tu experiencia.</p>
                  <a href="#" class="text-blue-600 hover:underline">Editar perfil →</a>
                </div>
              </div>
            </div>

            <div class="mt-8 text-center">
              <a
                href="/logout"
                class="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
