import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '@screens/Auth/Login';
import SignUp from '@screens/Auth/SignUp';
import Profile from '@screens/Profile';
import Address from '@screens/Address';
import ServiceNew from '@screens/ServiceNew';
import EditProfile from '@screens/EditProfile';
import { useAuth } from '@hooks/auth';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Profile: undefined;
  ServiceNew: undefined;
  Address: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const StackRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ServiceNew" component={ServiceNew} />
          <Stack.Screen name="Address" component={Address} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
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


