import React, { useState, useRef, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as S from './styles';
import { RootStackParamList } from '@routes/stack.routes';
import { useChat } from '@hooks/useChat';
import { useAuth } from '@hooks/auth';
import { AudioPlayer } from '@components/AudioPlayer';
import { BudgetQuoteCard } from '@components/BudgetQuoteCard';
import { getChatBudgets, Budget } from '@api/callbacks/budget';
import { useSocket } from '@hooks/useSocket';

type ChatRouteProps = RouteProp<RootStackParamList, 'Chat'>;

export const Chat: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatRouteProps>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  
  const { clientId, clientName, clientImage, serviceId, serviceName, chatId: providedChatId } = route.params;

  const {
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
  } = useChat({ 
    clientId, 
    serviceId, 
    userId: user?.id || '',
    chatId: providedChatId, // ✅ Passa o chatId específico se fornecido
  });

  const [budgetInfo] = useState({
    serviceName: serviceName || 'Serviço Solicitado',
    price: 0,
    date: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  });

  const [budgetStatus, setBudgetStatus] = useState<string | null>(null);
  const socket = useSocket();

  // Carregar status do orçamento
  useEffect(() => {
    if (chatId) {
      loadBudgetStatus();
    }
  }, [chatId]);

  const loadBudgetStatus = async () => {
    if (!chatId) return;
    
    try {
      const chatBudgets = await getChatBudgets(chatId);
      if (chatBudgets.length > 0) {
        const currentBudget = chatBudgets[0];
        setBudgetStatus(currentBudget.status);
        console.log('📊 [PRO-CHAT] Status do orçamento:', currentBudget.status);
      }
    } catch (error) {
      console.error('Erro ao carregar status do orçamento:', error);
    }
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const scrollToEnd = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Verificar se pode enviar mensagens (apenas se orçamento estiver PENDING ou ACCEPTED)
  const canSendMessages = budgetStatus === 'PENDING' || budgetStatus === 'ACCEPTED';

  const handleSend = () => {
    if (inputText.trim()) {
      sendTextMessage();
      scrollToEnd();
    }
  };

  const handleAttachment = () => {
    Alert.alert(
      'Adicionar anexo',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: takePhoto,
        },
        {
          text: 'Galeria',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleMicLongPress = () => {
    if (isRecording) {
      Alert.alert(
        'Cancelar gravação?',
        'Deseja cancelar a gravação atual?',
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            onPress: cancelRecording,
            style: 'destructive',
          },
        ]
      );
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendQuote = async (price: number, description: string) => {
    // Esta função não é mais necessária pois o componente BudgetQuoteCard
    // agora envia diretamente via API
    console.log('handleSendQuote deprecated - BudgetQuoteCard sends directly');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <S.Container>
          {/* Header */}
          <S.Header>
            <S.BackButton onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </S.BackButton>
            
            <S.HeaderContent>
              {clientImage ? (
                <S.Avatar source={{ uri: clientImage }} />
              ) : (
                <S.AvatarPlaceholder>
                  <Ionicons name="person" size={24} color="#999" />
                </S.AvatarPlaceholder>
              )}
              <S.HeaderInfo>
                <S.HeaderName>{clientName}</S.HeaderName>
                <S.HeaderStatus>Online</S.HeaderStatus>
              </S.HeaderInfo>
            </S.HeaderContent>

            <S.HeaderActions>
              <S.HeaderButton>
                <Ionicons name="call-outline" size={22} color="#000" />
              </S.HeaderButton>
              <S.HeaderButton>
                <Ionicons name="ellipsis-vertical" size={22} color="#000" />
              </S.HeaderButton>
            </S.HeaderActions>
          </S.Header>

          {/* Messages */}
          <S.MessagesContainer>
            <S.MessagesList
              ref={scrollViewRef}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              onContentSizeChange={scrollToEnd}
            >
              {/* Budget Request */}
              <S.BudgetRequestWrapper>
                <S.BudgetRequestHeader>
                  <S.ServiceIcon source={{ uri: clientImage }} />
                  <S.BudgetRequestTitle>
                    Cliente solicitou orçamento do serviço:{'\n'}
                    <S.BudgetServiceName>{budgetInfo.serviceName}</S.BudgetServiceName>
                  </S.BudgetRequestTitle>
                </S.BudgetRequestHeader>
              </S.BudgetRequestWrapper>

              {/* Chat messages */}
              {messages.map((msg) => (
                <S.MessageWrapper key={msg.id} isMine={msg.isMine}>
                  {msg.audioUrl || msg.audioUri ? (
                    <AudioPlayer
                      audioUri={msg.audioUri || msg.audioUrl || ''}
                      duration={msg.audioDuration}
                      isMine={msg.isMine}
                    />
                  ) : msg.imageUrl || msg.imageUri ? (
                    <S.ImageMessageContainer>
                      <S.MessageImage source={{ uri: msg.imageUri || msg.imageUrl }} />
                      {msg.text && (
                        <S.MessageBubble isMine={msg.isMine}>
                          <S.MessageText isMine={msg.isMine}>{msg.text}</S.MessageText>
                        </S.MessageBubble>
                      )}
                    </S.ImageMessageContainer>
                  ) : msg.text ? (
                    <S.MessageBubble isMine={msg.isMine}>
                      <S.MessageText isMine={msg.isMine}>{msg.text}</S.MessageText>
                    </S.MessageBubble>
                  ) : null}
                  <S.MessageTime>{msg.time}</S.MessageTime>
                </S.MessageWrapper>
              ))}

              {/* Empty state */}
              {messages.length === 0 && (
                <S.EmptyStateContainer>
                  <S.EmptyStateText>
                    Envie uma mensagem para iniciar a conversa com o cliente
                  </S.EmptyStateText>
                </S.EmptyStateContainer>
              )}
            </S.MessagesList>

            {/* Budget Quote Card - Só mostra se pode enviar mensagens */}
            {chatId && canSendMessages && (
              <BudgetQuoteCard
                serviceName={budgetInfo.serviceName}
                serviceId={serviceId}
                chatId={chatId}
              />
            )}
          </S.MessagesContainer>

          {/* Input */}
          <S.InputContainer>
            {!canSendMessages ? (
              <S.InputWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
                <S.DisabledText>
                  {budgetStatus === 'REJECTED' && 'Orçamento cancelado - Não é possível enviar mensagens'}
                  {budgetStatus === 'EXPIRED' && 'Orçamento expirado - Não é possível enviar mensagens'}
                  {!budgetStatus && 'Aguarde...'}
                </S.DisabledText>
              </S.InputWrapper>
            ) : isRecording ? (
              <S.RecordingContainer>
                <S.RecordingDot />
                <S.RecordingText>Gravando... {formatRecordingTime(recordingDuration)}</S.RecordingText>
                <S.CancelRecordingButton onPress={cancelRecording}>
                  <S.CancelRecordingText>Cancelar</S.CancelRecordingText>
                </S.CancelRecordingButton>
              </S.RecordingContainer>
            ) : (
              <S.InputWrapper>
                <S.Input
                  placeholder="Digite aqui..."
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={1000}
                  editable={canSendMessages}
                />
                <S.InputActions>
                  <S.InputButton onPress={handleAttachment} disabled={!canSendMessages}>
                    <Ionicons name="attach-outline" size={24} color={canSendMessages ? "#626263" : "#D5D5D4"} />
                  </S.InputButton>
                  <S.InputButton 
                    onPress={handleMicPress}
                    onLongPress={handleMicLongPress}
                    delayLongPress={500}
                    disabled={!canSendMessages}
                  >
                    <Ionicons 
                      name={isRecording ? "stop-circle" : "mic-outline"} 
                      size={24} 
                      color={isRecording ? "#FF7D7D" : (canSendMessages ? "#626263" : "#D5D5D4")} 
                    />
                  </S.InputButton>
                </S.InputActions>
              </S.InputWrapper>
            )}
            
            {!isRecording && canSendMessages && (
              <S.SendButton 
                onPress={handleSend}
                disabled={!inputText.trim()}
                style={{ opacity: inputText.trim() ? 1 : 0.5 }}
              >
                <Ionicons name="send" size={20} color="#FFF" />
              </S.SendButton>
            )}

            {isRecording && canSendMessages && (
              <S.SendButton onPress={stopRecording}>
                <Ionicons name="checkmark" size={24} color="#FFF" />
              </S.SendButton>
            )}
          </S.InputContainer>
        </S.Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

