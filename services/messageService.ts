import {
  type Conversation,
  type ConversationData,
  type Message,
  type MessageData,
  ConversationType,
  createConversation,
  createMessage,
  getConversationById,
  getConversationMessages,
  getUserConversations,
  MESSAGE_COLLECTIONS,
} from "../models/message.ts";
import { getUserById } from "../models/user.ts";
import { getKv } from "../utils/db.ts";

// Crear o obtener una conversación directa entre dos usuarios
export async function getOrCreateDirectConversation(
  userId1: string,
  userId2: string
): Promise<Conversation> {
  // Buscar si ya existe una conversación directa entre estos usuarios
  const existingConversation = await findDirectConversation(userId1, userId2);
  
  if (existingConversation) {
    return existingConversation;
  }

  // Crear nueva conversación directa
  const conversationData: ConversationData = {
    type: ConversationType.DIRECT,
    createdBy: userId1,
    memberIds: [userId1, userId2],
  };

  return await createConversation(conversationData);
}

// Buscar conversación directa existente entre dos usuarios
async function findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null> {
  const user1Conversations = await getUserConversations(userId1);
  
  for (const conversation of user1Conversations) {
    if (conversation.type === ConversationType.DIRECT) {
      const members = await getConversationMembers(conversation.id);
      const memberIds = members.map(m => m.userId);
      
      if (memberIds.includes(userId2) && memberIds.length === 2) {
        return conversation;
      }
    }
  }
  
  return null;
}

// Crear una conversación grupal
export async function createGroupConversation(
  creatorId: string,
  name: string,
  description: string,
  memberIds: string[],
  projectId?: string
): Promise<Conversation> {
  // Asegurar que el creador esté en la lista de miembros
  const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));

  const conversationData: ConversationData = {
    type: projectId ? ConversationType.PROJECT : ConversationType.GROUP,
    name,
    description,
    projectId,
    createdBy: creatorId,
    memberIds: allMemberIds,
  };

  return await createConversation(conversationData);
}

// Enviar un mensaje
export async function sendMessage(
  senderId: string,
  conversationId: string,
  content: string,
  attachments?: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
  }>
): Promise<Message | null> {
  // Verificar que el usuario es miembro de la conversación
  const isMember = await isUserConversationMember(senderId, conversationId);
  if (!isMember) {
    throw new Error("El usuario no es miembro de esta conversación");
  }

  // Verificar que la conversación existe y está activa
  const conversation = await getConversationById(conversationId);
  if (!conversation || !conversation.isActive) {
    throw new Error("La conversación no existe o no está activa");
  }

  const messageData: MessageData = {
    conversationId,
    senderId,
    content,
    attachments,
  };

  return await createMessage(messageData);
}

// Verificar si un usuario es miembro de una conversación
export async function isUserConversationMember(userId: string, conversationId: string): Promise<boolean> {
  const kv = getKv();
  
  const memberKey = [
    ...MESSAGE_COLLECTIONS.CONVERSATION_MEMBERS,
    "by_conversation",
    conversationId,
    userId
  ];
  
  const result = await kv.get(memberKey);
  return result.value !== null;
}

// Obtener miembros de una conversación
export async function getConversationMembers(conversationId: string): Promise<Array<{
  id: string;
  userId: string;
  joinedAt: number;
  isAdmin: boolean;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}>> {
  const kv = getKv();
  const members: Array<{
    id: string;
    userId: string;
    joinedAt: number;
    isAdmin: boolean;
    user?: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }> = [];

  // Obtener todos los miembros de la conversación
  const memberEntries = kv.list({
    prefix: [...MESSAGE_COLLECTIONS.CONVERSATION_MEMBERS, "by_conversation", conversationId],
  });

  for await (const entry of memberEntries) {
    const memberId = entry.value as string;
    const memberResult = await kv.get([...MESSAGE_COLLECTIONS.CONVERSATION_MEMBERS, memberId]);
    
    if (memberResult.value) {
      const member = memberResult.value as any;
      
      // Obtener información del usuario
      const user = await getUserById(member.userId);
      
      members.push({
        id: member.id,
        userId: member.userId,
        joinedAt: member.joinedAt,
        isAdmin: member.isAdmin,
        user: user ? {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        } : undefined,
      });
    }
  }

  return members.sort((a, b) => a.joinedAt - b.joinedAt);
}

