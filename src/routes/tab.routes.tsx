import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Home from '@screens/Home';
import Menu from '@screens/Menu';
import Orders from '@screens/Orders';
import Agenda from '@screens/Agenda';
import Offers from '@screens/Offers';
import theme from '@theme/index';
import { Ionicons } from '@expo/vector-icons';

export type RootTabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  AgendaTab: undefined;
  OffersTab: undefined;
  MenuTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabRoutes: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.COLORS.SECONDARY,
        tabBarInactiveTintColor: theme.COLORS.GREY_40,
        tabBarStyle: {
          backgroundColor: theme.COLORS.WHITE,
          borderTopColor: 'transparent',
          height: 64 + insets.bottom,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          marginTop: 0,
        },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        tabBarIcon: ({ color }) => {
          let iconName: string = 'home-outline';
          if (route.name === 'OrdersTab') iconName = 'chatbubbles-outline';
          if (route.name === 'AgendaTab') iconName = 'calendar-outline';
          if (route.name === 'OffersTab') iconName = 'briefcase-outline';
          if (route.name === 'MenuTab') iconName = 'menu-outline';
          return <Ionicons name={iconName as any} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: 'Início' }} />
      <Tab.Screen name="AgendaTab" component={Agenda} options={{ title: 'Agenda' }} />
      <Tab.Screen name="OffersTab" component={Offers} options={{ title: 'Ofertas' }} />
      <Tab.Screen name="OrdersTab" component={Orders} options={{ title: 'Chat' }} />
      <Tab.Screen name="MenuTab" component={Menu} options={{ title: 'Menu' }} />
    </Tab.Navigator>
  );
};


