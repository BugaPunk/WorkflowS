import { Handlers } from "$fresh/server.ts";
import { getProjectById } from "@/models/project.ts";
import { calculateProjectHealth } from "@/services/metricService.ts";
import { requireAuth } from "@/utils/auth.ts";

export const handler: Handlers = {
  /**
   * GET /api/projects/:id/health
   * Obtiene la puntuación de salud de un proyecto
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
      // Verificar que el proyecto existe
      const project = await getProjectById(id);
      if (!project) {
        return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Calcular salud del proyecto
      const healthScore = await calculateProjectHealth(id);

      // Determinar el estado de salud
      let healthStatus = "critical";
      if (healthScore >= 80) {
        healthStatus = "excellent";
      } else if (healthScore >= 60) {
        healthStatus = "good";
      } else if (healthScore >= 40) {
        healthStatus = "fair";
      } else if (healthScore >= 20) {
        healthStatus = "poor";
      }

      return new Response(
        JSON.stringify({
          score: healthScore,
          status: healthStatus,
          timestamp: Date.now(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error(`Error al obtener salud del proyecto ${id}:`, error);
      return new Response(
        JSON.stringify({ error: "Error al obtener salud del proyecto" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
