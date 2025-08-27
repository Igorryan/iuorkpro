import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@routes/stack.routes';
import type { StackNavigationProp } from '@react-navigation/stack';
import { api } from '@config/api';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = React.useState<Array<{ id: string; status: string; createdAt: string; service: { id: string; title: string } }>>([]);
  const [services, setServices] = React.useState<Array<{ id: string; name: string; description: string; price: number | null }>>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const [ordersRes, servicesRes] = await Promise.all([
          api.get('/bookings/mine'),
          user?.role === 'PRO' ? api.get('/services/mine') : Promise.resolve({ data: [] }),
        ]);
        setOrders(ordersRes.data);
        setServices(servicesRes.data);
      } catch (e) {
        // ignore
      }
    })();
  }, [user]);
  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND, padding: 24, paddingBottom: 0 }}>
      <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
        Meu Perfil
      </Text>
      <Text style={{ fontSize: theme.FONT_SIZE.MD, color: theme.COLORS.PRIMARY, marginBottom: 8 }}>Nome: {user?.name}</Text>
      <Text style={{ fontSize: theme.FONT_SIZE.MD, color: theme.COLORS.PRIMARY, marginBottom: 24 }}>Email: {user?.email || '-'}</Text>
      {user?.role === 'PRO' && (
        <TouchableOpacity
          onPress={() => navigation.navigate('ServiceNew')}
          style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Cadastrar serviço</Text>
        </TouchableOpacity>
      )}
      {user?.role === 'PRO' && (
        <>
          <Text style={{ fontSize: theme.FONT_SIZE.LG, color: theme.COLORS.PRIMARY, marginTop: 8, marginBottom: 8 }}>
            Meus Serviços
          </Text>
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
                <Text style={{ color: theme.COLORS.PRIMARY, fontFamily: theme.FONT_FAMILY.BOLD }}>{item.name}</Text>
                {!!item.description && (
                  <Text style={{ color: theme.COLORS.PRIMARY }} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <Text style={{ color: theme.COLORS.PRIMARY }}>
                  Preço: {item.price != null ? `R$ ${item.price.toFixed(2)}` : 'Sob orçamento'}
                </Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={{ color: theme.COLORS.PRIMARY, opacity: 0.7 }}>Nenhum serviço cadastrado.</Text>
            )}
            style={{ flexGrow: 0, maxHeight: 220 }}
          />
        </>
      )}
      <Text style={{ fontSize: theme.FONT_SIZE.LG, color: theme.COLORS.PRIMARY, marginTop: 8, marginBottom: 8 }}>
        Pedidos
      </Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
            <Text style={{ color: theme.COLORS.PRIMARY, fontFamily: theme.FONT_FAMILY.BOLD }}>{item.service.title}</Text>
            <Text style={{ color: theme.COLORS.PRIMARY }}>Status: {item.status}</Text>
            <Text style={{ color: theme.COLORS.PRIMARY }}>Criado em: {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{ color: theme.COLORS.PRIMARY, opacity: 0.7 }}>Nenhum pedido encontrado.</Text>
        )}
        style={{ flexGrow: 0, maxHeight: 260 }}
      />
      <TouchableOpacity onPress={logout} style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;


