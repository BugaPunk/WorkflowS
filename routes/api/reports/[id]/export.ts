import { Handlers } from "$fresh/server.ts";
import { getReportById } from "@/models/report.ts";
import { exportReport } from "@/services/reportService.ts";
import { requireAuth } from "@/utils/auth.ts";
import { ReportFormat } from "@/models/report.ts";

export const handler: Handlers = {
  /**
   * GET /api/reports/:id/export
   * Exporta un reporte en el formato especificado
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
    const formatParam = url.searchParams.get("format") || "html";

    // Validar formato
    if (!Object.values(ReportFormat).includes(formatParam as ReportFormat)) {
      return new Response(
        JSON.stringify({
          error: "Formato no válido",
          validFormats: Object.values(ReportFormat),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const format = formatParam as ReportFormat;

    try {
      // Verificar que el reporte existe
      const report = await getReportById(id);
      if (!report) {
        return new Response(JSON.stringify({ error: "Reporte no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verificar que el usuario tiene permiso para exportar el reporte
      if (report.createdBy !== authResult.user.id) {
        // Aquí se podría implementar lógica adicional para permitir a ciertos roles
        // exportar reportes de otros usuarios
        return new Response(
          JSON.stringify({ error: "No tienes permiso para exportar este reporte" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Exportar el reporte
      const exportUrl = await exportReport(id, format);

      // Si es formato JSON, devolver directamente los datos
      if (format === ReportFormat.JSON) {
        return new Response(JSON.stringify(report.data), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Para otros formatos, devolver la URL de descarga
      return new Response(JSON.stringify({ url: exportUrl }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error al exportar reporte ${id}:`, error);
      return new Response(
        JSON.stringify({ error: "Error al exportar reporte", message: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
