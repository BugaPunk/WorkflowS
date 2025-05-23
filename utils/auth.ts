import { type Session, getSession } from "./session.ts";

interface AuthResult {
  success: boolean;
  user?: Session;
  error?: string;
}

/**
 * Verifica si el usuario está autenticado
 * @param req Solicitud HTTP
 * @returns Resultado de la autenticación
 */
export async function requireAuth(req: Request): Promise<AuthResult> {
  try {
    const session = await getSession(req);

    if (!session) {
      return {
        success: false,
        error: "No autorizado. Debe iniciar sesión.",
      };
    }

    return {
      success: true,
      user: session,
    };
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return {
      success: false,
      error: "Error en la autenticación",
    };
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param req Solicitud HTTP
 * @param roles Roles permitidos
 * @returns Resultado de la autenticación
 */
export async function requireRole(req: Request, roles: string | string[]): Promise<AuthResult> {
  const authResult = await requireAuth(req);

  if (!authResult.success) {
    return authResult;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(authResult.user?.role)) {
    return {
      success: false,
      error: "No tiene permisos para acceder a este recurso",
    };
  }

  return authResult;
}

/**
 * Verifica si el usuario es propietario de un recurso
 * @param req Solicitud HTTP
 * @param ownerId ID del propietario del recurso
 * @returns Resultado de la autenticación
 */
export async function requireOwnership(req: Request, ownerId: string): Promise<AuthResult> {
  const authResult = await requireAuth(req);

  if (!authResult.success) {
    return authResult;
  }

  if (authResult.user?.userId !== ownerId) {
    return {
      success: false,
      error: "No tiene permisos para acceder a este recurso",
    };
  }

  return authResult;
}
