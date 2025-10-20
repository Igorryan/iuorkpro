import React from 'react';
import styled from 'styled-components/native';
import theme from '@theme/index';
import { api } from '@config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@hooks/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import { getUserChats } from '@api/callbacks/chat';
import type { Chat } from '@api/callbacks/chat';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, RefreshControl } from 'react-native';
import { useSocket, SocketEvents } from '@hooks/useSocket';

type OrdersNavigationProp = StackNavigationProp<RootStackParamList>;

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<OrdersNavigationProp>();
  
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const socket = useSocket();

  const loadChats = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const data = await getUserChats(user.id, 'PRO');
      setChats(data);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadChats();
    
    // Conectar WebSocket para receber novos chats em tempo real
    if (socket && user?.id) {
      socket.emit('join-professional', user.id);
      console.log('💼 Profissional conectado para notificações');

      // Ouvir novo chat
      socket.on(SocketEvents.NEW_CHAT, (newChat: Chat) => {
        console.log('🔔 Novo chat recebido!', newChat);
        setChats((prev) => {
          // Evitar duplicatas
          if (prev.find(c => c.id === newChat.id)) {
            return prev;
          }
          return [newChat, ...prev];
        });
      });

      // Ouvir novas mensagens para atualizar a lista de chats
      socket.on(SocketEvents.NEW_MESSAGE, (newMessage: any) => {
        console.log('🔔 Nova mensagem recebida na lista!', newMessage);
        setChats((prev) => {
          const chatIndex = prev.findIndex(c => c.id === newMessage.chatId);
          
          if (chatIndex === -1) {
            // Chat não encontrado, recarregar lista
            loadChats();
            return prev;
          }

          const updatedChats = [...prev];
          const chat = { ...updatedChats[chatIndex] };
          
          // Atualizar última mensagem
          chat.lastMessageAt = newMessage.createdAt;
          
          // Atualizar array de mensagens (apenas última mensagem para preview)
          chat.messages = [newMessage];
          
          // Atualizar contador de não lidas (se a mensagem não é minha)
          if (newMessage.senderId !== user.id && chat._count) {
            chat._count.messages = (chat._count.messages || 0) + 1;
          }
          
          // Remover chat da posição atual
          updatedChats.splice(chatIndex, 1);
          
          // Adicionar no topo da lista
          return [chat, ...updatedChats];
        });
      });

      // Ouvir evento de mensagens lidas
      socket.on(SocketEvents.MESSAGE_READ, (data: { chatId: string; userId: string }) => {
        console.log('📖 Mensagens lidas no chat:', data.chatId, 'por usuário:', data.userId);
        
        // Se eu fui quem leu, zerar o contador de não lidas
        if (data.userId === user.id) {
          setChats((prev) => {
            const chatIndex = prev.findIndex(c => c.id === data.chatId);
            
            if (chatIndex === -1) {
              return prev;
            }

            const updatedChats = [...prev];
            const chat = { ...updatedChats[chatIndex] };
            
            // Zerar contador de não lidas
            if (chat._count) {
              chat._count.messages = 0;
            }
            
            updatedChats[chatIndex] = chat;
            console.log('   - Contador de não lidas zerado');
            return updatedChats;
          });
        }
      });

      // Ouvir atualizações de chat list (orçamento cancelado/atualizado)
      socket.on('chat-list-update', (data: { chatId: string; budget: any }) => {
        console.log('🔄 Atualização de chat recebida:', data);
        
        setChats((prev) => {
          const chatIndex = prev.findIndex(c => c.id === data.chatId);
          
          if (chatIndex === -1) {
            console.log('   - Chat não encontrado, recarregando lista');
            loadChats();
            return prev;
          }

          const updatedChats = [...prev];
          const chat = { ...updatedChats[chatIndex] };
          
          // Atualizar budget se fornecido
          if (data.budget) {
            chat.budget = data.budget;
            console.log(`   - Budget atualizado: status = ${data.budget.status}`);
          }
          
          updatedChats[chatIndex] = chat;
          return updatedChats;
        });
      });

      return () => {
        socket.off(SocketEvents.NEW_CHAT);
        socket.off(SocketEvents.NEW_MESSAGE);
        socket.off(SocketEvents.MESSAGE_READ);
        socket.off('chat-list-update');
      };
    }
  }, [loadChats, socket, user?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadChats();
  };

  const handleChatPress = (chat: Chat) => {
    // Permite acessar o chat independentemente do status do orçamento
    navigation.navigate('Chat', {
      clientId: chat.clientId,
      clientName: chat.client?.name || 'Cliente',
      clientImage: chat.client?.avatarUrl || '',
      serviceId: chat.serviceId || '',
      serviceName: chat.service?.title || 'Serviço',
      chatId: chat.id, // ✅ Passa o ID do chat específico
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'Novo pedido de orçamento';
    }
    
    const lastMessage = chat.messages[0];
    
    if (lastMessage.messageType === 'IMAGE') return '📷 Imagem';
    if (lastMessage.messageType === 'AUDIO') return '🎤 Áudio';
    return lastMessage.content || '';
  };

  const getBudgetStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PENDING: 'Aguardando',
      QUOTED: 'Aceito', // Mantido para compatibilidade
      ACCEPTED: 'Aceito',
      REJECTED: 'Cancelado',
      EXPIRED: 'Expirado',
    };
    return labels[status] || status;
  };

  const getBudgetStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: theme.COLORS.WARNING || '#FFA500',
      QUOTED: theme.COLORS.SECONDARY,
      ACCEPTED: theme.COLORS.SUCCESS || '#70CF4F',
      REJECTED: theme.COLORS.ERROR || '#FF3B30',
      EXPIRED: theme.COLORS.GREY_40,
    };
    return colors[status] || theme.COLORS.GREY_40;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
        <Container>
          <Header>
            <Title>Conversas</Title>
          </Header>
          <LoadingContainer>
            <LoadingText>Carregando...</LoadingText>
          </LoadingContainer>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <Container
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Header>
          <Title>Conversas</Title>
          {chats.length > 0 && (
            <Badge>
              <BadgeText>{chats.length}</BadgeText>
            </Badge>
          )}
        </Header>
        
        {chats.length === 0 ? (
          <Empty>
            <EmptyIcon>
              <Ionicons name="chatbubbles-outline" size={64} color={theme.COLORS.GREY_40} />
            </EmptyIcon>
            <EmptyTitle>Nenhuma conversa ainda</EmptyTitle>
            <EmptySubtitle>
              Quando clientes solicitarem orçamentos dos seus serviços, as conversas aparecerão aqui.
            </EmptySubtitle>
          </Empty>
        ) : (
          <List>
            {chats.map((chat) => {
              const unreadCount = chat._count?.messages || 0;
              
              return (
                <ChatCard 
                  key={chat.id} 
                  onPress={() => handleChatPress(chat)}
                >
                  {chat.client?.avatarUrl ? (
                    <Avatar source={{ uri: chat.client.avatarUrl }} />
                  ) : (
                    <AvatarPlaceholder>
                      <Ionicons name="person" size={32} color={theme.COLORS.GREY_40} />
                    </AvatarPlaceholder>
                  )}
                  
                  <ChatContent>
                    <ChatHeader>
                      <ClientName numberOfLines={1}>
                        {chat.client?.name || 'Cliente'}
                      </ClientName>
                      <TimeText>{formatTime(chat.lastMessageAt)}</TimeText>
                    </ChatHeader>
                    
                    <ServiceRow>
                      <ServiceLabel>Serviço:</ServiceLabel>
                      <ServiceName numberOfLines={1}>
                        {chat.service?.title || 'Sem serviço'}
                      </ServiceName>
                    </ServiceRow>
                    
                    {chat.budget && (
                      <BudgetStatusRow>
                        <BudgetStatusBadge statusColor={getBudgetStatusColor(chat.budget.status)}>
                          <BudgetStatusText>
                            {getBudgetStatusLabel(chat.budget.status)}
                          </BudgetStatusText>
                        </BudgetStatusBadge>
                        {chat.budget.price !== '0' && (
                          <BudgetPriceText>
                            R$ {parseFloat(chat.budget.price).toFixed(2)}
                          </BudgetPriceText>
                        )}
                      </BudgetStatusRow>
                    )}
                    
                    <MessageRow>
                      <LastMessage numberOfLines={1} hasUnread={unreadCount > 0}>
                        {getLastMessagePreview(chat)}
                      </LastMessage>
                      {unreadCount > 0 && (
                        <UnreadBadge>
                          <UnreadText>{unreadCount}</UnreadText>
                        </UnreadBadge>
                      )}
                    </MessageRow>
                  </ChatContent>
                  
                  <ChevronIcon>
                    <Ionicons name="chevron-forward" size={20} color={theme.COLORS.GREY_40} />
                  </ChevronIcon>
                </ChatCard>
              );
            })}
          </List>
        )}
      </Container>
    </SafeAreaView>
  );
};

