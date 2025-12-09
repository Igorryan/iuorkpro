import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';
import * as S from './styles';

type Nav = StackNavigationProp<RootStackParamList>;

const Menu: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'about',
      title: 'Sobre',
      subtitle: 'Profissão e descrição',
      icon: 'information-circle-outline',
      color: theme.COLORS.PRIMARY,
      onPress: () => navigation.navigate('About'),
    },
    {
      id: 'availability',
      title: 'Disponibilidade',
      subtitle: 'Horários de trabalho',
      icon: 'time-outline',
      color: theme.COLORS.SECONDARY,
      onPress: () => navigation.navigate('Availability'),
    },
    {
      id: 'addresses',
      title: 'Endereços',
      subtitle: 'Gerenciar endereços',
      icon: 'location-outline',
      color: theme.COLORS.SECONDARY,
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      id: 'services',
      title: 'Meus Serviços',
      subtitle: 'Gerenciar serviços',
      icon: 'briefcase-outline',
      color: theme.COLORS.SUCCESS,
      onPress: () => navigation.navigate('MyServices'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
      <S.Container>
        <S.Header>
          <S.Title>Menu</S.Title>
        </S.Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <S.MenuItem key={item.id} onPress={item.onPress}>
              <S.MenuItemLeft>
                <S.IconContainer style={{ backgroundColor: item.color + '20' }}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </S.IconContainer>
                <S.MenuItemContent>
                  <S.MenuItemTitle>{item.title}</S.MenuItemTitle>
                  <S.MenuItemSubtitle>{item.subtitle}</S.MenuItemSubtitle>
                </S.MenuItemContent>
              </S.MenuItemLeft>
              <Ionicons name="chevron-forward" size={20} color={theme.COLORS.GREY_40} />
            </S.MenuItem>
          ))}
          
          {/* Separador */}
          <View style={{ height: 1, backgroundColor: theme.COLORS.GREY_10, marginVertical: 8 }} />
          
          {/* Logout */}
          <S.MenuItem onPress={handleLogout}>
            <S.MenuItemLeft>
              <S.IconContainer style={{ backgroundColor: theme.COLORS.ERROR + '20' }}>
                <Ionicons name="log-out-outline" size={24} color={theme.COLORS.ERROR} />
              </S.IconContainer>
              <S.MenuItemContent>
                <S.MenuItemTitle style={{ color: theme.COLORS.ERROR }}>Sair</S.MenuItemTitle>
                <S.MenuItemSubtitle>Encerrar sessão</S.MenuItemSubtitle>
              </S.MenuItemContent>
            </S.MenuItemLeft>
            <Ionicons name="chevron-forward" size={20} color={theme.COLORS.GREY_40} />
          </S.MenuItem>
        </ScrollView>
      </S.Container>
    </SafeAreaView>
  );
};

export default Menu;

