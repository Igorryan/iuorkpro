import React from 'react';
import styled from 'styled-components/native';
import theme from '@theme/index';
import { api } from '@config/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const Orders: React.FC = () => {
  const [orders, setOrders] = React.useState<Array<{ id: string; status: string; createdAt: string; service: { id: string; title: string } }>>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/mine');
        setOrders(res.data);
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <Container>
      <Title>Meus Pedidos</Title>
      {orders.length === 0 ? (
        <Empty>
          <EmptyTitle>Nenhum pedido por aqui</EmptyTitle>
          <EmptySubtitle>Você verá seus pedidos assim que seus clientes solicitarem um serviço.</EmptySubtitle>
        </Empty>
      ) : (
        <List>
          {orders.map((item) => (
            <Card key={item.id}>
              <CardTitle>{item.service.title}</CardTitle>
              <BadgeRow>
                <StatusBadge>
                  <StatusText>{item.status}</StatusText>
                </StatusBadge>
              </BadgeRow>
              <CardText>Data: {new Date(item.createdAt).toLocaleString()}</CardText>
            </Card>
          ))}
        </List>
      )}
      </Container>
    </SafeAreaView>
  );
};

export default Orders;

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
  padding: 24px;
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

const CardText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
`;

const BadgeRow = styled.View`
  flex-direction: row;
  margin-top: 6px;
  margin-bottom: 6px;
`;

const StatusBadge = styled.View`
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 999px;
  padding: 6px 10px;
`;

const StatusText = styled.Text`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.MEDIUM};
`;


