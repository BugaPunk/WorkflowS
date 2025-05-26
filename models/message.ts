import { z } from "zod";
import { type Model, createModel, getKv } from "../utils/db.ts";

// Colecciones para mensajes
export const MESSAGE_COLLECTIONS = {
  MESSAGES: ["messages"],
  CONVERSATIONS: ["conversations"],
  CONVERSATION_MEMBERS: ["conversation_members"],
  MESSAGES_BY_CONVERSATION: ["messages_by_conversation"],
  CONVERSATIONS_BY_USER: ["conversations_by_user"],
} as const;

// Esquema para archivos adjuntos en mensajes
export const MessageAttachmentSchema = z.object({
  id: z.string(),
  fileName: z.string().min(1, "El nombre del archivo es requerido"),
  fileType: z.string(),
  fileSize: z.number().min(0, "El tamaño debe ser mayor o igual a 0"),
  url: z.string().url("URL inválida"),
});

// Esquema para mensajes
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string().min(1, "El contenido del mensaje es requerido"),
  attachments: z.array(MessageAttachmentSchema).default([]),
  isRead: z.boolean().default(false),
  readBy: z.array(z.string()).default([]), // IDs de usuarios que han leído el mensaje
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Tipos de conversación
export enum ConversationType {
  DIRECT = "direct", // Conversación uno a uno
  GROUP = "group",   // Conversación grupal
  PROJECT = "project" // Conversación de proyecto
}

// Esquema para conversaciones
export const ConversationSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ConversationType),
  name: z.string().optional(), // Solo para grupos y proyectos
  description: z.string().optional(),
  projectId: z.string().optional(), // Si está asociada a un proyecto
  createdBy: z.string(),
  lastMessageId: z.string().optional(),
  lastMessageAt: z.number().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Esquema para miembros de conversación
export const ConversationMemberSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  userId: z.string(),
  joinedAt: z.number(),
  lastReadAt: z.number().optional(),
  isAdmin: z.boolean().default(false), // Para conversaciones grupales
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Tipos TypeScript
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationMember = z.infer<typeof ConversationMemberSchema>;

// Datos para crear un mensaje
export interface MessageData {
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: Omit<MessageAttachment, "id">[];
}

// Datos para crear una conversación
export interface ConversationData {
  type: ConversationType;
  name?: string;
  description?: string;
  projectId?: string;
  createdBy: string;
  memberIds: string[]; // IDs de los miembros iniciales
}

// Crear un nuevo mensaje
export async function createMessage(messageData: MessageData): Promise<Message> {
  const kv = getKv();
  
  // Crear attachments con IDs
  const attachments: MessageAttachment[] = messageData.attachments?.map(att => ({
    ...att,
    id: crypto.randomUUID(),
  })) || [];

  // Crear el modelo del mensaje
  const message = createModel<Omit<Message, keyof Model>>({
    conversationId: messageData.conversationId,
    senderId: messageData.senderId,
    content: messageData.content,
    attachments,
    isRead: false,
    readBy: [messageData.senderId], // El remitente ya lo ha "leído"
  });

  // Guardar el mensaje
  const messageKey = [...MESSAGE_COLLECTIONS.MESSAGES, message.id];
  await kv.set(messageKey, message);

  // Crear índice por conversación
  const conversationMessageKey = [
    ...MESSAGE_COLLECTIONS.MESSAGES_BY_CONVERSATION,
    messageData.conversationId,
    message.createdAt, // Usar timestamp para ordenación
    message.id
  ];
  await kv.set(conversationMessageKey, message.id);

  // Actualizar la conversación con el último mensaje
  await updateConversationLastMessage(messageData.conversationId, message.id, message.createdAt);

  return message;
}

