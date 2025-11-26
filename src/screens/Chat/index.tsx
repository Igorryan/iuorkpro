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
import theme from '@theme/index';
import { mergeChatItems, ChatItem } from '@functions/mergeChatItems';

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
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);

  // Carregar orçamento específico do chat
  useEffect(() => {
    if (chatId) {
      loadBudget();
    }
  }, [chatId]);

  const loadBudget = async () => {
    if (!chatId) return;

    try {
      // Carregar todos os orçamentos deste chat
      const chatBudgets = await getChatBudgets(chatId);

      if (chatBudgets.length > 0) {
        // Usar o mais recente (ou o específico se tiver)
        const budget = chatBudgets[0];

        setCurrentBudget(budget);
        setBudgetStatus(budget.status);
        console.log('📊 [PRO-CHAT] Orçamento carregado:', {
          budgetId: budget.id,
          status: budget.status,
          price: budget.price
        });
      } else {
        // Resetar se não houver orçamentos
        setCurrentBudget(null);
        setBudgetStatus(null);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      setCurrentBudget(null);
      setBudgetStatus(null);
    }
  };

  // Ouvir novos orçamentos via WebSocket (para atualizar quando enviar)
  useEffect(() => {
    if (socket && user?.id && chatId) {
      const handleNewBudget = (data: any) => {
        console.log('🔔 [PRO-CHAT] Novo orçamento recebido via WebSocket!', data);

        // Verificar se é para este chat/serviço
        if (data.chatId === chatId || data.serviceId === serviceId) {
          console.log('✅ [PRO-CHAT] Orçamento corresponde a este chat - Recarregando...');
          // Sempre recarregar o orçamento quando receber evento
          setTimeout(() => {
            loadBudget();
          }, 500);
        }
      };

      socket.on('new-budget', handleNewBudget);

      return () => {
        socket.off('new-budget', handleNewBudget);
      };
    }
  }, [socket, user?.id, chatId, serviceId]);

  useEffect(() => {
    scrollToEnd();
  }, [messages, currentBudget]);

  const scrollToEnd = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Mesclar mensagens e orçamento em uma lista ordenada cronologicamente
  const chatItems = mergeChatItems(messages, currentBudget);

  // Sempre permitir enviar mensagens, independente do status do orçamento
  const canSendMessages = true;

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
              {/* Estado vazio */}
              {chatItems.length === 0 && (
                <S.EmptyStateContainer>
                  <S.EmptyStateText>
                    Envie uma mensagem para iniciar a conversa com o cliente
                  </S.EmptyStateText>
                </S.EmptyStateContainer>
              )}

              {/* Lista unificada de mensagens e orçamento ordenada cronologicamente */}
              {chatItems.map((item: ChatItem) => {
                if (item.type === 'message' && item.message) {
                  const msg = item.message;
                  return (
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
                  );
                }

                if (item.type === 'budget' && item.budget) {
                  const budget = item.budget;
                  // Só mostrar se o preço foi definido (> 0)
                  if (parseFloat(budget.price) > 0) {
                    return (
                      <S.MessageWrapper key={`budget-${budget.id}`} isMine={true}>
                        <S.BudgetSentCard>
                          <S.BudgetSentHeader>
                            <S.BudgetSentIconContainer>
                              <Ionicons name="pricetag" size={24} color={theme.COLORS.SECONDARY} />
                            </S.BudgetSentIconContainer>
                            <S.BudgetSentHeaderContent>
                              <S.BudgetSentTitle>Orçamento Enviado</S.BudgetSentTitle>
                              <S.BudgetSentSubtitle>Para {clientName}</S.BudgetSentSubtitle>
                            </S.BudgetSentHeaderContent>
                          </S.BudgetSentHeader>

                          <S.BudgetSentServiceInfo>
                            <S.BudgetSentServiceLabel>Serviço:</S.BudgetSentServiceLabel>
                            <S.BudgetSentServiceName>{serviceName || budgetInfo.serviceName}</S.BudgetSentServiceName>
                          </S.BudgetSentServiceInfo>

                          <S.BudgetSentPriceContainer>
                            <S.BudgetSentPriceLabel>Valor:</S.BudgetSentPriceLabel>
                            <S.BudgetSentPrice>R$ {parseFloat(budget.price).toFixed(2).replace('.', ',')}</S.BudgetSentPrice>
                          </S.BudgetSentPriceContainer>

                          {budget.description && budget.description !== 'Solicitação de orçamento' && (
                            <S.BudgetSentDescriptionContainer>
                              <S.BudgetSentDescriptionLabel>Detalhes:</S.BudgetSentDescriptionLabel>
                              <S.BudgetSentDescription>{budget.description}</S.BudgetSentDescription>
                            </S.BudgetSentDescriptionContainer>
                          )}

                          {budget.expiresAt && (
                            <S.BudgetSentExpiryInfo>
                              <Ionicons name="time-outline" size={14} color={theme.COLORS.GREY_60} />
                              <S.BudgetSentExpiryText>
                                {(() => {
                                  const date = new Date(budget.expiresAt);
                                  const now = new Date();
                                  const diffTime = date.getTime() - now.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  if (diffDays < 0) return 'Expirado';
                                  if (diffDays === 0) return 'Expira hoje';
                                  if (diffDays === 1) return 'Expira amanhã';
                                  return `Expira em ${diffDays} dias`;
                                })()}
                              </S.BudgetSentExpiryText>
                            </S.BudgetSentExpiryInfo>
                          )}
                        </S.BudgetSentCard>
                        <S.MessageTime>
                          {new Date(budget.updatedAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </S.MessageTime>
                      </S.MessageWrapper>
                    );
                  }
                }

                return null;
              })}
            </S.MessagesList>

            {/* Budget Quote Card - Só mostra se pode enviar mensagens */}
            {chatId && canSendMessages && (
              <BudgetQuoteCard
                serviceName={budgetInfo.serviceName}
                serviceId={serviceId}
                chatId={chatId}
                currentBudget={currentBudget}
                onBudgetSent={loadBudget}
              />
            )}
          </S.MessagesContainer>

          {/* Input sempre visível */}
          <S.InputContainer>
            {isRecording ? (
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

