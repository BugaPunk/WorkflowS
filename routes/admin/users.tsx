import type { FreshContext } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { getSession } from "../../utils/session.ts";
import { UserRole, getAllUsers, type User } from "../../models/user.ts";
import AdminUsersList from "../../islands/AdminUsersList.tsx";

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
  const { users, session } = data;

  return (
    <MainLayout title="Administración de Usuarios - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-xl mx-auto">
          <AdminUsersList initialUsers={users} />
        </div>
      </div>
    </MainLayout>
  );
}