export default Orders;

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
`;

const Title = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.XL}px;
`;

const Badge = styled.View`
  background-color: ${theme.COLORS.SECONDARY};
  border-radius: 12px;
  padding: 4px 10px;
  min-width: 24px;
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled.Text`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: 12px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 48px;
`;

const LoadingText = styled.Text`
  color: ${theme.COLORS.GREY_60};
  font-family: ${theme.FONT_FAMILY.REGULAR};
`;

const Empty = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
`;

const EmptyIcon = styled.View`
  margin-bottom: 16px;
`;

const EmptyTitle = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.LG}px;
  margin-bottom: 8px;
`;

const EmptySubtitle = styled.Text`
  color: ${theme.COLORS.GREY_60};
  font-family: ${theme.FONT_FAMILY.REGULAR};
  text-align: center;
  line-height: 22px;
`;

const List = styled.View`
  padding: 0 16px 100px;
  gap: 1px;
`;

const ChatCard = styled(TouchableOpacity)`
  flex-direction: row;
  background-color: ${theme.COLORS.WHITE};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  align-items: center;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-opacity: 0.05;
  shadow-offset: 0px 2px;
  shadow-radius: 8px;
  elevation: 2;
`;

const Avatar = styled.Image`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.COLORS.GREY_10};
  margin-right: 12px;
