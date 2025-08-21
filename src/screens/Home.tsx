import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import theme from '@theme/index';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;

const Home: React.FC = () => {
  const navigation = useNavigation<Nav>();
  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
        Início do Profissional
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('NewEmpty')} style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Ir para tela vazia</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;


