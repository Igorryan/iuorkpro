import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, View, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import styled from 'styled-components/native';
import theme from '@theme/index';
import { api } from '@config/api';
import { useFocusEffect } from '@react-navigation/native';
import { getPendingOffers, acceptOffer, rejectOffer, BookingOffer } from '@api/callbacks/booking';
import { useSocket, SocketEvents } from '@hooks/useSocket';
import { useAuth } from '@hooks/auth';

const Offers: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<BookingOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const socket = useSocket();

  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPendingOffers();
      setOffers(data);
    } catch (error: any) {
      console.error('Erro ao carregar ofertas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as ofertas. Tente novamente.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOffers();
    }, [loadOffers])
  );

  // Conectar ao WebSocket e ouvir novas ofertas
  React.useEffect(() => {
    if (socket && user?.id) {
      // Entrar na sala do profissional para receber notificações
      socket.emit('join-professional', user.id);

      // Ouvir novas ofertas
      socket.on('new-booking-offer', (newOffer: BookingOffer) => {
        setOffers((prev) => {
          // Evitar duplicatas
          if (prev.find(o => o.id === newOffer.id)) {
            return prev;
          }
          return [newOffer, ...prev];
        });
      });

      return () => {
        socket.off('new-booking-offer');
      };
    }
  }, [socket, user?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOffers();
  };

  const handleAccept = async (offer: BookingOffer) => {
    Alert.alert(
      'Aceitar Oferta',
      `Deseja aceitar a oferta de ${offer.client.name} para o serviço "${offer.service.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              setProcessingIds((prev) => new Set(prev).add(offer.id));
              await acceptOffer(offer.id);
              Alert.alert('Sucesso', 'Oferta aceita com sucesso!');
              // Remover da lista
              setOffers((prev) => prev.filter((o) => o.id !== offer.id));
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível aceitar a oferta.');
            } finally {
              setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(offer.id);
                return next;
              });
            }
          },
        },
      ]
    );
  };

  const handleReject = async (offer: BookingOffer) => {
    Alert.alert(
      'Recusar Oferta',
      `Deseja recusar a oferta de ${offer.client.name} para o serviço "${offer.service.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingIds((prev) => new Set(prev).add(offer.id));
              await rejectOffer(offer.id);
              Alert.alert('Oferta Recusada', 'A oferta foi recusada.');
              // Remover da lista
              setOffers((prev) => prev.filter((o) => o.id !== offer.id));
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível recusar a oferta.');
            } finally {
              setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(offer.id);
                return next;
              });
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string | null) => {
    if (!phone) {
      Alert.alert('Atenção', 'Telefone não disponível.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'às' HH:mm");
  };

  const formatPrice = (price: string, pricingType: string) => {
    const priceNum = parseFloat(price);
    if (pricingType === 'HOURLY') {
      return `R$ ${priceNum.toFixed(2).replace('.', ',')}/hora`;
    }
    if (pricingType === 'BUDGET') {
      return 'Orçamento sob consulta';
    }
    return `R$ ${priceNum.toFixed(2).replace('.', ',')}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
        <Container>
          <Header>
            <Title>Ofertas de Serviço</Title>
          </Header>
          <LoadingContainer>
            <ActivityIndicator size="large" color={theme.COLORS.PRIMARY} />
            <LoadingText>Carregando ofertas...</LoadingText>
          </LoadingContainer>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
      <Container
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <Header>
          <Title>Ofertas de Serviço</Title>
          {offers.length > 0 && (
            <Badge>
              <BadgeText>{offers.length}</BadgeText>
            </Badge>
          )}
        </Header>

        {offers.length === 0 ? (
          <EmptyContainer>
            <EmptyIcon>
              <Ionicons name="briefcase-outline" size={64} color={theme.COLORS.GREY_40} />
            </EmptyIcon>
            <EmptyTitle>Nenhuma oferta pendente</EmptyTitle>
            <EmptySubtitle>
              Quando clientes solicitarem seus serviços, as ofertas aparecerão aqui.
            </EmptySubtitle>
          </EmptyContainer>
        ) : (
          <OffersList>
            {offers.map((offer) => {
              const isProcessing = processingIds.has(offer.id);

              return (
                <OfferCard key={offer.id}>
                  {/* Header com info do cliente */}
                  <ClientHeader>
                    {offer.client.avatarUrl ? (
                      <ClientAvatar source={{ uri: offer.client.avatarUrl }} />
                    ) : (
                      <ClientAvatarPlaceholder>
                        <Ionicons name="person" size={24} color={theme.COLORS.GREY_60} />
                      </ClientAvatarPlaceholder>
                    )}
                    <ClientInfo>
                      <ClientName>{offer.client.name}</ClientName>
                      {offer.client.phone && (
                        <ClientPhoneRow>
                          <Ionicons name="call-outline" size={14} color={theme.COLORS.GREY_60} />
                          <ClientPhone onPress={() => handleCall(offer.client.phone)}>
                            {offer.client.phone}
                          </ClientPhone>
                        </ClientPhoneRow>
                      )}
                    </ClientInfo>
                  </ClientHeader>

                  {/* Informações do serviço */}
                  <ServiceSection>
                    <ServiceTitle>{offer.service.title}</ServiceTitle>
                    {offer.service.description && (
                      <ServiceDescription>{offer.service.description}</ServiceDescription>
                    )}
                    <ServicePrice>{formatPrice(offer.service.price, offer.service.pricingType)}</ServicePrice>
                  </ServiceSection>

                  {/* Data e horário */}
                  <DateTimeSection>
                    <DateTimeRow>
                      <Ionicons name="calendar-outline" size={18} color={theme.COLORS.PRIMARY} />
                      <DateTimeText>{formatDate(offer.scheduledAt)}</DateTimeText>
                    </DateTimeRow>
                  </DateTimeSection>

                  {/* Endereço */}
                  {offer.address && (
                    <AddressSection>
                      <AddressRow>
                        <Ionicons name="location-outline" size={18} color={theme.COLORS.SECONDARY} />
                        <AddressText>{offer.address}</AddressText>
                      </AddressRow>
                    </AddressSection>
                  )}

                  {/* Botões de ação */}
                  <ActionsRow>
                    <RejectButton
                      onPress={() => handleReject(offer)}
                      disabled={isProcessing}
                      style={{ opacity: isProcessing ? 0.5 : 1 }}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color={theme.COLORS.ERROR} />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={20} color={theme.COLORS.ERROR} />
                          <RejectButtonText>Recusar</RejectButtonText>
                        </>
                      )}
                    </RejectButton>

                    <AcceptButton
                      onPress={() => handleAccept(offer)}
                      disabled={isProcessing}
                      style={{ opacity: isProcessing ? 0.5 : 1 }}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color={theme.COLORS.WHITE} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={20} color={theme.COLORS.WHITE} />
                          <AcceptButtonText>Aceitar</AcceptButtonText>
                        </>
                      )}
                    </AcceptButton>
                  </ActionsRow>
                </OfferCard>
              );
            })}
          </OffersList>
        )}
      </Container>
    </SafeAreaView>
  );
};

export default Offers;

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
  margin-top: 16px;
  color: ${theme.COLORS.GREY_60};
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: ${theme.FONT_SIZE.MD}px;
`;

const EmptyContainer = styled.View`
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

const OffersList = styled.View`
  padding: 0 16px 100px;
  gap: 16px;
`;

const OfferCard = styled.View`
  background-color: ${theme.COLORS.WHITE};
  border-radius: 16px;
  padding: 20px;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-opacity: 0.1;
  shadow-offset: 0px 2px;
  shadow-radius: 8px;
  elevation: 3;
  border: 2px solid ${theme.COLORS.SECONDARY}20;
`;

const ClientHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

const ClientAvatar = styled.Image`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.COLORS.GREY_10};
  margin-right: 12px;
`;

const ClientAvatarPlaceholder = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.COLORS.GREY_10};
  margin-right: 12px;
  align-items: center;
  justify-content: center;
`;

const ClientInfo = styled.View`
  flex: 1;
`;

const ClientName = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.LG}px;
  margin-bottom: 4px;
`;

const ClientPhoneRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const ClientPhone = styled.Text`
  color: ${theme.COLORS.SECONDARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
  font-size: ${theme.FONT_SIZE.SM}px;
  text-decoration-line: underline;
`;

const ServiceSection = styled.View`
  margin-bottom: 16px;
`;

const ServiceTitle = styled.Text`
  color: ${theme.COLORS.GREY_80};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.MD}px;
  margin-bottom: 8px;
`;

const ServiceDescription = styled.Text`
  color: ${theme.COLORS.GREY_60};
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: ${theme.FONT_SIZE.SM}px;
  line-height: 20px;
  margin-bottom: 8px;
`;

const ServicePrice = styled.Text`
  color: ${theme.COLORS.SECONDARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.LG}px;
`;

const DateTimeSection = styled.View`
  margin-bottom: 16px;
  padding: 12px;
  background-color: ${theme.COLORS.PRIMARY}10;
  border-radius: 8px;
`;

const DateTimeRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const DateTimeText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
  font-size: ${theme.FONT_SIZE.MD}px;
  flex: 1;
`;

const AddressSection = styled.View`
  margin-bottom: 16px;
  padding: 12px;
  background-color: ${theme.COLORS.SECONDARY}10;
  border-radius: 8px;
`;

const AddressRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

const AddressText = styled.Text`
  color: ${theme.COLORS.GREY_80};
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: ${theme.FONT_SIZE.SM}px;
  flex: 1;
  line-height: 20px;
`;

const ActionsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 8px;
`;

const RejectButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background-color: ${theme.COLORS.ERROR}15;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${theme.COLORS.ERROR};
  gap: 8px;
`;

const RejectButtonText = styled.Text`
  color: ${theme.COLORS.ERROR};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.MD}px;
`;

const AcceptButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background-color: ${theme.COLORS.SUCCESS};
  border-radius: 12px;
  gap: 8px;
`;

const AcceptButtonText = styled.Text`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.MD}px;
`;

