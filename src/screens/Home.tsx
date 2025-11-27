import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@theme/index';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '@routes/tab.routes';
import { getUserChats } from '@api/callbacks/chat';
import { useAuth } from '@hooks/auth';
import { api } from '@config/api';

type Nav = BottomTabNavigationProp<RootTabParamList>;

const Home: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    totalChats: 0,
    totalServices: 0,
    pendingBudgets: 0,
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      // Carregar estatísticas
      if (user?.id) {
        try {
          const [chats, services] = await Promise.all([
            getUserChats(user.id, 'PRO'),
            api.get('/services/mine').catch(() => ({ data: [] })),
          ]);
          
          const pendingBudgets = chats.filter(c => c.budget?.status === 'PENDING').length;
          
          if (mounted) {
            setStats({
              totalChats: chats.length,
              totalServices: services.data.length,
              pendingBudgets,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar estatísticas:', error);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
      <Container>
        <Header>
          <Greeting>Olá, {user?.name?.split(' ')[0] || 'Profissional'}!</Greeting>
          <Subtitle>Gerencie seus serviços e pedidos</Subtitle>
        </Header>

        <StatsContainer>
          <StatCard onPress={() => navigation.navigate('OrdersTab')}>
            <StatIconContainer style={{ backgroundColor: theme.COLORS.SECONDARY + '20' }}>
              <Ionicons name="chatbubbles" size={24} color={theme.COLORS.SECONDARY} />
            </StatIconContainer>
            <StatContent>
              <StatValue>{stats.totalChats}</StatValue>
              <StatLabel>Conversas</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard onPress={() => navigation.navigate('ServicesTab')}>
            <StatIconContainer style={{ backgroundColor: theme.COLORS.SUCCESS + '20' }}>
              <Ionicons name="construct" size={24} color={theme.COLORS.SUCCESS} />
            </StatIconContainer>
            <StatContent>
              <StatValue>{stats.totalServices}</StatValue>
              <StatLabel>Serviços</StatLabel>
            </StatContent>
          </StatCard>

          {stats.pendingBudgets > 0 && (
            <StatCard onPress={() => navigation.navigate('OrdersTab')}>
              <StatIconContainer style={{ backgroundColor: theme.COLORS.WARNING + '20' }}>
                <Ionicons name="time" size={24} color={theme.COLORS.WARNING} />
              </StatIconContainer>
              <StatContent>
                <StatValue>{stats.pendingBudgets}</StatValue>
                <StatLabel>Pendentes</StatLabel>
              </StatContent>
            </StatCard>
          )}
        </StatsContainer>

        <QuickActions>
          <QuickActionTitle>Ações Rápidas</QuickActionTitle>
          <QuickActionButtons>
            <QuickActionButton onPress={() => navigation.navigate('ServiceNew', {})}>
              <QuickActionIconContainer style={{ backgroundColor: theme.COLORS.SECONDARY + '20' }}>
                <Ionicons name="add-circle" size={24} color={theme.COLORS.SECONDARY} />
              </QuickActionIconContainer>
              <QuickActionText>Novo Serviço</QuickActionText>
            </QuickActionButton>

            <QuickActionButton onPress={() => navigation.navigate('ProfileTab')}>
              <QuickActionIconContainer style={{ backgroundColor: theme.COLORS.PRIMARY + '20' }}>
                <Ionicons name="person-circle" size={24} color={theme.COLORS.PRIMARY} />
              </QuickActionIconContainer>
              <QuickActionText>Meu Perfil</QuickActionText>
            </QuickActionButton>
          </QuickActionButtons>
        </QuickActions>
      </Container>
    </SafeAreaView>
  );
};

export default Home;

const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
})`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND};
`;

const Header = styled.View`
  margin-bottom: 24px;
`;

const Greeting = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.XXL}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
  margin-bottom: 4px;
`;

const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
`;

const StatsContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const StatCard = styled.TouchableOpacity`
  flex: 1;
  min-width: 100px;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 16px;
  padding: 16px;
  align-items: center;
  shadow-color: ${({ theme }) => theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 3;
`;

const StatIconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const StatContent = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.XL}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
  margin-bottom: 4px;
`;

const StatLabel = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
`;

const QuickActions = styled.View`
  margin-bottom: 24px;
`;

const QuickActionTitle = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.LG}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
  margin-bottom: 12px;
`;

const QuickActionButtons = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const QuickActionButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 16px;
  padding: 20px;
  align-items: center;
  shadow-color: ${({ theme }) => theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 3;
`;

const QuickActionIconContainer = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const QuickActionText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
  text-align: center;
`;
