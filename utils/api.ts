// HTTP status codes
export const Status = {
  OK: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  InternalServerError: 500,
  ServiceUnavailable: 503,
};

/**
 * Crea una respuesta JSON estandarizada
 * @param data Datos a incluir en la respuesta
 * @param status Código de estado HTTP
 * @returns Objeto Response con formato JSON
 */
export function jsonResponse(data: Record<string, unknown>, status = Status.OK): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Crea una respuesta de error estandarizada
 * @param message Mensaje de error
 * @param status Código de estado HTTP
 * @returns Objeto Response con formato JSON
 */
export function errorResponse(message: string, status = Status.BadRequest): Response {
  return jsonResponse({ message }, status);
}

/**
 * Crea una respuesta de éxito estandarizada
 * @param data Datos a incluir en la respuesta
 * @param message Mensaje de éxito opcional
 * @param status Código de estado HTTP
 * @returns Objeto Response con formato JSON
 */
export function successResponse(
  data: Record<string, unknown> = {},
  message?: string,
  status = Status.OK
): Response {
  const responseData = { ...data };
  if (message) {
    responseData.message = message;
  }
  return jsonResponse(responseData, status);
}

/**
 * Maneja errores de forma estandarizada
 * @param error Error a manejar
 * @returns Objeto Response con formato JSON
 */
export function handleApiError(error: unknown): Response {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Verificar si es un error de KV
    if (error.message.includes("KV is not initialized")) {
      return errorResponse("Servicio de base de datos no disponible", Status.ServiceUnavailable);
    }

    return errorResponse(error.message, Status.InternalServerError);
  }

  return errorResponse("Error interno del servidor", Status.InternalServerError);
}
