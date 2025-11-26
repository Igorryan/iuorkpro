import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '@config/api';
import { getUserAddress } from '@functions/getUserAddress';
import type { IAddress } from '../types/address';
import * as S from './styles';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
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

  // Carregar dados do perfil profissional
  const loadProfile = React.useCallback(async () => {
    try {
      const { data } = await api.get('/professionals/me');
      if (data) {
        setBio(data.bio || '');
        setUserAvatar(data.avatarUrl || null);
        setUserCover(data.coverUrl || null);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
      // Salva a bio se tiver sido alterada
      await api.put('/professionals/me/profile', { bio });

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
      </S.Container>
    </SafeAreaView>
  );
};

export default Profile;