// Crear una nueva conversación
export async function createConversation(conversationData: ConversationData): Promise<Conversation> {
  const kv = getKv();

  // Crear el modelo de la conversación
  const conversation = createModel<Omit<Conversation, keyof Model>>({
    type: conversationData.type,
    name: conversationData.name,
    description: conversationData.description,
    projectId: conversationData.projectId,
    createdBy: conversationData.createdBy,
    isActive: true,
  });

  // Guardar la conversación
  const conversationKey = [...MESSAGE_COLLECTIONS.CONVERSATIONS, conversation.id];
  await kv.set(conversationKey, conversation);

  // Agregar miembros a la conversación
  for (const userId of conversationData.memberIds) {
    await addConversationMember(conversation.id, userId, userId === conversationData.createdBy);
  }

  return conversation;
}

// Agregar un miembro a una conversación
export async function addConversationMember(
  conversationId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<ConversationMember> {
  const kv = getKv();

  // Crear el modelo del miembro
  const member = createModel<Omit<ConversationMember, keyof Model>>({
    conversationId,
    userId,
    joinedAt: Date.now(),
    isAdmin,
  });

  // Guardar el miembro
  const memberKey = [...MESSAGE_COLLECTIONS.CONVERSATION_MEMBERS, member.id];
  await kv.set(memberKey, member);

  // Crear índice por conversación
  const conversationMemberKey = [
    ...MESSAGE_COLLECTIONS.CONVERSATION_MEMBERS,
    "by_conversation",
    conversationId,
    userId
  ];
  await kv.set(conversationMemberKey, member.id);

  // Crear índice por usuario
  const userConversationKey = [
    ...MESSAGE_COLLECTIONS.CONVERSATIONS_BY_USER,
    userId,
    conversationId
  ];
  await kv.set(userConversationKey, conversationId);

  return member;
}

// Obtener una conversación por ID
export async function getConversationById(id: string): Promise<Conversation | null> {
  const kv = getKv();
  const result = await kv.get<Conversation>([...MESSAGE_COLLECTIONS.CONVERSATIONS, id]);
  return result.value;
}

// Obtener un mensaje por ID
export async function getMessageById(id: string): Promise<Message | null> {
  const kv = getKv();
  const result = await kv.get<Message>([...MESSAGE_COLLECTIONS.MESSAGES, id]);
  return result.value;
}

// Actualizar el último mensaje de una conversación
async function updateConversationLastMessage(
  conversationId: string,
  messageId: string,
  messageTimestamp: number
): Promise<void> {
  const kv = getKv();
  const conversation = await getConversationById(conversationId);
  
  if (conversation) {
    const updatedConversation: Conversation = {
      ...conversation,
      lastMessageId: messageId,
      lastMessageAt: messageTimestamp,
      updatedAt: Date.now(),
    };

    const conversationKey = [...MESSAGE_COLLECTIONS.CONVERSATIONS, conversationId];
    await kv.set(conversationKey, updatedConversation);
  }
}

// Obtener conversaciones de un usuario
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const kv = getKv();
  const conversations: Conversation[] = [];

  // Obtener IDs de conversaciones del usuario
  const conversationIds = kv.list<string>({
    prefix: [...MESSAGE_COLLECTIONS.CONVERSATIONS_BY_USER, userId],
  });

  for await (const entry of conversationIds) {
    const conversationId = entry.value;
    const conversation = await getConversationById(conversationId);
    if (conversation && conversation.isActive) {
      conversations.push(conversation);
    }
  }

  // Ordenar por último mensaje (más reciente primero)
  return conversations.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
}

// Obtener mensajes de una conversación
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  before?: number // timestamp para paginación
): Promise<Message[]> {
  const kv = getKv();
  const messages: Message[] = [];

  // Construir el prefijo para la búsqueda
  const prefix = [...MESSAGE_COLLECTIONS.MESSAGES_BY_CONVERSATION, conversationId];
  
  // Si hay un timestamp 'before', usarlo como punto de inicio
  const listOptions: Deno.KvListOptions = {
    prefix,
    limit,
    reverse: true, // Más recientes primero
  };

  if (before) {
    listOptions.end = [...prefix, before];
  }

  const messageIds = kv.list<string>(listOptions);

  for await (const entry of messageIds) {
    const messageId = entry.value;
    const message = await getMessageById(messageId);
    if (message) {
      messages.push(message);
    }
  }

  return messages.reverse(); // Devolver en orden cronológico
}
