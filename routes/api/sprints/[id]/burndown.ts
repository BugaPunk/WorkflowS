import type { Handlers } from "$fresh/server.ts";
import { getSprintById } from "@/models/sprint.ts";
import { calculateBurndown } from "@/services/metricService.ts";
import { requireAuth } from "@/utils/auth.ts";

export const handler: Handlers = {
  /**
   * GET /api/sprints/:id/burndown
   * Obtiene los datos de burndown de un sprint
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

      // Calcular datos de burndown
      const burndownData = await calculateBurndown(id);

      // Formatear los datos para el gráfico
      const formattedData = burndownData.map((metric) => ({
        date: new Date(metric.date).toISOString().split("T")[0],
        remaining: metric.remainingPoints,
        ideal: metric.idealBurndown,
        completed: metric.completedPoints,
      }));

      return new Response(JSON.stringify(formattedData), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error al obtener burndown del sprint ${id}:`, error);
      return new Response(
        JSON.stringify({ error: "Error al obtener burndown del sprint" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
