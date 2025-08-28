import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import theme from '@theme/index';
import { api } from '@config/api';

const EditProfile: React.FC = () => {
  const [bio, setBio] = React.useState('');
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (asset?.uri) setAvatarUri(asset.uri);
  }

  async function saveBio() {
    setSubmitting(true);
    try {
      await api.put('/professionals/me/profile', { bio });
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadAvatar() {
    if (!avatarUri) return;
    setSubmitting(true);
    try {
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND, padding: 24 }}>
      <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>Editar Perfil</Text>

      <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Conte um pouco sobre você..."
        multiline
        style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.COLORS.GREY_20 }}
      />
      <TouchableOpacity onPress={saveBio} disabled={submitting} style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Salvar bio</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />

      <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Foto de perfil</Text>
      {!!avatarUri && (
        <Image source={{ uri: avatarUri }} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 8 }} />
      )}
      <TouchableOpacity onPress={pickImage} style={{ backgroundColor: theme.COLORS.PRIMARY, padding: 12, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>{avatarUri ? 'Trocar foto' : 'Escolher foto'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={uploadAvatar} disabled={!avatarUri || submitting} style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10, opacity: avatarUri ? 1 : 0.6 }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Enviar foto</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfile;


