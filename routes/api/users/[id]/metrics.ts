import type { Handlers } from "$fresh/server.ts";
import { getUserById } from "@/models/user.ts";
import { getUserMetrics } from "@/models/userMetric.ts";
import { calculateUserContributions } from "@/services/metricService.ts";
import { requireAuth } from "@/utils/auth.ts";

export const handler: Handlers = {
  /**
   * GET /api/users/:id/metrics
   * Obtiene las métricas de un usuario
   */
  async GET(req, ctx) {
    // Verificar autenticación
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = ctx.params;
    const url = new URL(req.url);
    const sprintId = url.searchParams.get("sprintId");

    try {
      // Verificar que el usuario existe
      const user = await getUserById(id);
      if (!user) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Si se proporciona un ID de sprint, calcular métricas para ese sprint
      if (sprintId) {
        const metrics = await calculateUserContributions(id, sprintId);
        return new Response(JSON.stringify(metrics), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Si no se proporciona un ID de sprint, obtener todas las métricas del usuario
      const metrics = await getUserMetrics(id);

      return new Response(JSON.stringify(metrics), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error al obtener métricas del usuario ${id}:`, error);
      return new Response(JSON.stringify({ error: "Error al obtener métricas del usuario" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
