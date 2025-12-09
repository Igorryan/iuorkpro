import React, { useState, useRef, useMemo } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ActivityIndicator, Modal, FlatList, TouchableOpacity, View, Text, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import { api } from '@config/api';
import * as S from './styles';

type Nav = StackNavigationProp<RootStackParamList, 'About'>;

const About: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  
  // Estados para edição
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para avatar e cover
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userCover, setUserCover] = useState<string | null>(null);
  
  // Estados para profissão
  const [professions, setProfessions] = useState<Array<{ id: string; name: string; category: string | null }>>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState<string | null>(null);
  const [showProfessionPicker, setShowProfessionPicker] = useState(false);
  
  const professionSheetRef = useRef<BottomSheet>(null);
  const professionSnapPoints = useMemo(() => [Math.floor(windowHeight * 0.7)], [windowHeight]);

  // Carregar profissões disponíveis
  const loadProfessions = React.useCallback(async () => {
    try {
      const res = await api.get('/professions');
      setProfessions(res.data);
    } catch (error) {
      console.error('Erro ao carregar profissões:', error);
    }
  }, []);

  // Carregar dados do perfil
  const loadProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/professionals/me');
      setBio(res.data.bio || '');
      setSelectedProfessionId(res.data.professionId || null);
      setUserAvatar(res.data.avatarUrl || null);
      setUserCover(res.data.coverUrl || null);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      if (error?.response?.status === 401) {
        Alert.alert('Erro', 'Sua sessão expirou. Por favor, faça login novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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
            Alert.alert('Sucesso', 'Foto de perfil atualizada!');
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
            Alert.alert('Sucesso', 'Foto de capa atualizada!');
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

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      loadProfessions();
    }, [loadProfile, loadProfessions])
  );

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put('/professionals/me/profile', {
        bio: bio.trim() || null,
        professionId: selectedProfessionId || null,
      });
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      loadProfile();
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', error?.response?.data?.message || 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProfession = professions.find(p => p.id === selectedProfessionId);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
        <S.LoadingContainer>
          <ActivityIndicator size="large" color={theme.COLORS.PRIMARY} />
        </S.LoadingContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} edges={['top']}>
      <S.Container>
        <S.Header>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.COLORS.GREY_80} />
          </TouchableOpacity>
          <S.HeaderTitle>Sobre</S.HeaderTitle>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color={theme.COLORS.PRIMARY} />
              ) : (
                <S.SaveButtonText>Salvar</S.SaveButtonText>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <S.EditButtonText>Editar</S.EditButtonText>
            </TouchableOpacity>
          )}
        </S.Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Foto de Capa com Avatar Sobreposto */}
          <S.CoverSection>
            {coverUri || userCover ? (
              <S.CoverImage source={{ uri: coverUri || userCover || '' }} />
            ) : (
              <S.CoverPlaceholder>
                <Ionicons name="image-outline" size={48} color={theme.COLORS.GREY_40} />
              </S.CoverPlaceholder>
            )}
            <S.CoverButton onPress={pickCover} disabled={isSaving}>
              <Ionicons name="camera" size={20} color={theme.COLORS.WHITE} />
            </S.CoverButton>
            
            {/* Avatar sobreposto à capa */}
            <S.AvatarContainer>
              {avatarUri || userAvatar ? (
                <S.Avatar source={{ uri: avatarUri || userAvatar || '' }} />
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
              <S.SectionTitle>Profissão</S.SectionTitle>
            </S.SectionHeader>
            {isEditing ? (
              <TouchableOpacity
                onPress={() => {
                  setShowProfessionPicker(true);
                  professionSheetRef.current?.expand();
                }}
                style={{ marginTop: 12 }}
              >
                <S.SelectButton>
                  <S.SelectButtonText>
                    {selectedProfession ? selectedProfession.name : 'Selecione uma profissão'}
                  </S.SelectButtonText>
                  <Ionicons name="chevron-down" size={20} color={theme.COLORS.GREY_60} />
                </S.SelectButton>
              </TouchableOpacity>
            ) : (
              <S.SectionValue>
                {selectedProfession ? selectedProfession.name : 'Não definida'}
              </S.SectionValue>
            )}
          </S.SectionCard>

          {/* Descrição */}
          <S.SectionCard>
            <S.SectionHeader>
              <S.SectionTitle>Descrição</S.SectionTitle>
            </S.SectionHeader>
            {isEditing ? (
              <S.TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Descreva seus serviços e experiência..."
                placeholderTextColor={theme.COLORS.GREY_40}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
            ) : (
              <S.SectionValue>
                {bio || 'Nenhuma descrição adicionada'}
              </S.SectionValue>
            )}
          </S.SectionCard>
        </ScrollView>

        {/* Bottom Sheet para seleção de profissão */}
        <BottomSheet
          ref={professionSheetRef}
          index={-1}
          snapPoints={professionSnapPoints}
          enablePanDownToClose
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
          )}
          onClose={() => setShowProfessionPicker(false)}
        >
          <BottomSheetScrollView>
            <S.SheetHeader>
              <S.SheetTitle>Selecione uma profissão</S.SheetTitle>
            </S.SheetHeader>
            {professions.map((profession) => (
              <TouchableOpacity
                key={profession.id}
                onPress={() => {
                  setSelectedProfessionId(profession.id);
                  professionSheetRef.current?.close();
                }}
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.COLORS.GREY_10,
                }}
              >
                <Text style={{ fontSize: 16, color: theme.COLORS.GREY_80 }}>
                  {profession.name}
                </Text>
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        </BottomSheet>
      </S.Container>
    </SafeAreaView>
  );
};

export default About;

