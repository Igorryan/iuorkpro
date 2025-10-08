import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import theme from '@theme/index';
import { api } from '@config/api';

type Props = { route: { params: { serviceId: string } } };

const ServiceImagesUpload: React.FC<Props> = ({ route }) => {
  const { serviceId } = route.params;
  const [uris, setUris] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  async function pickImages() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsMultipleSelection: true, quality: 0.7 });
    if (res.canceled) return;
    const newUris = (res.assets || []).map((a) => a.uri).filter(Boolean) as string[];
    setUris((prev) => [...prev, ...newUris]);
  }

  async function uploadImages() {
    if (!uris.length) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      uris.forEach((uri, idx) => {
        const name = `service-${serviceId}-${Date.now()}-${idx}.jpg`;
        form.append('files', { uri, name, type: 'image/jpeg' } as any);
      });
      await api.post(`/services/${serviceId}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Sucesso', 'Imagens enviadas com sucesso!');
      setUris([]);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Erro ao enviar imagens';
      Alert.alert('Erro', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 12 }}>Adicionar fotos do serviço</Text>

        <TouchableOpacity onPress={pickImages} style={{ backgroundColor: theme.COLORS.PRIMARY, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Escolher fotos</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {uris.map((u) => (
            <Image key={u} source={{ uri: u }} style={{ width: 100, height: 100, borderRadius: 8, marginRight: 8, marginBottom: 8 }} />
          ))}
        </View>

        <TouchableOpacity onPress={uploadImages} disabled={!uris.length || submitting} style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 12, borderRadius: 8, alignItems: 'center', opacity: !uris.length || submitting ? 0.6 : 1, marginTop: 16 }}>
          <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>{submitting ? 'Enviando...' : 'Enviar fotos'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceImagesUpload;



