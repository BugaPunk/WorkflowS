import type { Handlers } from "$fresh/server.ts";
import { getSprintById } from "@/models/sprint.ts";
import { getSprintMetrics } from "@/models/sprintMetric.ts";
import { calculateBurndown } from "@/services/metricService.ts";
import { requireAuth } from "@/utils/auth.ts";

export const handler: Handlers = {
  /**
   * GET /api/sprints/:id/metrics
   * Obtiene las métricas de un sprint
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

    try {
      // Verificar que el sprint existe
      const sprint = await getSprintById(id);
      if (!sprint) {
        return new Response(JSON.stringify({ error: "Sprint no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Obtener métricas del sprint
      const metrics = await getSprintMetrics(id);

      // Si no hay métricas, calcularlas
      if (metrics.length === 0) {
        const burndownData = await calculateBurndown(id);
        return new Response(JSON.stringify(burndownData), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(metrics), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error al obtener métricas del sprint ${id}:`, error);
      return new Response(
        JSON.stringify({ error: "Error al obtener métricas del sprint" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
