import { Handlers } from "$fresh/server.ts";
import { recalculateBurndown } from "@/services/metricService.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    try {
      const sprintId = ctx.params.id;
      
      if (!sprintId) {
        return new Response(
          JSON.stringify({ error: "Sprint ID es requerido" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Recalcular el burndown desde cero
      const burndownData = await recalculateBurndown(sprintId);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Burndown recalculado exitosamente",
          data: burndownData 
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      console.error("Error recalculando burndown:", error);
      return new Response(
        JSON.stringify({ 
          error: "Error interno del servidor",
          details: error.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
