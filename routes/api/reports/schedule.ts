import { Handlers } from "$fresh/server.ts";
import { scheduleReport } from "@/services/reportService.ts";
import { requireAuth } from "@/utils/auth.ts";
import { ScheduledReportSchema } from "@/models/report.ts";

export const handler: Handlers = {
  /**
   * POST /api/reports/schedule
   * Programa un reporte para ejecución periódica
   */
  async POST(req, ctx) {
    // Verificar autenticación
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Obtener datos del cuerpo de la solicitud
      const body = await req.json();

      // Validar la configuración del reporte programado
      const result = ScheduledReportSchema.safeParse(body);
      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: "Configuración de reporte programado inválida",
            details: result.error.format(),
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Programar el reporte
      const scheduledReport = await scheduleReport(result.data, authResult.user.id);

      return new Response(JSON.stringify(scheduledReport), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al programar reporte:", error);
      return new Response(
        JSON.stringify({
          error: "Error al programar reporte",
          message: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
