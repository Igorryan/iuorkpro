import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const SOCKET_URL = Platform.select({
  ios: 'http://127.0.0.1:3333',
  android: 'http://10.0.2.2:3333',
  default: 'http://127.0.0.1:3333',
});

let socketInstance: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Criar instância única do socket
    if (!socketInstance) {
      console.log('🔌 [PRO-APP] Conectando ao WebSocket...');
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketInstance.on('connect', () => {
        console.log('✅ [PRO-APP] WebSocket conectado:', socketInstance?.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ [PRO-APP] WebSocket desconectado');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('[PRO-APP] Erro ao conectar WebSocket:', error.message);
      });

      // Adicionar listener para debug
      socketInstance.onAny((event, ...args) => {
        console.log(`📨 [PRO-APP] Evento recebido: ${event}`, args);
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Não desconectar aqui, manter conexão ativa
    };
  }, []);

  return socketRef.current;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export const SocketEvents = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  NEW_CHAT: 'new-chat',
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
};

