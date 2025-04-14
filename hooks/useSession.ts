import { useState, useEffect, useCallback } from "preact/hooks";
import type { Session } from "../utils/session.ts";
import { UserRole } from "../models/user.ts";

// Interfaz para los permisos del usuario basados en su rol
interface UserPermissions {
  canViewBacklog: boolean;
  canManageUsers: boolean;
  isAdmin: boolean;
  isProductOwner: boolean;
  isScrumMaster: boolean;
  isTeamDeveloper: boolean;
}

/**
 * Hook personalizado para gestionar la sesión del usuario
 * @returns Un objeto con la sesión actual, el estado de carga y una función para recargar la sesión
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para verificar la sesión actual (memoizada para evitar recreaciones)
  const checkSession = useCallback(async () => {
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
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        setSession(null);
        // Redirigir a la página de inicio
        globalThis.location.href = "/";
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  // Calcular permisos basados en el rol del usuario
  const permissions: UserPermissions = {
    canViewBacklog: session?.role === UserRole.ADMIN ||
                   session?.role === UserRole.PRODUCT_OWNER ||
                   session?.role === UserRole.SCRUM_MASTER,
    canManageUsers: session?.role === UserRole.ADMIN,
    isAdmin: session?.role === UserRole.ADMIN,
    isProductOwner: session?.role === UserRole.PRODUCT_OWNER,
    isScrumMaster: session?.role === UserRole.SCRUM_MASTER,
    isTeamDeveloper: session?.role === UserRole.TEAM_DEVELOPER
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
    refreshSession: checkSession,
    logout,
    permissions,
    isAuthenticated: !!session
  };
}
