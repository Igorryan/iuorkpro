import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import theme from '@theme/index';
import { createBudget } from '@api/callbacks/budget';

interface BudgetQuoteCardProps {
  serviceName: string;
  serviceId: string;
  chatId: string | null;
}

export const BudgetQuoteCard: React.FC<BudgetQuoteCardProps> = ({ serviceName, serviceId, chatId }) => {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendQuote = async () => {
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Atenção', 'Por favor, informe um valor válido.');
      return;
    }

    if (!chatId) {
      Alert.alert('Erro', 'Chat não encontrado. Por favor, tente novamente.');
      return;
    }

    setIsLoading(true);

    try {
      const numericPrice = parseFloat(price);
      
      const budget = await createBudget({
        chatId,
        serviceId,
        price: numericPrice,
        description: description || undefined,
      });

      if (budget) {
        Alert.alert('Sucesso', 'Orçamento enviado! O cliente receberá uma notificação.');
        
        // Resetar campos
        setPrice('');
        setDescription('');
        setIsExpanded(false);
      } else {
        throw new Error('Falha ao criar orçamento');
      }
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
      Alert.alert('Erro', 'Não foi possível enviar o orçamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Converte para centavos
    const cents = parseInt(numbers || '0');
    
    // Formata como moeda
    return (cents / 100).toFixed(2);
  };

  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text);
    setPrice(formatted);
  };

  if (!isExpanded) {
    return (
      <ExpandButton onPress={() => setIsExpanded(true)}>
        <Ionicons name="pricetag-outline" size={20} color={theme.COLORS.SECONDARY} />
        <ExpandButtonText>Enviar Orçamento</ExpandButtonText>
      </ExpandButton>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderTitle>Enviar Orçamento</HeaderTitle>
        <CloseButton onPress={() => setIsExpanded(false)} disabled={isLoading}>
          <Ionicons name="close" size={24} color={theme.COLORS.GREY_60} />
        </CloseButton>
      </Header>

      <ServiceLabel>Serviço:</ServiceLabel>
      <ServiceName>{serviceName}</ServiceName>

      <Label>Valor do Serviço *</Label>
      <PriceInputContainer>
        <CurrencySymbol>R$</CurrencySymbol>
        <PriceInput
          placeholder="0,00"
          keyboardType="numeric"
          value={price}
          onChangeText={handlePriceChange}
          maxLength={10}
          editable={!isLoading}
        />
      </PriceInputContainer>

      <Label>Descrição (opcional)</Label>
      <DescriptionInput
        placeholder="Ex: Inclui material, prazo de 2 horas..."
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
        maxLength={200}
        editable={!isLoading}
      />

      <Footer>
        <CancelButton onPress={() => setIsExpanded(false)} disabled={isLoading}>
          <CancelButtonText>Cancelar</CancelButtonText>
        </CancelButton>
        <SendButton onPress={handleSendQuote} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={theme.COLORS.WHITE} />
          ) : (
            <SendButtonText>Enviar Orçamento</SendButtonText>
          )}
        </SendButton>
      </Footer>
    </Container>
  );
};

const Container = styled.View`
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  shadow-color: ${({ theme }) => theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const HeaderTitle = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.LG}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
`;

const CloseButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const ServiceLabel = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-bottom: 4px;
`;

const ServiceName = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  margin-bottom: 16px;
`;

const Label = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  margin-bottom: 8px;
  margin-top: 8px;
`;

const PriceInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND};
  border-radius: 8px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.COLORS.GREY_20};
`;

const CurrencySymbol = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.LG}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  margin-right: 8px;
`;

const PriceInput = styled.TextInput`
  flex: 1;
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.LG}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  padding: 0;
`;

const DescriptionInput = styled.TextInput`
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND};
  border-radius: 8px;
  padding: 12px;
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  min-height: 80px;
  text-align-vertical: top;
  border: 1px solid ${({ theme }) => theme.COLORS.GREY_20};
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const CancelButton = styled(TouchableOpacity)`
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.COLORS.GREY_20};
`;

const CancelButtonText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
`;

const SendButton = styled(TouchableOpacity)`
  padding: 12px 20px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.COLORS.SECONDARY};
`;

const SendButtonText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.WHITE};
`;

const ExpandButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.COLORS.SECONDARY};
  margin: 8px 16px;
`;

const ExpandButtonText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme}) => theme.COLORS.SECONDARY};
`;

