import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@screens/Home';
import Profile from '@screens/Profile';
import Orders from '@screens/Orders';
import Services from '@screens/Services';
import theme from '@theme/index';
import { Ionicons } from '@expo/vector-icons';

export type RootTabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  ServicesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabRoutes: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.COLORS.SECONDARY,
        tabBarInactiveTintColor: theme.COLORS.GREY_40,
        tabBarStyle: {
          backgroundColor: theme.COLORS.WHITE,
          borderTopColor: 'transparent',
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 12,
          borderRadius: 24,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: theme.COLORS.SHADOW,
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 4,
        },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home-outline';
          if (route.name === 'OrdersTab') iconName = 'receipt-outline';
          if (route.name === 'ServicesTab') iconName = 'construct-outline';
          if (route.name === 'ProfileTab') iconName = 'person-outline';
          return <Ionicons name={iconName as any} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: 'Início' }} />
      <Tab.Screen name="OrdersTab" component={Orders} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="ServicesTab" component={Services} options={{ title: 'Serviços' }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};


