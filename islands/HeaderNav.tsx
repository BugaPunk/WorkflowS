import { useSession } from "../hooks/useSession.ts";

export default function HeaderNav() {
  const { session, loading } = useSession();

  return (
    <div class="flex items-center space-x-4">
      {loading ? (
        // Show loading state
        <div class="w-24 h-10 bg-blue-500 rounded-md animate-pulse"></div>
      ) : session ? (
        // User is logged in
        <div class="flex items-center space-x-4">
          <a
            href="/welcome"
            class="text-white hover:underline"
          >
            {session.username}
          </a>
          <a
            href="/logout"
            class="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Salir
          </a>
        </div>
      ) : (
        // User is not logged in
        <div class="flex items-center space-x-4">
          <a
            href="/login"
            class="text-white hover:underline"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            class="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Registrarse
          </a>
        </div>
      )}
    </div>
  );
}
