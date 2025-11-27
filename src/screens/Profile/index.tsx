import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ActivityIndicator, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

  // Carregar profissões disponíveis
  const loadProfessions = React.useCallback(async () => {
    try {
      const { data } = await api.get('/professions');
      setProfessions(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissões:', error);
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
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
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
        setAvatarUri(result.assets[0].uri);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
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
        setCoverUri(result.assets[0].uri);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // Salva a bio e profissão
      await api.put('/professionals/me/profile', { 
        bio,
        professionId: selectedProfessionId,
      });

      // Envia a foto de perfil se tiver sido selecionada
      if (avatarUri) {
        const form = new FormData();
        const name = `avatar-${Date.now()}.jpg`;
        form.append('file', {
          uri: avatarUri,
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
      }

      // Envia a foto de capa se tiver sido selecionada
      if (coverUri) {
        const form = new FormData();
        const name = `cover-${Date.now()}.jpg`;
        form.append('file', {
          uri: coverUri,
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
      }

      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erro ao atualizar perfil';
      Alert.alert('Erro', message);
    } finally {
      setIsSaving(false);
    }
  }

  function renderSelectedAddress() {
    const title = selectedAddress?.street
      ? `${selectedAddress.street}${selectedAddress.number ? `, ${selectedAddress.number}` : ''}`
      : 'Endereço não definido';
    const subtitle = selectedAddress?.city ? `${selectedAddress.city} - ${selectedAddress.state}` : 'Defina seu endereço para receber pedidos próximos.';
    return (
      <S.SectionCard>
        <S.SectionHeader>
          <S.Icon name="location-outline" />
          <S.SectionTitle>Endereço</S.SectionTitle>
        </S.SectionHeader>
        <S.SectionBody>
          <S.PrimaryText>{title}</S.PrimaryText>
          <S.SecondaryText>{subtitle}</S.SecondaryText>
          <TouchableOpacity
            onPress={() => navigation.navigate('Address')}
            style={{
              marginTop: 12,
              alignSelf: 'flex-start',
              backgroundColor: theme.COLORS.SECONDARY,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <S.ButtonTextPrimary style={{ fontSize: 14 }}>
              {selectedAddress ? 'Alterar endereço' : 'Definir endereço'}
            </S.ButtonTextPrimary>
          </TouchableOpacity>
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
                    onPress={() => {
                      setSelectedProfessionId(item.id);
                      setIsEditing(true);
                      setShowProfessionPicker(false);
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
    </SafeAreaView>
  );
};

export default Profile;
