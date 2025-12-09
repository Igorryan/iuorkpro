import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '@screens/Auth/Login';
import SignUp from '@screens/Auth/SignUp';
import Profile from '@screens/Profile';
import Address from '@screens/Address';
import ServiceNew from '@screens/ServiceNew';
import ServiceImagesUpload from '@screens/ServiceImagesUpload';
import { Chat } from '@screens/Chat';
import About from '@screens/About';
import Addresses from '@screens/Addresses';
import MyServices from '@screens/MyServices';
import Availability from '@screens/Availability';
import { useAuth } from '@hooks/auth';
import { TabRoutes } from './tab.routes';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Tabs: undefined;
  Profile: undefined;
  ServiceNew: { serviceId?: string };
  Address: undefined;
  ServiceImagesUpload: { serviceId: string };
  Chat: {
    clientId: string;
    clientName: string;
    clientImage: string;
    serviceId: string;
    serviceName: string;
    chatId?: string;
  };
  About: undefined;
  Availability: undefined;
  Addresses: undefined;
  MyServices: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const StackRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isAuthenticated ? 'Tabs' : 'Login'}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Tabs" component={TabRoutes} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ServiceNew" component={ServiceNew} />
          <Stack.Screen name="Address" component={Address} />
          <Stack.Screen name="ServiceImagesUpload" component={ServiceImagesUpload} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="Availability" component={Availability} />
          <Stack.Screen name="Addresses" component={Addresses} />
          <Stack.Screen name="MyServices" component={MyServices} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
};


