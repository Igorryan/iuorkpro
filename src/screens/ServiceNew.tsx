import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import theme from '@theme/index';
import { api } from '@config/api';
import { useNavigation } from '@react-navigation/native';

const ServiceNew: React.FC = () => {
  const navigation = useNavigation();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [pricingType, setPricingType] = React.useState<'BUDGET' | 'FIXED' | 'HOURLY'>('BUDGET');
  const [price, setPrice] = React.useState('');
  const [pickedUris, setPickedUris] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Atenção', 'Título e descrição são obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        pricingType,
        images: undefined,
      };
      if (pricingType === 'FIXED' || pricingType === 'HOURLY') {
        const numericPrice = Number(price.replace(',', '.'));
        if (!Number.isFinite(numericPrice)) {
          Alert.alert('Atenção', 'Preço inválido.');
          setIsSubmitting(false);
          return;
        }
        payload.price = numericPrice;
      }
      
      // 1) Cria o serviço
      const { data: created } = await api.post('/services', payload);

      // 2) Se houver imagens selecionadas, DEVE enviar todas com sucesso
      if (pickedUris.length > 0) {
        try {
          const form = new FormData();
          pickedUris.forEach((uri, idx) => {
            const name = `service-${created.id}-${Date.now()}-${idx}.jpg`;
            form.append('files', { uri, name, type: 'image/jpeg' } as any);
          });
          await api.post(`/services/${created.id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        } catch (imageError: any) {
          // Se falhar o upload das imagens, deleta o serviço criado
          await api.delete(`/services/${created.id}`);
          const imageErrorMessage = imageError?.response?.data?.message || 'Erro ao enviar as fotos';
          Alert.alert('Erro', `${imageErrorMessage}. O serviço não foi cadastrado.`);
          setIsSubmitting(false);
          return;
        }
      }
      
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Erro ao cadastrar serviço';
      Alert.alert('Erro', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, pricingType, price, pickedUris, navigation]);

  async function pickImages() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsMultipleSelection: true, quality: 0.7 });
    if ((res as any).canceled) return;
    const newUris = (res.assets || []).map((a) => a.uri).filter(Boolean) as string[];
    setPickedUris((prev) => [...prev, ...newUris]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
          Novo Serviço
        </Text>

        <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Título</Text>
        <TextInput
          placeholder="Ex: Limpeza residencial"
          placeholderTextColor={theme.COLORS.SECONDARY}
          value={title}
          onChangeText={setTitle}
          style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12 }}
        />

        <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Descrição</Text>
        <TextInput
          placeholder="Descreva seu serviço"
          placeholderTextColor={theme.COLORS.SECONDARY}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, textAlignVertical: 'top' }}
        />

        <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Tipo de preço</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['BUDGET', 'FIXED', 'HOURLY'] as const).map((pt) => (
            <TouchableOpacity
              key={pt}
              onPress={() => setPricingType(pt)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: pricingType === pt ? theme.COLORS.SECONDARY : '#eee',
              }}
            >
              <Text style={{ color: pricingType === pt ? theme.COLORS.WHITE : theme.COLORS.PRIMARY }}>
                {pt === 'BUDGET' ? 'Orçamento' : pt === 'FIXED' ? 'Preço fixo' : 'Por hora'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(pricingType === 'FIXED' || pricingType === 'HOURLY') && (
          <>
            <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Preço</Text>
            <TextInput
              placeholder="Ex: 120.00"
              placeholderTextColor={theme.COLORS.SECONDARY}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12 }}
            />
          </>
        )}

        <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Fotos do serviço (opcional)</Text>
        <TouchableOpacity onPress={pickImages} style={{ backgroundColor: theme.COLORS.PRIMARY, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
            {pickedUris.length > 0 ? `Adicionar mais (${pickedUris.length} selecionada${pickedUris.length > 1 ? 's' : ''})` : 'Escolher fotos'}
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {pickedUris.map((u) => (
            <Image key={u} source={{ uri: u }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8, marginBottom: 8 }} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            disabled={isSubmitting}
            onPress={() => navigation.goBack()}
            style={{ 
              flex: 1,
              backgroundColor: theme.COLORS.GREY_20,
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            <Text style={{ color: theme.COLORS.PRIMARY, fontFamily: theme.FONT_FAMILY.BOLD }}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={{ 
              flex: 1,
              backgroundColor: theme.COLORS.SECONDARY,
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
              {isSubmitting ? 'Enviando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceNew;



