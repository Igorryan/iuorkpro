import React, { useRef, useMemo } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ActivityIndicator, Modal, FlatList, TouchableOpacity, View, Text, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import BottomSheetModal, { BottomSheetModalRef } from '@components/BottomSheetModal';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import { api } from '@config/api';
import { getUserAddress } from '@functions/getUserAddress';
import type { IAddress } from '../types/address';
import * as S from './styles';

type Nav = StackNavigationProp<RootStackParamList, 'Profile'>;

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [selectedAddress, setSelectedAddress] = React.useState<IAddress | undefined>(undefined);
  
  // Estados para edição de perfil
  const [bio, setBio] = React.useState('');
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [coverUri, setCoverUri] = React.useState<string | null>(null);
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);
  const [userCover, setUserCover] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Estados para profissão
  const [professions, setProfessions] = React.useState<Array<{ id: string; name: string; category: string | null }>>([]);
  const [selectedProfessionId, setSelectedProfessionId] = React.useState<string | null>(null);
  const [showProfessionPicker, setShowProfessionPicker] = React.useState(false);
  
  // Estados para raio de atendimento
  const [radiusKm, setRadiusKm] = React.useState<number>(5);
  const [tempRadiusKm, setTempRadiusKm] = React.useState<number>(5);
  const [mapReady, setMapReady] = React.useState(false);
  const mapRef = useRef<MapView>(null);
  const radiusSheetRef = useRef<BottomSheetModalRef>(null);

  // Carregar profissões disponíveis
  const loadProfessions = React.useCallback(async () => {
    try {
      const { data } = await api.get('/professions');
      setProfessions(data || []);
    } catch (error) {
      // Erro silencioso
    }
  }, []);

  // Carregar dados do perfil profissional
  const loadProfile = React.useCallback(async () => {
    try {
      const { data } = await api.get('/professionals/me');
      if (data) {
        setBio(data.bio || '');
        setUserAvatar(data.avatarUrl || null);
        setUserCover(data.coverUrl || null);
        setSelectedProfessionId(data.professionId || null);
        setRadiusKm(data.radiusKm || 5);
      }
    } catch (error) {
      // Erro silencioso
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfessions();
    loadProfile();
  }, [loadProfessions, loadProfile]);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const addr = await getUserAddress();
          if (mounted) setSelectedAddress(addr);
        } catch {}
      })();
      return () => {
        mounted = false;
      };
    }, []),
  );

  // Recarregar endereço quando voltar da tela de endereço
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUserAddress().then(setSelectedAddress).catch(() => {});
    });
    return unsubscribe;
  }, [navigation]);

  async function pickAvatar() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        
        // Salvar automaticamente
        try {
          setIsSaving(true);
          const form = new FormData();
          const name = `avatar-${Date.now()}.jpg`;
          form.append('file', {
            uri,
            name,
            type: 'image/jpeg',
          } as any);
          const { data } = await api.post('/professionals/me/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (data?.url) {
            setUserAvatar(data.url);
            setAvatarUri(null);
          }
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Erro ao atualizar foto de perfil';
          Alert.alert('Erro', message);
        } finally {
          setIsSaving(false);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  async function pickCover() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setCoverUri(uri);
        
        // Salvar automaticamente
        try {
          setIsSaving(true);
          const form = new FormData();
          const name = `cover-${Date.now()}.jpg`;
          form.append('file', {
            uri,
            name,
            type: 'image/jpeg',
          } as any);
          const { data } = await api.post('/professionals/me/cover', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (data?.url) {
            setUserCover(data.url);
            setCoverUri(null);
          }
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Erro ao atualizar foto de capa';
          Alert.alert('Erro', message);
        } finally {
          setIsSaving(false);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // Salva apenas a bio
      await api.put('/professionals/me/profile', { 
        bio,
      });

      setIsEditing(false);
      Alert.alert('Sucesso', 'Descrição atualizada com sucesso!');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erro ao atualizar descrição';
      Alert.alert('Erro', message);
    } finally {
      setIsSaving(false);
    }
  }

  // Salvar raio automaticamente quando o bottom sheet fechar
  const handleRadiusSheetClose = React.useCallback(async () => {
    setMapReady(false);
    
    // Validar antes de salvar
    if (tempRadiusKm < 1 || tempRadiusKm > 100) {
      Alert.alert('Erro', 'Por favor, selecione um raio válido entre 1 e 100 km.');
      // Reverter para o valor anterior
      setTempRadiusKm(radiusKm);
      return;
    }

    // Se o valor mudou, salvar automaticamente
    if (tempRadiusKm !== radiusKm) {
      try {
        await api.put('/professionals/me/radius', { radiusKm: tempRadiusKm });
        setRadiusKm(tempRadiusKm);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Erro ao atualizar raio de atendimento';
        Alert.alert('Erro', message);
        // Reverter para o valor anterior em caso de erro
        setTempRadiusKm(radiusKm);
      }
    }
  }, [tempRadiusKm, radiusKm]);

  // Calcular delta do mapa baseado no raio (aproximadamente)
  const mapDelta = useMemo(() => {
    // Aproximação: 1 grau de latitude ≈ 111 km
    // Para mostrar o círculo completo, precisamos de um delta maior que o raio
    const radiusInDegrees = tempRadiusKm / 111;
    const delta = Math.max(radiusInDegrees * 2.5, 0.05); // Mínimo de 0.05 para zoom razoável
    return {
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  }, [tempRadiusKm]);

  // Ajustar zoom do mapa quando o raio mudar
  React.useEffect(() => {
    if (selectedAddress?.latitude && selectedAddress?.longitude && mapRef.current && mapReady) {
      mapRef.current.animateToRegion({
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        ...mapDelta,
      }, 300);
    }
  }, [tempRadiusKm, selectedAddress, mapDelta, mapReady]);

  function renderSelectedAddress() {
    const title = selectedAddress?.street
      ? `${selectedAddress.street}${selectedAddress.number ? `, ${selectedAddress.number}` : ''}`
      : 'Endereço não definido';
    const subtitle = selectedAddress?.city ? `${selectedAddress.city} - ${selectedAddress.state}` : 'Defina seu endereço para receber pedidos próximos.';
    return (
      <S.SectionCard>
        <S.SectionHeader>
          <S.Icon name="location-outline" />
          <S.SectionTitle>Endereço e Raio de Atendimento</S.SectionTitle>
        </S.SectionHeader>
        <S.SectionBody>
          <S.PrimaryText>{title}</S.PrimaryText>
          <S.SecondaryText>{subtitle}</S.SecondaryText>
          <S.SecondaryText style={{ marginTop: 8 }}>
            Raio de atendimento: {radiusKm} km
          </S.SecondaryText>
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Address')}
              style={{
                flex: 1,
                backgroundColor: theme.COLORS.SECONDARY,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <S.ButtonTextPrimary style={{ fontSize: 14, textAlign: 'center' }}>
                {selectedAddress ? 'Alterar endereço' : 'Definir endereço'}
              </S.ButtonTextPrimary>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTempRadiusKm(radiusKm);
                setTimeout(() => {
                  radiusSheetRef.current?.open();
                }, 100);
              }}
              style={{
                flex: 1,
                backgroundColor: theme.COLORS.PRIMARY,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <S.ButtonTextPrimary style={{ fontSize: 14, textAlign: 'center' }}>
                Alterar raio
              </S.ButtonTextPrimary>
            </TouchableOpacity>
          </View>
        </S.SectionBody>
      </S.SectionCard>
    );
  }

  const displayAvatar = avatarUri || userAvatar;
  const displayCover = coverUri || userCover;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
        <S.LoadingContainer>
          <ActivityIndicator size="large" color={theme.COLORS.SECONDARY} />
        </S.LoadingContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
      <S.Container
        contentContainerStyle={{
          paddingBottom: 64 + insets.bottom,
        }}
      >
        {/* Foto de Capa com Avatar Sobreposto */}
        <S.CoverSection>
          {displayCover ? (
            <S.CoverImage source={{ uri: displayCover }} />
          ) : (
            <S.CoverPlaceholder>
              <Ionicons name="image-outline" size={48} color={theme.COLORS.GREY_40} />
            </S.CoverPlaceholder>
          )}
          <S.CoverButton onPress={pickCover}>
            <Ionicons name="camera" size={20} color={theme.COLORS.WHITE} />
          </S.CoverButton>
          
          {/* Avatar sobreposto à capa */}
          <S.AvatarContainer>
            {displayAvatar ? (
              <S.Avatar source={{ uri: displayAvatar }} />
            ) : (
              <S.AvatarPlaceholder>
                <Ionicons name="person" size={60} color={theme.COLORS.GREY_40} />
              </S.AvatarPlaceholder>
            )}
            {isSaving && (
              <S.UploadingOverlay>
                <ActivityIndicator size="small" color={theme.COLORS.WHITE} />
              </S.UploadingOverlay>
            )}
            <S.EditAvatarButton onPress={pickAvatar} disabled={isSaving}>
              <Ionicons name="camera" size={18} color={theme.COLORS.WHITE} />
            </S.EditAvatarButton>
          </S.AvatarContainer>
        </S.CoverSection>

        {/* Informações do Usuário */}
        <S.ProfileSection>
          <S.UserName>{user?.name}</S.UserName>
          {user?.email && <S.UserEmail>{user.email}</S.UserEmail>}
        </S.ProfileSection>

        {/* Profissão */}
        <S.SectionCard>
          <S.SectionHeader>
            <S.Icon name="briefcase-outline" />
            <S.SectionTitle>Profissão</S.SectionTitle>
          </S.SectionHeader>
          <S.SectionBody>
            <TouchableOpacity
              onPress={() => setShowProfessionPicker(true)}
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: theme.COLORS.GREY_40,
                borderRadius: 8,
                backgroundColor: theme.COLORS.WHITE,
              }}
            >
              <S.PrimaryText style={{ 
                color: selectedProfessionId 
                  ? theme.COLORS.GREY_80 
                  : theme.COLORS.GREY_40,
                fontSize: 16,
              }}>
                {selectedProfessionId 
                  ? professions.find(p => p.id === selectedProfessionId)?.name || 'Selecione sua profissão'
                  : 'Selecione sua profissão'}
              </S.PrimaryText>
            </TouchableOpacity>
          </S.SectionBody>
        </S.SectionCard>

        {/* Bio */}
        <S.SectionCard>
          <S.SectionHeader>
            <S.Icon name="document-text-outline" />
            <S.SectionTitle>Sobre</S.SectionTitle>
          </S.SectionHeader>
          <S.SectionBody>
            <S.BioInput
              value={bio}
              onChangeText={(text: string) => {
                setBio(text);
                setIsEditing(true);
              }}
              placeholder="Conte um pouco sobre você..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </S.SectionBody>
        </S.SectionCard>

        {renderSelectedAddress()}

        {/* Botão de Salvar */}
        {isEditing && (
          <S.SaveButton onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.COLORS.WHITE} />
            ) : (
              <S.ButtonTextPrimary>Salvar alterações</S.ButtonTextPrimary>
            )}
          </S.SaveButton>
        )}

        {/* Ações */}
        <S.LastSectionCard>
          <S.SectionHeader>
            <S.Icon name="settings-outline" />
            <S.SectionTitle>Ações</S.SectionTitle>
          </S.SectionHeader>
          <S.ButtonsRow>
            <S.DangerButton onPress={logout}>
              <S.ButtonTextDanger>Sair</S.ButtonTextDanger>
            </S.DangerButton>
          </S.ButtonsRow>
        </S.LastSectionCard>

        {/* Modal de seleção de profissão */}
        <Modal
          visible={showProfessionPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowProfessionPicker(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <S.ModalContainer>
              <S.ModalHeader>
                <S.ModalTitle>Selecione sua profissão</S.ModalTitle>
                <TouchableOpacity onPress={() => setShowProfessionPicker(false)}>
                  <Ionicons name="close" size={24} color={theme.COLORS.GREY_80} />
                </TouchableOpacity>
              </S.ModalHeader>
              <FlatList
                data={professions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={async () => {
                      const newProfessionId = item.id;
                      setSelectedProfessionId(newProfessionId);
                      setShowProfessionPicker(false);
                      
                      // Salvar profissão automaticamente
                      try {
                        await api.put('/professionals/me/profile', { 
                          professionId: newProfessionId,
                        });
                      } catch (error: any) {
                        const message = error?.response?.data?.message || 'Erro ao atualizar profissão';
                        Alert.alert('Erro', message);
                        // Reverter em caso de erro
                        setSelectedProfessionId(selectedProfessionId);
                      }
                    }}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.COLORS.GREY_20,
                      backgroundColor: selectedProfessionId === item.id 
                        ? theme.COLORS.SECONDARY + '20' 
                        : theme.COLORS.WHITE,
                    }}
                  >
                    <S.PrimaryText style={{ 
                      fontSize: 16,
                      color: theme.COLORS.GREY_80,
                      fontWeight: selectedProfessionId === item.id ? '600' : '400',
                    }}>
                      {item.name}
                    </S.PrimaryText>
                  </TouchableOpacity>
                )}
              />
            </S.ModalContainer>
          </SafeAreaView>
        </Modal>
      </S.Container>
      
      {/* Bottom Sheet renderizado fora do ScrollView para ficar fixo */}
      <BottomSheetModal
        ref={radiusSheetRef}
        title="Raio de Atendimento"
        heightPercentage={0.7}
        onClose={handleRadiusSheetClose}
      >
        {selectedAddress?.latitude && selectedAddress?.longitude ? (
          <>
            {/* Mapa com círculo */}
            <View style={{ height: 300, marginHorizontal: 24, marginTop: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.COLORS.GREY_10 }}>
              {selectedAddress?.latitude && selectedAddress?.longitude && (
                <MapView
                  ref={mapRef}
                  style={{ flex: 1 }}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                  initialRegion={{
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude,
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
                          latitude: selectedAddress.latitude,
                          longitude: selectedAddress.longitude,
                        }}
                        radius={tempRadiusKm * 1000}
                        fillColor={theme.COLORS.SECONDARY + '20'}
                        strokeColor={theme.COLORS.SECONDARY}
                        strokeWidth={2}
                      />
                      <Marker
                        key="marker-center"
                        coordinate={{
                          latitude: selectedAddress.latitude,
                          longitude: selectedAddress.longitude,
                        }}
                        pinColor={Platform.OS === 'ios' ? theme.COLORS.SECONDARY : undefined}
                      />
                    </>
                  )}
                </MapView>
              )}
            </View>

            {/* Slider e informações */}
            <View style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <S.SecondaryText>Raio de atendimento</S.SecondaryText>
                <S.PrimaryText style={{ fontSize: 18 }}>{tempRadiusKm} km</S.PrimaryText>
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

              <S.SecondaryText style={{ marginTop: 16, marginBottom: 24 }}>
                Clientes fora deste raio não verão seu perfil nas buscas presenciais.
              </S.SecondaryText>

              <S.SecondaryText style={{ marginTop: 8, fontSize: 12, fontStyle: 'italic' }}>
                As alterações serão salvas automaticamente ao fechar.
              </S.SecondaryText>
            </View>
          </>
        ) : (
          <View style={{ padding: 24 }}>
            <S.SecondaryText style={{ marginBottom: 24, textAlign: 'center' }}>
              Você precisa definir um endereço antes de configurar o raio de atendimento.
            </S.SecondaryText>
            <TouchableOpacity
              onPress={() => {
                radiusSheetRef.current?.close();
                navigation.navigate('Address');
              }}
              style={{
                backgroundColor: theme.COLORS.SECONDARY,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <S.ButtonTextPrimary>Definir Endereço</S.ButtonTextPrimary>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default Profile;
