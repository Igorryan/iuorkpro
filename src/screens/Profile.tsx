import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@routes/stack.routes';
import type { StackNavigationProp } from '@react-navigation/stack';
import { api } from '@config/api';
import { getUserAddress } from '@functions/getUserAddress';
import type { IAddress } from '../types/address';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = React.useState<Array<{ id: string; status: string; createdAt: string; service: { id: string; title: string } }>>([]);
  const [services, setServices] = React.useState<Array<{ id: string; name: string; description: string; price: number | null; images?: string[] }>>([]);
  const [selectedAddress, setSelectedAddress] = React.useState<IAddress | undefined>(undefined);

  React.useEffect(() => {
    (async () => {
      try {
        const [ordersRes, servicesRes] = await Promise.all([
          api.get('/bookings/mine'),
          user?.role === 'PRO' ? api.get('/services/mine') : Promise.resolve({ data: [] }),
        ]);
        setOrders(ordersRes.data);
        setServices(servicesRes.data);
      } catch (e) {
        // ignore
      }
    })();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const addr = await getUserAddress();
          if (mounted) setSelectedAddress(addr);
        } catch {}
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );

  function handleDeleteService(id: string) {
    (async () => {
      try {
        await api.delete(`/services/${id}`);
        const res = await api.get('/services/mine');
        setServices(res.data);
      } catch {}
    })();
  }

  function renderSelectedAddress() {
    const title = selectedAddress?.street
      ? `${selectedAddress.street}${selectedAddress.number ? `, ${selectedAddress.number}` : ''}`
      : 'Endereço não definido';
    const subtitle = selectedAddress?.city ? `${selectedAddress.city} - ${selectedAddress.state}` : 'Defina seu endereço para receber pedidos próximos.';
    return (
      <SectionCard>
        <SectionHeader>
          <Icon name="location-outline" />
          <SectionTitle>Endereço</SectionTitle>
        </SectionHeader>
        <SectionBody>
          <PrimaryText>{title}</PrimaryText>
          <SecondaryText>{subtitle}</SecondaryText>
          <ButtonsRow>
            <PrimaryButton onPress={() => navigation.navigate('Address')}>
              <ButtonTextPrimary>{selectedAddress ? 'Alterar endereço' : 'Definir endereço'}</ButtonTextPrimary>
            </PrimaryButton>
          </ButtonsRow>
        </SectionBody>
      </SectionCard>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <Container>
        <Content>
        <ScreenTitle>Meu Perfil</ScreenTitle>

        <SectionCard>
          <SectionHeader>
            <Icon name="person-circle-outline" />
            <SectionTitle>Perfil</SectionTitle>
          </SectionHeader>
          <SectionBody>
            <PrimaryText>{user?.name}</PrimaryText>
            <SecondaryText>{user?.email || '-'}</SecondaryText>
            {user?.role === 'PRO' && (
              <ButtonsRow>
                <PrimaryButton onPress={() => navigation.navigate('EditProfile')}>
                  <ButtonTextPrimary>Editar perfil</ButtonTextPrimary>
                </PrimaryButton>
              </ButtonsRow>
            )}
          </SectionBody>
        </SectionCard>

        {renderSelectedAddress()}

        {/* Serviços e Pedidos foram movidos para as abas "Serviços" e "Pedidos" */}

        <SectionCard>
          <SectionHeader>
            <Icon name="settings-outline" />
            <SectionTitle>Ações</SectionTitle>
          </SectionHeader>
          <ButtonsRow>
            <DangerButton onPress={logout}>
              <ButtonTextDanger>Sair</ButtonTextDanger>
            </DangerButton>
          </ButtonsRow>
        </SectionCard>
        </Content>
      </Container>
    </SafeAreaView>
  );
};

export default Profile;


const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
`;

const Content = styled.View`
  padding: 24px;
  padding-bottom: 24px;
`;

const ScreenTitle = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.XL}px;
  margin-bottom: 12px;
`;

const SectionCard = styled.View`
  background-color: ${theme.COLORS.WHITE};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid ${theme.COLORS.GREY_10};
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const SectionTitle = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.LG}px;
  margin-left: 6px;
`;

const SectionBody = styled.View``;

const PrimaryText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
`;

const SecondaryText = styled.Text`
  color: ${theme.COLORS.GREY_80};
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
`;

const BaseButton = styled.TouchableOpacity`
  border-radius: 10px;
  padding: 12px 14px;
  align-items: center;
  justify-content: center;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: ${theme.COLORS.SECONDARY};
`;

const SecondaryButton = styled(BaseButton)`
  background-color: ${theme.COLORS.GREY_20}90;
`;

const DangerButton = styled(BaseButton)`
  background-color: ${theme.COLORS.WARNING}33;
`;

const ButtonTextPrimary = styled.Text`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
`;

const ButtonTextSecondary = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
`;

const ButtonTextDanger = styled.Text`
  color: ${theme.COLORS.WARNING};
  font-family: ${theme.FONT_FAMILY.BOLD};
`;

const Icon = styled(Ionicons).attrs({ size: 22, color: theme.COLORS.PRIMARY })``;

const Spacer = styled.View<{ height?: number }>`
  height: ${(p) => p.height || 8}px;
`;

const Card = styled.View`
  background-color: ${theme.COLORS.WHITE};
  border: 1px solid ${theme.COLORS.GREY_10};
  border-radius: 12px;
  padding: 12px;
`;

const CardTitle = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
`;

const CardSubtitle = styled.Text`
  color: ${theme.COLORS.GREY_80};
`;

const CardText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
`;

const ImagesRow = styled.View`
  flex-direction: row;
  margin-top: 8px;
`;

const ImageBox = styled.View`
  width: 84px;
  height: 84px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 8px;
  background-color: #eee;
`;

const ImageThumb = styled.Image`
  width: 100%;
  height: 100%;
`;

const ImageOverlay = styled.View.attrs(() => ({
  style: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}))``;

const OverlayText = styled.Text`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
`;

const BadgeRow = styled.View`
  flex-direction: row;
  margin-top: 6px;
  margin-bottom: 6px;
`;

const StatusBadge = styled.View`
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 999px;
  padding: 6px 10px;
`;

const StatusText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
`;

const ListContainer = styled.View`
  padding-vertical: 12px;
`;

const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding: 12px;
`;

const EmptyTitle = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  margin-top: 8px;
`;

const EmptySubtitle = styled.Text`
  color: ${theme.COLORS.GREY_80};
  text-align: center;
`;

