import { UserRole } from "../models/user.ts";
import { useSession } from "../hooks/useSession.ts";

export default function HeaderMenu() {
  const { session, loading } = useSession();

  // Determinar la URL de inicio según si el usuario está autenticado
  const homeUrl = session ? "/welcome" : "/";

  // Mostrar un indicador de carga mientras se verifica la sesión
  if (loading) {
    return (
      <nav>
        <ul class="flex space-x-6">
          <li><a href="/" class="hover:underline">Inicio</a></li>
        </ul>
      </nav>
    );
  }

  return (
    <nav>
      <ul class="flex space-x-6">
        <li><a href={homeUrl} class="hover:underline">Inicio</a></li>
        <li><a href="/projects" class="hover:underline">Proyectos</a></li>
        {session && (session.role === UserRole.PRODUCT_OWNER || session.role === UserRole.ADMIN || session.role === UserRole.SCRUM_MASTER) && (
          <li><a href="/backlog" class="hover:underline">Backlog</a></li>
        )}
        {session && session.role === UserRole.ADMIN && (
          <li><a href="/admin/users" class="hover:underline">Usuarios</a></li>
        )}
        <li><a href="/about" class="hover:underline">Acerca de</a></li>
      </ul>
    </nav>
  );
}
