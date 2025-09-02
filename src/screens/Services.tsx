import React from 'react';
import styled from 'styled-components/native';
import theme from '@theme/index';
import { api } from '@config/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@routes/stack.routes';
import { SafeAreaView } from 'react-native-safe-area-context';

type Nav = StackNavigationProp<RootStackParamList, 'ServiceNew'>;

const Services: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [services, setServices] = React.useState<Array<{ id: string; name: string; description: string; price: number | null; pricingType?: 'FIXED' | 'HOURLY' | 'BUDGET'; images?: string[] }>>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/services/mine');
        setServices(res.data);
      } catch {}
    })();
  }, []);

  function handleDelete(id: string) {
    (async () => {
      try {
        await api.delete(`/services/${id}`);
        const res = await api.get('/services/mine');
        setServices(res.data);
      } catch {}
    })();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <Container>
      <HeaderRow>
        <Title>Meus Serviços</Title>
        <PrimaryButton onPress={() => navigation.navigate('ServiceNew')}>
          <Ionicons name="add" size={18} color={theme.COLORS.WHITE} />
          <ButtonTextPrimary>Novo</ButtonTextPrimary>
        </PrimaryButton>
      </HeaderRow>

      {services.length === 0 ? (
        <Empty>
          <Ionicons name="construct-outline" size={36} color={theme.COLORS.GREY_40} />
          <EmptyTitle>Nenhum serviço cadastrado.</EmptyTitle>
          <EmptySubtitle>Cadastre seu primeiro serviço para começar.</EmptySubtitle>
        </Empty>
      ) : (
        <List>
          {services.map((item) => {
            const images = item.images || [];
            const visible = images.slice(0, 3);
            const remaining = images.length - visible.length;
            return (
              <Card key={item.id}>
                <CardTitle>{item.name}</CardTitle>
                {!!item.description && <CardSubtitle numberOfLines={2}>{item.description}</CardSubtitle>}
                <CardText>
                  Preço: {item.price != null ? `R$ ${item.price.toFixed(2)}` : 'Sob orçamento'}
                  {item.price != null && item.pricingType === 'HOURLY' ? ' / hora' : item.price != null && item.pricingType === 'FIXED' ? ' (fixo)' : ''}
                </CardText>

                {!!visible.length && (
                  <ImagesRow>
                    {visible.map((url, index) => (
                      <ImageBox key={url}>
                        <ImageThumb source={{ uri: url }} />
                        {remaining > 0 && index === visible.length - 1 && (
                          <ImageOverlay>
                            <OverlayText>+{remaining}</OverlayText>
                          </ImageOverlay>
                        )}
                      </ImageBox>
                    ))}
                  </ImagesRow>
                )}

                <ButtonsRow>
                  <SecondaryButton onPress={() => navigation.navigate('ServiceNew', { serviceId: item.id })}>
                    <ButtonTextSecondary>Editar</ButtonTextSecondary>
                  </SecondaryButton>
                  <SecondaryButton onPress={() => navigation.navigate('ServiceImagesUpload', { serviceId: item.id })}>
                    <ButtonTextSecondary>Adicionar fotos</ButtonTextSecondary>
                  </SecondaryButton>
                  <SecondaryButton onPress={() => handleDelete(item.id)}>
                    <ButtonTextSecondary>Excluir</ButtonTextSecondary>
                  </SecondaryButton>
                </ButtonsRow>
              </Card>
            );
          })}
        </List>
      )}
      </Container>
    </SafeAreaView>
  );
};

export default Services;

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
  padding: 24px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.XL}px;
`;

const Empty = styled.View`
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
`;

const EmptyTitle = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  margin-top: 8px;
`;

const EmptySubtitle = styled.Text`
  color: ${theme.COLORS.GREY_80};
  text-align: center;
`;

const List = styled.View`
  margin-top: 12px;
  gap: 8px;
`;

const Card = styled.View`
  background-color: ${theme.COLORS.WHITE};
  border: 1px solid ${theme.COLORS.GREY_10};
  border-radius: 12px;
  padding: 12px;
`;

const CardTitle = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
`;

const CardSubtitle = styled.Text`
  color: ${theme.COLORS.GREY_80};
`;

const CardText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
`;

const ImagesRow = styled.View`
  flex-direction: row;
  margin-top: 8px;
`;

const ImageBox = styled.View`
  width: 84px;
  height: 84px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 8px;
  background-color: #eee;
`;

const ImageThumb = styled.Image`
  width: 100%;
  height: 100%;
`;

const ImageOverlay = styled.View.attrs(() => ({
  style: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}))``;

const OverlayText = styled.Text`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
`;

const BaseButton = styled.TouchableOpacity`
  border-radius: 10px;
  padding: 10px 12px;
  align-items: center;
  justify-content: center;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: ${theme.COLORS.SECONDARY};
  flex-direction: row;
  gap: 6px;
`;

const SecondaryButton = styled(BaseButton)`
  background-color: ${theme.COLORS.GREY_20}90;
`;

const ButtonTextPrimary = styled.Text`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
`;

const ButtonTextSecondary = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
`;


