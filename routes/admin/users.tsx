import { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import { UserRole, getAllUsers, User } from "../../models/user.ts";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);
    
    // Verificar si el usuario está autenticado
    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }
    
    // Verificar si el usuario es administrador
    if (session.role !== UserRole.ADMIN) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }
    
    try {
      // Obtener todos los usuarios
      const users = await getAllUsers();
      
      // Eliminar las contraseñas hash antes de enviar a la vista
      const safeUsers = users.map(user => {
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return ctx.render({ session, users: safeUsers });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return ctx.render({ session, users: [], error: "Error al cargar los usuarios" });
    }
  },
};

interface AdminUsersProps {
  session: {
    username: string;
    email: string;
    role: UserRole;
  };
  users: Omit<User, "passwordHash">[];
  error?: string;
}

export default function AdminUsers({ data }: { data: AdminUsersProps }) {
  const { session, users, error } = data;
  
  // Obtener el nombre de visualización del rol
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
  
  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <MainLayout title="Administración de Usuarios - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-xl mx-auto">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Administración de Usuarios</h1>
            <div>
              <a 
                href="/welcome" 
                class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
              >
                Volver al Inicio
              </a>
            </div>
          </div>
          
          {error && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          
          <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <div class="p-4 bg-blue-50 border-b border-blue-100">
              <h2 class="text-xl font-semibold text-blue-800">
                Usuarios Registrados ({users.length})
              </h2>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre de Usuario
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo Electrónico
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} class="px-6 py-4 text-center text-gray-500">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">{user.username}</div>
                          <div class="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">
                            {user.firstName || "-"} {user.lastName || ""}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === UserRole.ADMIN ? "bg-purple-100 text-purple-800" : ""}
                            ${user.role === UserRole.SCRUM_MASTER ? "bg-blue-100 text-blue-800" : ""}
                            ${user.role === UserRole.PRODUCT_OWNER ? "bg-green-100 text-green-800" : ""}
                            ${user.role === UserRole.TEAM_DEVELOPER ? "bg-yellow-100 text-yellow-800" : ""}
                          `}>
                            {getRoleDisplay(user.role)}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
