import { useState, useEffect } from "preact/hooks";
import type { Session } from "../utils/session.ts";

/**
 * Hook personalizado para gestionar la sesión del usuario
 * @returns Un objeto con la sesión actual, el estado de carga y una función para recargar la sesión
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para verificar la sesión actual
  const checkSession = async () => {
    setLoading(true);
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

  // Verificar la sesión al montar el componente
  useEffect(() => {
    checkSession();
  }, []);

  // Verificar si tenemos una cookie de sesión (solo en el cliente)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasCookie = document.cookie.includes("sessionId=");
      if (hasCookie && !session) {
        // Tenemos una cookie pero aún no tenemos datos de sesión
        setLoading(true);
      }
    }
  }, [session]);

  return {
    session,
    loading,
    refreshSession: checkSession
  };
}
