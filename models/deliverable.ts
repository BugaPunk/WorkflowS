import { z } from "zod";
import { type Model, createModel, getKv } from "../utils/db.ts";
import { type Task, TaskSchema, TaskStatus } from "./task.ts";

// Colecciones para entregables
export const DELIVERABLE_COLLECTIONS = {
  DELIVERABLES: ["deliverables"],
  ATTACHMENTS: ["attachments"],
  DELIVERABLE_BY_TASK: ["deliverable_by_task"],
} as const;

// Esquema para archivos adjuntos
export const AttachmentSchema = z.object({
  id: z.string(),
  fileName: z.string().min(1, "El nombre del archivo es requerido"),
  fileType: z.string(),
  fileSize: z.number().min(0, "El tamaño debe ser mayor o igual a 0"),
  uploadedBy: z.string(),
  uploadedAt: z.number(),
  url: z.string().url("URL inválida"),
});

export type Attachment = z.infer<typeof AttachmentSchema>;

// Esquema para entregables (extiende el esquema de tarea)
export const DeliverableSchema = TaskSchema.extend({
  isDeliverable: z.literal(true),
  dueDate: z.number().optional(),
  attachments: z.array(AttachmentSchema).default([]),
  evaluationId: z.string().optional(),
  submissionInstructions: z.string().optional(),
  maxScore: z.number().optional(),
  submittedAt: z.number().optional(),
  submittedBy: z.string().optional(),
});

export type DeliverableData = z.infer<typeof DeliverableSchema>;
export type Deliverable = Model & DeliverableData;

// Crear un nuevo entregable
export async function createDeliverable(deliverableData: DeliverableData): Promise<Deliverable> {
  // Crear el modelo del entregable
  const deliverable = createModel<Omit<Deliverable, keyof Model>>({
    ...deliverableData,
    isDeliverable: true,
  });

  // Guardar el entregable en la base de datos
  const kv = getKv();

  // Guardar como tarea normal
  const taskKey = ["tasks", deliverable.id];
  await kv.set(taskKey, deliverable);

  // Guardar en la colección de entregables
  const deliverableKey = [...DELIVERABLE_COLLECTIONS.DELIVERABLES, deliverable.id];
  await kv.set(deliverableKey, deliverable);

  // Crear referencia para buscar entregable por tarea
  await kv.set([...DELIVERABLE_COLLECTIONS.DELIVERABLE_BY_TASK, deliverable.id], deliverable.id);

  return deliverable;
}

// Obtener un entregable por ID
export async function getDeliverableById(id: string): Promise<Deliverable | null> {
  const kv = getKv();
  const key = [...DELIVERABLE_COLLECTIONS.DELIVERABLES, id];
  const result = await kv.get<Deliverable>(key);
  return result.value;
}

// Verificar si una tarea es un entregable
export async function isTaskDeliverable(taskId: string): Promise<boolean> {
  const kv = getKv();
  const key = [...DELIVERABLE_COLLECTIONS.DELIVERABLE_BY_TASK, taskId];
  const result = await kv.get(key);
  return result.value !== null;
}

// Obtener entregable a partir de una tarea
export async function getDeliverableFromTask(task: Task): Promise<Deliverable | null> {
  if (!task.isDeliverable) {
    return null;
  }

  return getDeliverableById(task.id);
}

// Actualizar un entregable
export async function updateDeliverable(
  id: string,
  updateData: Partial<DeliverableData>,
  _userId?: string
): Promise<Deliverable | null> {
  const kv = getKv();

  // Obtener el entregable actual
  const deliverable = await getDeliverableById(id);
  if (!deliverable) {
    return null;
  }

  // Actualizar los campos
  const updatedDeliverable: Deliverable = {
    ...deliverable,
    ...updateData,
    isDeliverable: true, // Asegurar que sigue siendo un entregable
    updatedAt: Date.now(),
  };

  // Guardar el entregable actualizado
  const deliverableKey = [...DELIVERABLE_COLLECTIONS.DELIVERABLES, id];
  await kv.set(deliverableKey, updatedDeliverable);

  // También actualizar como tarea
  const taskKey = ["tasks", id];
  await kv.set(taskKey, updatedDeliverable);

  return updatedDeliverable;
}

// Añadir un archivo adjunto a un entregable
export async function addAttachmentToDeliverable(
  deliverableId: string,
  attachment: Omit<Attachment, "id">,
  userId: string
): Promise<Deliverable | null> {
  const deliverable = await getDeliverableById(deliverableId);
  if (!deliverable) {
    return null;
  }

  // Crear ID para el adjunto
  const attachmentWithId: Attachment = {
    ...attachment,
    id: crypto.randomUUID(),
  };

  // Añadir el adjunto a la lista
  const updatedAttachments = [...deliverable.attachments, attachmentWithId];

  // Actualizar el entregable
  return updateDeliverable(deliverableId, { attachments: updatedAttachments }, userId);
}

// Eliminar un archivo adjunto de un entregable
export async function removeAttachmentFromDeliverable(
  deliverableId: string,
  attachmentId: string,
  userId: string
): Promise<Deliverable | null> {
  const deliverable = await getDeliverableById(deliverableId);
  if (!deliverable) {
    return null;
  }

  // Filtrar el adjunto a eliminar
  const updatedAttachments = deliverable.attachments.filter(
    (attachment) => attachment.id !== attachmentId
  );

  // Si no se encontró el adjunto, no hacer cambios
  if (updatedAttachments.length === deliverable.attachments.length) {
    return deliverable;
  }

  // Actualizar el entregable
  return updateDeliverable(deliverableId, { attachments: updatedAttachments }, userId);
}

// Marcar un entregable como enviado
export async function submitDeliverable(
  deliverableId: string,
  userId: string
): Promise<Deliverable | null> {
  const deliverable = await getDeliverableById(deliverableId);
  if (!deliverable) {
    return null;
  }

  // Actualizar el entregable
  return updateDeliverable(
    deliverableId,
    {
      submittedAt: Date.now(),
      submittedBy: userId,
      status: TaskStatus.REVIEW, // Cambiar estado a "En revisión"
    },
    userId
  );
}
