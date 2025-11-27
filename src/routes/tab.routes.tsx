import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
          if (route.name === 'ServicesTab') iconName = 'briefcase-outline';
          if (route.name === 'ProfileTab') iconName = 'person-outline';
          return <Ionicons name={iconName as any} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: 'Início' }} />
      <Tab.Screen name="ServicesTab" component={Services} options={{ title: 'Serviços' }} />
      <Tab.Screen name="OrdersTab" component={Orders} options={{ title: 'Chat' }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};


