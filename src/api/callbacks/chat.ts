import { api } from '@config/api';

export interface Chat {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  professional?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  service?: {
    id: string;
    title: string;
  };
  budget?: {
    id: string;
    status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    price: string;
    description: string | null;
    expiresAt: string | null;
  };
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  messageType: 'TEXT' | 'IMAGE' | 'AUDIO';
  mediaUrl: string | null;
  audioDuration: number | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CreateChatParams {
  clientId: string;
  professionalId: string;
  serviceId?: string | null;
}

export interface SendMessageParams {
  chatId: string;
  senderId: string;
  content?: string | null;
  messageType?: 'TEXT' | 'IMAGE' | 'AUDIO';
  mediaUrl?: string | null;
  audioDuration?: number | null;
}

export interface GetMessagesParams {
  chatId: string;
  limit?: number;
  offset?: number;
}

export interface MarkAsReadParams {
  chatId: string;
  userId: string;
}

/**
 * Verificar se chat existe (sem criar)
 */
export async function checkChatExists(params: CreateChatParams): Promise<Chat | null> {
  try {
    const { data } = await api.get<Chat>('/api/chats/check', {
      params,
    });
    return data;
  } catch (err) {
    // 404 é esperado se o chat não existir
    if ((err as any)?.response?.status === 404) {
      return null;
    }
    console.error('Error checking chat:', err);
    return null;
  }
}

/**
 * Criar ou obter chat existente
 */
export async function createOrGetChat(params: CreateChatParams): Promise<Chat | null> {
  try {
    const { data } = await api.post<Chat>('/api/chats', params);
    return data;
  } catch (err) {
    console.error('Error creating/getting chat:', err);
    return null;
  }
}

/**
 * Buscar chats de um usuário
 */
export async function getUserChats(userId: string, role: 'CLIENT' | 'PRO' = 'PRO'): Promise<Chat[]> {
  try {
    const { data } = await api.get<Chat[]>(`/api/chats/user/${userId}`, {
      params: { role },
    });
    return data;
  } catch (err) {
    console.error('Error fetching user chats:', err);
    return [];
  }
}

/**
 * Buscar mensagens de um chat
 */
export async function getMessages(params: GetMessagesParams): Promise<Message[]> {
  try {
    const { chatId, limit = 50, offset = 0 } = params;
    const { data } = await api.get<Message[]>(`/api/chats/${chatId}/messages`, {
      params: { limit, offset },
    });
    return data;
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
}

/**
 * Enviar mensagem
 */
export async function sendMessage(params: SendMessageParams): Promise<Message | null> {
  try {
    const { chatId, ...body } = params;
    const { data } = await api.post<Message>(`/api/chats/${chatId}/messages`, body);
    return data;
  } catch (err) {
    console.error('Error sending message:', err);
    return null;
  }
}

/**
 * Marcar mensagens como lidas
 */
export async function markAsRead(params: MarkAsReadParams): Promise<boolean> {
  try {
    const { chatId, userId } = params;
    await api.patch(`/api/chats/${chatId}/messages/read`, { userId });
    return true;
  } catch (err) {
    console.error('Error marking messages as read:', err);
    return false;
  }
}

/**
 * Deletar mensagem
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    await api.delete(`/api/messages/${messageId}`);
    return true;
  } catch (err) {
    console.error('Error deleting message:', err);
    return false;
  }
}

