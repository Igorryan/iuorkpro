import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import theme from '@theme/index';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import { useFocusEffect } from '@react-navigation/native';
import { getUserAddress } from '@functions/getUserAddress';
import type { IAddress } from '../types/address';

type Nav = StackNavigationProp<RootStackParamList, 'Profile'>;

const Home: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [address, setAddress] = React.useState<IAddress | undefined>(undefined);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        const a = await getUserAddress();
        if (mounted) setAddress(a);
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );
  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND, padding: 24 }}>
      <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
        Início do Profissional
      </Text>

      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.COLORS.GREY_20, marginBottom: 16 }}>
        <Text style={{ color: theme.COLORS.PRIMARY, fontFamily: theme.FONT_FAMILY.BOLD }}>
          {address?.street ? `${address.street}${address.number ? `, ${address.number}` : ''}` : 'Endereço não definido'}
        </Text>
        <Text style={{ color: theme.COLORS.PRIMARY, opacity: 0.8 }}>
          {address?.city ? `${address.city} - ${address.state}` : 'Defina seu endereço para encontrar clientes próximos.'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Address')} style={{ alignSelf: 'flex-start', backgroundColor: theme.COLORS.SECONDARY, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 10 }}>
          <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
            {address ? 'Alterar endereço' : 'Definir endereço'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Ir ao perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;


