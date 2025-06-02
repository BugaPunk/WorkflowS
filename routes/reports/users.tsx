import type { FreshContext, PageProps } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getAllUsers } from "../../models/user.ts";

interface Data {
  session: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    tasksAssigned: number;
    tasksCompleted: number;
    lastActivity: number;
    productivity: number;
  }>;
}

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    // Obtener usuarios con datos simulados
    const allUsers = await getAllUsers();
    const users = allUsers.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      tasksAssigned: Math.floor(Math.random() * 10) + 5, // 5-15 tareas
      tasksCompleted: Math.floor(Math.random() * 8) + 3, // 3-11 completadas
      lastActivity: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000), // Última semana
      productivity: Math.floor(Math.random() * 30) + 70 // 70-100%
    }));

    return ctx.render({ session, users });
  },
};

function getRoleText(role: string): string {
  switch (role) {
    case "admin":
      return "Administrador";
    case "product_owner":
      return "Product Owner";
    case "scrum_master":
      return "Scrum Master";
    case "team_developer":
      return "Desarrollador";
    default:
      return role;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800";
    case "product_owner":
      return "bg-purple-100 text-purple-800";
    case "scrum_master":
      return "bg-blue-100 text-blue-800";
    case "team_developer":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function UsersReportPage({ data }: PageProps<Data>) {
  const { session, users } = data;

  const totalUsers = users.length;
  const activeUsers = users.filter(u => (Date.now() - u.lastActivity) < (7 * 24 * 60 * 60 * 1000)).length;
  const averageProductivity = Math.round(users.reduce((sum, u) => sum + u.productivity, 0) / users.length);
  const totalTasks = users.reduce((sum, u) => sum + u.tasksAssigned, 0);

  return (
    <MainLayout session={session} title="Reporte de Usuarios">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Reporte de Usuarios</h1>
          <p class="text-gray-600">
            Actividad y rendimiento de todos los usuarios del sistema
          </p>
        </div>

        {/* Resumen de métricas */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-blue-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p class="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-green-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p class="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-purple-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Productividad Promedio</p>
                <p class="text-2xl font-bold text-gray-900">{averageProductivity}%</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-orange-100 p-3 rounded-lg">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Tareas</p>
                <p class="text-2xl font-bold text-gray-900">{totalTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Detalle de Usuarios</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tareas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productividad
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actividad
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                        <div class="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(u.role)}`}>
                        {getRoleText(u.role)}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {u.tasksCompleted}/{u.tasksAssigned}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div class="bg-green-600 h-2 rounded-full" style={`width: ${u.productivity}%`}></div>
                        </div>
                        <span class="text-sm text-gray-900">{u.productivity}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(u.lastActivity)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href={`/admin/users?id=${u.id}`} class="text-blue-600 hover:text-blue-900">
                        Ver Perfil
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botones de acción */}
        <div class="mt-8 flex justify-between">
          <a
            href="/reports"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a Reportes
          </a>
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onclick="window.print()"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimir Reporte
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
