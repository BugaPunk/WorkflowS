import { Handlers } from "$fresh/server.ts";
import { generateReport } from "@/services/reportService.ts";
import { requireAuth } from "@/utils/auth.ts";
import { ReportConfigSchema } from "@/models/report.ts";

export const handler: Handlers = {
  /**
   * POST /api/reports/generate
   * Genera un nuevo reporte
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

      // Validar la configuración del reporte
      const result = ReportConfigSchema.safeParse(body);
      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: "Configuración de reporte inválida",
            details: result.error.format(),
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Generar el reporte
      const report = await generateReport(result.data, authResult.user.id);

      return new Response(JSON.stringify(report), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al generar reporte:", error);
      return new Response(
        JSON.stringify({ error: "Error al generar reporte", message: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
