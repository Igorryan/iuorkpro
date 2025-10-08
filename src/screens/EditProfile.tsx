import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import theme from '@theme/index';
import { api } from '@config/api';
import { useNavigation } from '@react-navigation/native';

const EditProfile: React.FC = () => {
  const navigation = useNavigation();
  const [bio, setBio] = React.useState('');
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [coverUri, setCoverUri] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function pickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (asset?.uri) setAvatarUri(asset.uri);
  }

  async function pickCover() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (asset?.uri) setCoverUri(asset.uri);
  }

  async function handleSave() {
    setSubmitting(true);
    try {
      // Salva a bio se tiver sido alterada
      if (bio.trim()) {
        await api.put('/professionals/me/profile', { bio });
      }

      // Envia a foto de perfil se tiver sido selecionada
      if (avatarUri) {
        const form = new FormData();
        const name = `avatar-${Date.now()}.jpg`;
        form.append('file', {
          uri: avatarUri,
          name,
          type: 'image/jpeg',
        } as any);
        await api.post('/professionals/me/avatar', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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
        await api.post('/professionals/me/cover', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erro ao atualizar perfil';
      Alert.alert('Erro', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <View style={{ flex: 1 }}>
        {/* Header com botão de voltar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={theme.COLORS.PRIMARY} />
          </TouchableOpacity>
          <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY }}>
            Editar Perfil
          </Text>
        </View>

        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre você..."
            multiline
            style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.COLORS.GREY_20 }}
          />

          <View style={{ height: 24 }} />

          <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Foto de capa</Text>
          {!!coverUri && (
            <Image source={{ uri: coverUri }} style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
          )}
          <TouchableOpacity onPress={pickCover} style={{ backgroundColor: theme.COLORS.PRIMARY, padding: 12, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
              {coverUri ? 'Trocar foto de capa' : 'Escolher foto de capa'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />

          <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Foto de perfil</Text>
          {!!avatarUri && (
            <Image source={{ uri: avatarUri }} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 8 }} />
          )}
          <TouchableOpacity onPress={pickAvatar} style={{ backgroundColor: theme.COLORS.PRIMARY, padding: 12, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
              {avatarUri ? 'Trocar foto de perfil' : 'Escolher foto de perfil'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />

          {/* Botão unificado de salvar */}
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={submitting || (!bio.trim() && !avatarUri && !coverUri)}
            style={{ 
              backgroundColor: theme.COLORS.SECONDARY, 
              padding: 14, 
              borderRadius: 8, 
              alignItems: 'center',
              opacity: (submitting || (!bio.trim() && !avatarUri && !coverUri)) ? 0.6 : 1
            }}
          >
            <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;


