import type { Handlers } from "$fresh/server.ts";
import { getProjectById } from "@/models/project.ts";
import { getProjectMetrics } from "@/models/projectMetric.ts";
import { calculateProjectMetrics } from "@/services/metricService.ts";
import { requireAuth } from "@/utils/auth.ts";

export const handler: Handlers = {
  /**
   * GET /api/projects/:id/metrics
   * Obtiene las métricas de un proyecto
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
    const refresh = url.searchParams.get("refresh") === "true";

    try {
      // Verificar que el proyecto existe
      const project = await getProjectById(id);
      if (!project) {
        return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Si se solicita actualizar las métricas o no hay métricas, calcularlas
      if (refresh) {
        const metrics = await calculateProjectMetrics(id);
        return new Response(JSON.stringify(metrics), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Obtener métricas del proyecto
      const metrics = await getProjectMetrics(id);

      // Si no hay métricas, calcularlas
      if (metrics.length === 0) {
        const newMetrics = await calculateProjectMetrics(id);
        return new Response(JSON.stringify(newMetrics), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(metrics), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error al obtener métricas del proyecto ${id}:`, error);
      return new Response(JSON.stringify({ error: "Error al obtener métricas del proyecto" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