// Obtener conversaciones de un usuario con información adicional
export async function getUserConversationsWithDetails(userId: string): Promise<Array<{
  conversation: Conversation;
  lastMessage?: Message;
  unreadCount: number;
  otherMembers: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  }>;
}>> {
  const conversations = await getUserConversations(userId);
  const conversationsWithDetails = [];

  for (const conversation of conversations) {
    // Obtener último mensaje
    let lastMessage: Message | undefined;
    if (conversation.lastMessageId) {
      const kv = getKv();
      const messageResult = await kv.get([...MESSAGE_COLLECTIONS.MESSAGES, conversation.lastMessageId]);
      lastMessage = messageResult.value as Message | undefined;
    }

    // Obtener miembros (excluyendo al usuario actual)
    const allMembers = await getConversationMembers(conversation.id);
    const otherMembers = allMembers
      .filter(member => member.userId !== userId && member.user)
      .map(member => ({
        id: member.user!.id,
        username: member.user!.username,
        firstName: member.user!.firstName,
        lastName: member.user!.lastName,
      }));

    // Calcular mensajes no leídos (implementación básica)
    const unreadCount = await getUnreadMessageCount(userId, conversation.id);

    conversationsWithDetails.push({
      conversation,
      lastMessage,
      unreadCount,
      otherMembers,
    });
  }

  return conversationsWithDetails;
}

// Obtener mensajes de una conversación con validación de permisos
export async function getMessagesForUser(
  userId: string,
  conversationId: string,
  limit: number = 50,
  before?: number
): Promise<Message[]> {
  // Verificar que el usuario es miembro de la conversación
  const isMember = await isUserConversationMember(userId, conversationId);
  if (!isMember) {
    throw new Error("No tienes permisos para ver los mensajes de esta conversación");
  }

  return await getConversationMessages(conversationId, limit, before);
}

// Contar mensajes no leídos (implementación básica)
async function getUnreadMessageCount(userId: string, conversationId: string): Promise<number> {
  // Esta es una implementación básica
  // En una implementación completa, se debería trackear el último mensaje leído por usuario
  const kv = getKv();
  
  // Obtener información del miembro para saber cuándo se unió
  const memberKey = [
    ...MESSAGE_COLLECTIONS.CONVERSATION_MEMBERS,
    "by_conversation",
    conversationId,
    userId
  ];
  
  const memberResult = await kv.get(memberKey);
  if (!memberResult.value) {
    return 0;
  }

  // Por ahora, retornamos 0 (se implementaría el tracking real más adelante)
  return 0;
}

// Marcar mensajes como leídos
export async function markMessagesAsRead(
  userId: string,
  conversationId: string,
  messageIds: string[]
): Promise<void> {
  // Verificar que el usuario es miembro de la conversación
  const isMember = await isUserConversationMember(userId, conversationId);
  if (!isMember) {
    throw new Error("No tienes permisos para marcar mensajes en esta conversación");
  }

  const kv = getKv();

  // Actualizar cada mensaje para incluir al usuario en la lista de "leído por"
  for (const messageId of messageIds) {
    const messageResult = await kv.get([...MESSAGE_COLLECTIONS.MESSAGES, messageId]);
    if (messageResult.value) {
      const message = messageResult.value as Message;
      
      if (!message.readBy.includes(userId)) {
        const updatedMessage: Message = {
          ...message,
          readBy: [...message.readBy, userId],
          updatedAt: Date.now(),
        };

        await kv.set([...MESSAGE_COLLECTIONS.MESSAGES, messageId], updatedMessage);
      }
    }
  }
}

// Obtener nombre de conversación para mostrar
export function getConversationDisplayName(
  conversation: Conversation,
  currentUserId: string,
  otherMembers: Array<{ firstName: string; lastName: string; username: string }>
): string {
  if (conversation.type === ConversationType.DIRECT) {
    // Para conversaciones directas, mostrar el nombre del otro usuario
    if (otherMembers.length > 0) {
      const otherUser = otherMembers[0];
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }
    return "Conversación directa";
  }

  // Para grupos y proyectos, usar el nombre definido
  return conversation.name || "Conversación grupal";
}