`;

const AvatarPlaceholder = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.COLORS.GREY_10};
  margin-right: 12px;
  align-items: center;
  justify-content: center;
`;

const ChatContent = styled.View`
  flex: 1;
  justify-content: center;
`;

const ChatHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ClientName = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.MD}px;
  flex: 1;
`;

const TimeText = styled.Text`
  color: ${theme.COLORS.GREY_60};
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: 12px;
  margin-left: 8px;
`;

const ServiceRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const ServiceLabel = styled.Text`
  color: ${theme.COLORS.GREY_60};
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: 12px;
  margin-right: 4px;
`;

const ServiceName = styled.Text`
  color: ${theme.COLORS.SECONDARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
  font-size: 12px;
  flex: 1;
`;

const MessageRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LastMessage = styled.Text<{ hasUnread: boolean }>`
  color: ${props => props.hasUnread ? theme.COLORS.PRIMARY : theme.COLORS.GREY_60};
  font-family: ${props => props.hasUnread ? theme.FONT_FAMILY.MEDIUM : theme.FONT_FAMILY.REGULAR};
  font-size: 14px;
  flex: 1;
`;

const UnreadBadge = styled.View`
  background-color: ${theme.COLORS.SECONDARY};
  border-radius: 10px;
  padding: 2px 8px;
  min-width: 20px;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
`;

const UnreadText = styled.Text`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: 11px;
`;

const ChevronIcon = styled.View`
  margin-left: 8px;
`;

const BudgetStatusRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const BudgetStatusBadge = styled.View<{ statusColor: string }>`
  background-color: ${props => props.statusColor}20;
  border-radius: 6px;
  padding: 4px 8px;
  border: 1px solid ${props => props.statusColor};
`;

const BudgetStatusText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: 11px;
`;

const BudgetPriceText = styled.Text`
  color: ${theme.COLORS.SECONDARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: 13px;
`;
