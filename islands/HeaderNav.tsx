import { useEffect, useState } from "preact/hooks";
import { Session } from "../utils/session.ts";

export default function HeaderNav() {
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
