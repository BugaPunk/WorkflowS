import { useEffect, useState } from "preact/hooks";
import { Session } from "../utils/session.ts";
import { UserRole } from "../models/user.ts";

export default function HeaderMenu() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by making a request to the server
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Check if we have a session cookie (client-side only)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasCookie = document.cookie.includes("sessionId=");
      if (hasCookie && !session) {
        // We have a cookie but no session data yet
        setLoading(true);
      }
    }
  }, [session]);

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
