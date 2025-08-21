import { NavigationContainer } from '@react-navigation/native';
import { StackRoutes } from './stack.routes';
import { useAuth } from '@hooks/auth';
import { View, ActivityIndicator } from 'react-native';
import theme from '@theme/index';

export function Routes() {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.COLORS.SECONDARY} />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <StackRoutes />
    </NavigationContainer>
  );
}


