import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import {
  createOrGetChat,
  sendMessage as apiSendMessage,
  getMessages as apiGetMessages,
  markAsRead as apiMarkAsRead,
  deleteMessage as apiDeleteMessage,
  Message as APIMessage,
  Chat,
} from '@api/callbacks/chat';
import { useSocket, SocketEvents } from './useSocket';

export interface ChatMessage {
  id: string;
  text?: string;
  audioUrl?: string;
  audioUri?: string;
  audioDuration?: number;
  imageUrl?: string;
  imageUri?: string;
  time: string;
  isMine: boolean;
  timestamp: number;
}

interface UseChatProps {
  clientId: string;
  serviceId: string;
  userId: string; // ID do profissional logado
  chatId?: string; // ID do chat específico (opcional)
}

export const useChat = ({ clientId, serviceId, userId, chatId: providedChatId }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [chatId, setChatId] = useState<string | null>(providedChatId || null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socket = useSocket();

  // Inicializar chat e buscar mensagens
  useEffect(() => {
    initializeChat();
    
    // Profissional entra na sala de notificações gerais
    if (socket && userId) {
      socket.emit('join-professional', userId);
      console.log('💼 Profissional conectado para notificações:', userId);
    }
  }, [clientId, serviceId, userId, socket]);

  // WebSocket: Entrar na sala do chat e ouvir novas mensagens
  useEffect(() => {
    if (chatId && socket) {
      // Marcar como lido ao abrir o chat
      apiMarkAsRead({ chatId, userId });
      
      // Entrar na sala do chat
      socket.emit('join-chat', chatId);
      console.log('📥 Entrou na sala do chat:', chatId);

      // Handler para novas mensagens
      const handleNewMessage = (newMessage: APIMessage) => {
        console.log('🔔 Nova mensagem recebida:', newMessage);
        
        // Não adicionar se for minha própria mensagem (já foi adicionada otimisticamente)
        if (newMessage.senderId === userId) {
          setMessages((prev) => 
            prev.map(msg => 
              msg.timestamp === newMessage.createdAt ? convertAPIMessageToLocal(newMessage) : msg
            )
          );
          return;
        }
        
        // Adicionar mensagem de outro usuário
        const formattedMessage = convertAPIMessageToLocal(newMessage);
        setMessages((prev) => {
          // Evitar duplicatas verificando ID
          if (prev.find(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, formattedMessage];
        });
      };

      // Ouvir novas mensagens em tempo real
      socket.on(SocketEvents.NEW_MESSAGE, handleNewMessage);

      return () => {
        // Sair da sala ao desmontar
        socket.emit('leave-chat', chatId);
        socket.off(SocketEvents.NEW_MESSAGE, handleNewMessage);
        console.log('📤 Saiu da sala do chat:', chatId);
      };
    }
  }, [chatId, socket, userId]);

  const initializeChat = async () => {
    try {
      setIsLoadingChat(true);
      
      // Se chatId foi fornecido, usar ele diretamente
      if (providedChatId) {
        console.log('💬 [PRO-CHAT] Usando chatId fornecido:', providedChatId);
        setChatId(providedChatId);
        await fetchMessages(providedChatId);
        return;
      }
      
      // Caso contrário, buscar/criar chat
      const chat = await createOrGetChat({
        clientId,
        professionalId: userId,
        serviceId,
      });

      if (chat) {
        setChatId(chat.id);
        await fetchMessages(chat.id);
      }
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o chat.');
    } finally {
      setIsLoadingChat(false);
    }
  };

  const fetchMessages = async (id?: string) => {
    const currentChatId = id || chatId;
    if (!currentChatId) return;

    try {
      const apiMessages = await apiGetMessages({ chatId: currentChatId });
      const formattedMessages = apiMessages.map(convertAPIMessageToLocal);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  // Converter mensagem da API para formato local
  const convertAPIMessageToLocal = (apiMsg: APIMessage): ChatMessage => {
    const date = new Date(apiMsg.createdAt);
    return {
      id: apiMsg.id,
      text: apiMsg.messageType === 'TEXT' ? apiMsg.content || undefined : undefined,
      audioUrl: apiMsg.messageType === 'AUDIO' ? apiMsg.mediaUrl || undefined : undefined,
      audioUri: apiMsg.messageType === 'AUDIO' ? apiMsg.mediaUrl || undefined : undefined,
      audioDuration: apiMsg.audioDuration || undefined,
      imageUrl: apiMsg.messageType === 'IMAGE' ? apiMsg.mediaUrl || undefined : undefined,
      imageUri: apiMsg.messageType === 'IMAGE' ? apiMsg.mediaUrl || undefined : undefined,
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isMine: apiMsg.senderId === userId,
      timestamp: date.getTime(),
    };
  };

  const generateMessageId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Enviar mensagem de texto
  const sendTextMessage = async () => {
    if (!inputText.trim() || !chatId) return;

    const tempId = generateMessageId();
    const tempMessage: ChatMessage = {
      id: tempId,
      text: inputText.trim(),
      time: getFormattedTime(),
      isMine: true,
      timestamp: Date.now(),
    };

    // Adicionar mensagem otimisticamente
    setMessages((prev) => [...prev, tempMessage]);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const sentMessage = await apiSendMessage({
        chatId,
        senderId: userId,
        content: textToSend,
        messageType: 'TEXT',
      });

      if (sentMessage) {
        // Atualizar com a mensagem real da API
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? convertAPIMessageToLocal(sentMessage) : msg))
        );
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Remover mensagem em caso de erro
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      Alert.alert('Erro', 'Não foi possível enviar a mensagem.');
    }
  };

  // Selecionar e enviar imagem
  const pickImage = async () => {
    if (!chatId) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const tempId = generateMessageId();
        const tempMessage: ChatMessage = {
          id: tempId,
          imageUri: result.assets[0].uri,
          imageUrl: result.assets[0].uri,
          time: getFormattedTime(),
          isMine: true,
          timestamp: Date.now(),
        };

        // Adicionar imagem otimisticamente
        setMessages((prev) => [...prev, tempMessage]);

        // TODO: Upload da imagem para servidor/S3 e obter URL
        const mediaUrl = result.assets[0].uri;

        const sentMessage = await apiSendMessage({
          chatId,
          senderId: userId,
          messageType: 'IMAGE',
          mediaUrl,
        });

        if (sentMessage) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? convertAPIMessageToLocal(sentMessage) : msg))
          );
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Tirar foto
  const takePhoto = async () => {
    if (!chatId) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const tempId = generateMessageId();
        const tempMessage: ChatMessage = {
          id: tempId,
          imageUri: result.assets[0].uri,
          imageUrl: result.assets[0].uri,
          time: getFormattedTime(),
          isMine: true,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, tempMessage]);

        // TODO: Upload da imagem
        const mediaUrl = result.assets[0].uri;

        const sentMessage = await apiSendMessage({
          chatId,
          senderId: userId,
          messageType: 'IMAGE',
          mediaUrl,
        });

        if (sentMessage) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? convertAPIMessageToLocal(sentMessage) : msg))
          );
        }
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  // Iniciar gravação de áudio
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para gravar áudio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  // Parar gravação e enviar
  const stopRecording = async () => {
    if (!chatId) return;

    try {
      if (!recordingRef.current) return;

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (uri && recordingDuration > 0) {
        const tempId = generateMessageId();
        const tempMessage: ChatMessage = {
          id: tempId,
          audioUri: uri,
          audioUrl: uri,
          audioDuration: recordingDuration,
          time: getFormattedTime(),
          isMine: true,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, tempMessage]);

        // TODO: Upload do áudio
        const mediaUrl = uri;

        const sentMessage = await apiSendMessage({
          chatId,
          senderId: userId,
          messageType: 'AUDIO',
          mediaUrl,
          audioDuration: recordingDuration,
        });

        if (sentMessage) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? convertAPIMessageToLocal(sentMessage) : msg))
          );
        }
      }

      recordingRef.current = null;
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      Alert.alert('Erro', 'Não foi possível finalizar a gravação.');
    }
  };

  const cancelRecording = async () => {
    try {
      if (!recordingRef.current) return;

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Erro ao cancelar gravação:', error);
    }
  };

  const clearChat = async () => {
    Alert.alert('Atenção', 'Não é possível limpar o histórico do chat.');
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const success = await apiDeleteMessage(messageId);
      if (success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível deletar a mensagem.');
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isRecording,
    recordingDuration,
    isLoadingChat,
    chatId,
    sendTextMessage,
    pickImage,
    takePhoto,
    startRecording,
    stopRecording,
    cancelRecording,
    clearChat,
    deleteMessage,
  };
};
