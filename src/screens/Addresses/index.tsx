import React, { useRef, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import BottomSheetModal, { BottomSheetModalRef } from '@components/BottomSheetModal';
import theme from '@theme/index';
import { InputFindAddress } from '@components/InputFindAddress';
import type { IAddress } from '../../types/address';
import { addAddressToHistory, getAddressHistory, setUserAddress, getUserAddress } from '@functions/getUserAddress';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@config/api';

const AddressesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const [address, setAddress] = React.useState<IAddress | undefined>(undefined);
  const [history, setHistory] = React.useState<IAddress[]>([]);
  const [savedAddress, setSavedAddress] = React.useState<IAddress | undefined>(undefined);
  
  // Estados para raio de atendimento
  const [radiusKm, setRadiusKm] = React.useState<number>(5);
  const [tempRadiusKm, setTempRadiusKm] = React.useState<number>(5);
  const [mapReady, setMapReady] = React.useState(false);
  const mapRef = useRef<MapView>(null);
  const radiusSheetRef = useRef<BottomSheetModalRef>(null);

  const loadHistory = React.useCallback(async () => {
    const list = await getAddressHistory();
    setHistory(list);
  }, []);

  // Carregar endereço salvo e raio
  const loadSavedData = useCallback(async () => {
    try {
      const saved = await getUserAddress();
      if (saved) {
        setSavedAddress(saved);
        setAddress(saved);
      }
      
      // Carregar raio de atendimento
      const res = await api.get('/professionals/me');
      if (res.data?.radiusKm) {
        setRadiusKm(res.data.radiusKm);
        setTempRadiusKm(res.data.radiusKm);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      loadSavedData();
    }, [loadHistory, loadSavedData])
  );

  async function handleChangeAddress(a: IAddress) {
    setAddress(a);
    await addAddressToHistory(a);
    loadHistory();
  }

  async function handleSave() {
    if (!address) return;
    await setUserAddress(address);
    setSavedAddress(address);
    Alert.alert('Sucesso', 'Endereço salvo com sucesso!');
  }

  // Salvar raio automaticamente quando o bottom sheet fechar
  const handleRadiusSheetClose = useCallback(async () => {
    setMapReady(false);
    
    // Validar raio antes de salvar
    if (tempRadiusKm < 1 || tempRadiusKm > 100) {
      Alert.alert('Erro', 'Por favor, selecione um raio válido entre 1 e 100 km.');
      setTempRadiusKm(radiusKm);
      return;
    }

    // Salvar apenas se houve mudança
    if (tempRadiusKm !== radiusKm) {
      try {
        await api.put('/professionals/me/radius', { radiusKm: tempRadiusKm });
        setRadiusKm(tempRadiusKm);
        Alert.alert('Sucesso', 'Raio de atendimento atualizado!');
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Erro ao atualizar raio de atendimento';
        Alert.alert('Erro', message);
        setTempRadiusKm(radiusKm);
      }
    }
  }, [tempRadiusKm, radiusKm]);

  // Calcular delta do mapa baseado no raio
  const mapDelta = useMemo(() => {
    const radiusInDegrees = tempRadiusKm / 111;
    const delta = Math.max(radiusInDegrees * 2.5, 0.05);
    return {
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  }, [tempRadiusKm]);

  // Ajustar zoom do mapa quando o raio mudar
  React.useEffect(() => {
    if (savedAddress?.latitude && savedAddress?.longitude && mapRef.current && mapReady) {
      mapRef.current.animateToRegion({
        latitude: savedAddress.latitude,
        longitude: savedAddress.longitude,
        ...mapDelta,
      }, 300);
    }
  }, [tempRadiusKm, savedAddress, mapDelta, mapReady]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.COLORS.GREY_10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.COLORS.GREY_80} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.GREY_80, marginLeft: 12, flex: 1 }}>
            Endereços
          </Text>
        </View>

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

          {/* Endereço salvo e raio de atendimento */}
          {savedAddress && (
            <View style={{ marginTop: 24 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.COLORS.GREY_20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.COLORS.SUCCESS} />
                  <Text style={{ fontSize: 14, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.GREY_60, marginLeft: 8, textTransform: 'uppercase' }}>
                    Endereço Atual
                  </Text>
                </View>
                <Text style={{ color: theme.COLORS.PRIMARY, fontFamily: theme.FONT_FAMILY.BOLD, fontSize: 16 }} numberOfLines={1}>
                  {`${savedAddress.street}${savedAddress.number ? `, ${savedAddress.number}` : ''}`}
                </Text>
                <Text style={{ color: theme.COLORS.PRIMARY, opacity: 0.8, marginTop: 4 }} numberOfLines={1}>
                  {`${savedAddress.city} - ${savedAddress.state}`}
                </Text>
                <Text style={{ color: theme.COLORS.GREY_60, marginTop: 12, fontSize: 14 }}>
                  Raio de atendimento: {radiusKm} km
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setTempRadiusKm(radiusKm);
                    setTimeout(() => {
                      radiusSheetRef.current?.open();
                    }, 100);
                  }}
                  style={{
                    marginTop: 12,
                    backgroundColor: theme.COLORS.PRIMARY,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
                    Configurar Raio de Atendimento
                  </Text>
                </TouchableOpacity>
              </View>
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

      {/* Bottom Sheet para configuração de raio */}
      <BottomSheetModal
        ref={radiusSheetRef}
        title="Raio de Atendimento"
        heightPercentage={0.7}
        onClose={handleRadiusSheetClose}
      >
        {savedAddress?.latitude && savedAddress?.longitude ? (
          <>
            {/* Mapa com círculo */}
            <View style={{ height: 300, marginHorizontal: 24, marginTop: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.COLORS.GREY_10 }}>
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                  latitude: savedAddress.latitude,
                  longitude: savedAddress.longitude,
                  latitudeDelta: mapDelta.latitudeDelta,
                  longitudeDelta: mapDelta.longitudeDelta,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                loadingEnabled={true}
                onMapReady={() => {
                  setTimeout(() => {
                    setMapReady(true);
                  }, 500);
                }}
              >
                {mapReady && (
                  <>
                    <Circle
                      key={`circle-${tempRadiusKm}`}
                      center={{
                        latitude: savedAddress.latitude,
                        longitude: savedAddress.longitude,
                      }}
                      radius={tempRadiusKm * 1000}
                      fillColor={theme.COLORS.SECONDARY + '20'}
                      strokeColor={theme.COLORS.SECONDARY}
                      strokeWidth={2}
                    />
                    <Marker
                      key="marker-center"
                      coordinate={{
                        latitude: savedAddress.latitude,
                        longitude: savedAddress.longitude,
                      }}
                      pinColor={Platform.OS === 'ios' ? theme.COLORS.SECONDARY : undefined}
                    />
                  </>
                )}
              </MapView>
            </View>

            {/* Slider e informações */}
            <View style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: theme.COLORS.GREY_60 }}>Raio de atendimento</Text>
                <Text style={{ fontSize: 18, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY }}>{tempRadiusKm} km</Text>
              </View>
              
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={tempRadiusKm}
                onValueChange={setTempRadiusKm}
                minimumTrackTintColor={theme.COLORS.SECONDARY}
                maximumTrackTintColor={theme.COLORS.GREY_20}
                thumbTintColor={theme.COLORS.SECONDARY}
              />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: theme.COLORS.GREY_60 }}>1 km</Text>
                <Text style={{ fontSize: 12, color: theme.COLORS.GREY_60 }}>100 km</Text>
              </View>

              <Text style={{ marginTop: 16, marginBottom: 24, fontSize: 14, color: theme.COLORS.GREY_60 }}>
                Clientes fora deste raio não verão seu perfil nas buscas presenciais.
              </Text>

              <Text style={{ marginTop: 8, fontSize: 12, fontStyle: 'italic', color: theme.COLORS.GREY_60 }}>
                As alterações serão salvas automaticamente ao fechar.
              </Text>
            </View>
          </>
        ) : (
          <View style={{ padding: 24 }}>
            <Text style={{ marginBottom: 24, textAlign: 'center', fontSize: 14, color: theme.COLORS.GREY_60 }}>
              Você precisa definir um endereço antes de configurar o raio de atendimento.
            </Text>
            <TouchableOpacity
              onPress={() => {
                radiusSheetRef.current?.close();
              }}
              style={{
                backgroundColor: theme.COLORS.SECONDARY,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default AddressesScreen;

