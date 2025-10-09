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
      console.log('🔌 Conectando ao WebSocket...');
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketInstance.on('connect', () => {
        console.log('✅ WebSocket conectado:', socketInstance?.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ WebSocket desconectado');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Erro ao conectar WebSocket:', error.message);
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

