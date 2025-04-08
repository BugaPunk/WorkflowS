import { useState } from "preact/hooks";
import { UserRole } from "../models/user.ts";
import AdminCreateUserForm from "./AdminCreateUserForm.tsx";

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export default function AdminUsersList({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Función para cargar los usuarios desde el servidor
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/users");
      
      if (!response.ok) {
        throw new Error("Error al cargar los usuarios");
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError("Error al cargar los usuarios. Por favor, intenta de nuevo.");
      console.error("Error cargando usuarios:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para manejar la creación exitosa de un usuario
  const handleUserCreated = () => {
    loadUsers();
  };
  
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
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Administración de Usuarios</h1>
        <div class="flex space-x-2">
          <AdminCreateUserForm onUserCreated={handleUserCreated} />
          <a
            href="/welcome"
            class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
        <div class="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-blue-800">
            Usuarios Registrados ({users.length})
          </h2>
          {isLoading && (
            <div class="flex items-center text-blue-600">
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </div>
          )}
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
  );
}
