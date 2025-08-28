import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import theme from '@theme/index';
import { InputFindAddress } from '@components/InputFindAddress';
import type { IAddress } from '../../types/address';
import { addAddressToHistory, getAddressHistory, setUserAddress } from '@functions/getUserAddress';
import { useNavigation } from '@react-navigation/native';

const AddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const [address, setAddress] = React.useState<IAddress | undefined>(undefined);
  const [history, setHistory] = React.useState<IAddress[]>([]);

  const loadHistory = React.useCallback(async () => {
    const list = await getAddressHistory();
    setHistory(list);
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleChangeAddress(a: IAddress) {
    setAddress(a);
    await addAddressToHistory(a);
    loadHistory();
  }

  async function handleSave() {
    if (!address) return;
    await setUserAddress(address);
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
          Definir endereço
        </Text>

        <InputFindAddress changeAddress={handleChangeAddress} />

        {address && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 16, borderWidth: 1, borderColor: theme.COLORS.GREY_20 }}>
            <Text style={{ color: theme.COLORS.PRIMARY, fontFamily: theme.FONT_FAMILY.BOLD }} numberOfLines={1}>
              {`${address.street}${address.number ? `, ${address.number}` : ''}`}
            </Text>
            <Text style={{ color: theme.COLORS.PRIMARY, opacity: 0.8 }} numberOfLines={1}>
              {`${address.city} - ${address.state}`}
            </Text>
          </View>
        )}

        {history.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 8 }}>Recentes</Text>
            {history.map((item, idx) => (
              <TouchableOpacity
                key={`${item.latitude}-${item.longitude}-${idx}`}
                onPress={() => setAddress(item)}
                style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.COLORS.GREY_20 }}
              >
                <Text style={{ color: theme.COLORS.PRIMARY }} numberOfLines={1}>
                  {`${item.street}${item.number ? `, ${item.number}` : ''}`}
                </Text>
                <Text style={{ color: theme.COLORS.PRIMARY, opacity: 0.7 }} numberOfLines={1}>
                  {`${item.city} - ${item.state}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
        <TouchableOpacity
          disabled={!address}
          onPress={handleSave}
          style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 12, alignItems: 'center', opacity: address ? 1 : 0.6 }}
        >
          <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressScreen;


