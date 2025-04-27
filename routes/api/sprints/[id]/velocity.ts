import { Handlers } from "$fresh/server.ts";
import { getSprintById } from "@/models/sprint.ts";
import { calculateSprintVelocity } from "@/services/metricService.ts";
import { requireAuth } from "@/utils/auth.ts";

export const handler: Handlers = {
  /**
   * GET /api/sprints/:id/velocity
   * Obtiene la velocidad de un sprint
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

      // Calcular velocidad del sprint
      const velocity = await calculateSprintVelocity(id);

      return new Response(JSON.stringify({ velocity }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error al obtener velocidad del sprint ${id}:`, error);
      return new Response(
        JSON.stringify({ error: "Error al obtener velocidad del sprint" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
