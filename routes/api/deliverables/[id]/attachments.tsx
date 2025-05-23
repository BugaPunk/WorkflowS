import type { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../../utils/session.ts";
import { 
  getDeliverableById, 
  addAttachmentToDeliverable,
  removeAttachmentFromDeliverable
} from "../../../../models/deliverable.ts";
import { UserRole } from "../../../../models/user.ts";

export const handler: Handlers = {
  // POST /api/deliverables/:id/attachments - Añadir un archivo adjunto
  async POST(req, ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { id } = ctx.params;
    
    try {
      const deliverable = await getDeliverableById(id);
      
      if (!deliverable) {
        return new Response(JSON.stringify({ error: "Entregable no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Verificar permisos para añadir archivos
      const isAssigned = deliverable.assignedTo === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      
      // Solo el asignado o un admin puede añadir archivos
      if (!isAssigned && !isAdmin) {
        return new Response(JSON.stringify({ error: "No autorizado para añadir archivos a este entregable" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      const body = await req.json();
      
      // Validar datos mínimos
      if (!body.fileName || !body.fileType || !body.url) {
        return new Response(JSON.stringify({ error: "Datos de archivo incompletos" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Añadir el archivo adjunto
      const updatedDeliverable = await addAttachmentToDeliverable(
        id,
        {
          fileName: body.fileName,
          fileType: body.fileType,
          fileSize: body.fileSize || 0,
          uploadedBy: session.userId,
          uploadedAt: Date.now(),
          url: body.url,
        },
        session.userId
      );
      
      return new Response(JSON.stringify(updatedDeliverable), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
  
  // DELETE /api/deliverables/:id/attachments?attachmentId=xxx - Eliminar un archivo adjunto
  async DELETE(req, ctx) {
    const session = await getSession(req);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { id } = ctx.params;
    const url = new URL(req.url);
    const attachmentId = url.searchParams.get("attachmentId");
    
    if (!attachmentId) {
      return new Response(JSON.stringify({ error: "Se requiere attachmentId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    try {
      const deliverable = await getDeliverableById(id);
      
      if (!deliverable) {
        return new Response(JSON.stringify({ error: "Entregable no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Verificar permisos para eliminar archivos
      const isAssigned = deliverable.assignedTo === session.userId;
      const isAdmin = session.role === UserRole.ADMIN;
      
      // Solo el asignado o un admin puede eliminar archivos
      if (!isAssigned && !isAdmin) {
        return new Response(JSON.stringify({ error: "No autorizado para eliminar archivos de este entregable" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Verificar que el archivo existe
      const attachment = deliverable.attachments.find(a => a.id === attachmentId);
      
      if (!attachment) {
        return new Response(JSON.stringify({ error: "Archivo no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Verificar que el usuario puede eliminar este archivo específico
      const isUploader = attachment.uploadedBy === session.userId;
      
      if (!isUploader && !isAdmin) {
        return new Response(JSON.stringify({ error: "No autorizado para eliminar este archivo" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Eliminar el archivo adjunto
      const updatedDeliverable = await removeAttachmentFromDeliverable(
        id,
        attachmentId,
        session.userId
      );
      
      return new Response(JSON.stringify(updatedDeliverable), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
