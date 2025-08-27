import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import theme from '@theme/index';
import { api } from '@config/api';
import { useNavigation } from '@react-navigation/native';

type Category = { id: string; name: string };

const ServiceNew: React.FC = () => {
  const navigation = useNavigation();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [pricingType, setPricingType] = React.useState<'BUDGET' | 'FIXED' | 'HOURLY'>('BUDGET');
  const [price, setPrice] = React.useState('');
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoryId, setCategoryId] = React.useState<string | undefined>(undefined);
  const [imagesText, setImagesText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data as Category[]);
      } catch (e) {
        // noop
      }
    })();
  }, []);

  const handleSubmit = React.useCallback(async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Atenção', 'Título e descrição são obrigatórios.');
      return;
    }
    setIsSubmitting(true);
    try {
      const images = imagesText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        pricingType,
        categoryId: categoryId ?? undefined,
        images: images.length ? images : undefined,
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
      await api.post('/services', payload);
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Erro ao cadastrar serviço';
      Alert.alert('Erro', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, pricingType, price, categoryId, imagesText, navigation]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }} contentContainerStyle={{ padding: 24 }}>
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
            <Text style={{ color: pricingType === pt ? theme.COLORS.WHITE : theme.COLORS.PRIMARY }}>{pt}</Text>
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

      <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Categoria (opcional)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setCategoryId((prev) => (prev === c.id ? undefined : c.id))}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 16,
              backgroundColor: categoryId === c.id ? theme.COLORS.SECONDARY : '#eee',
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: categoryId === c.id ? theme.COLORS.WHITE : theme.COLORS.PRIMARY }}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ color: theme.COLORS.PRIMARY, marginBottom: 6 }}>Imagens (URLs, separadas por vírgula)</Text>
      <TextInput
        placeholder="https://... , https://..."
        placeholderTextColor={theme.COLORS.SECONDARY}
        value={imagesText}
        onChangeText={setImagesText}
        style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 16 }}
      />

      <TouchableOpacity
        disabled={isSubmitting}
        onPress={handleSubmit}
        style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center', opacity: isSubmitting ? 0.6 : 1 }}
      >
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>
          {isSubmitting ? 'Enviando...' : 'Cadastrar serviço'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ServiceNew;



