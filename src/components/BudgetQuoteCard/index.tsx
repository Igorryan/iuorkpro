import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import theme from '@theme/index';
import { createBudget, Budget } from '@api/callbacks/budget';

interface BudgetQuoteCardProps {
  serviceName: string;
  serviceId: string;
  chatId: string | null;
  currentBudget?: Budget | null;
  onBudgetSent?: () => void;
}

export const BudgetQuoteCard: React.FC<BudgetQuoteCardProps> = ({ 
  serviceName, 
  serviceId, 
  chatId, 
  currentBudget,
  onBudgetSent 
}) => {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Carregar dados do orçamento existente quando expandir
  useEffect(() => {
    if (isExpanded && currentBudget && parseFloat(currentBudget.price) > 0) {
      // Preencher campos com dados do orçamento existente
      setPrice(currentBudget.price);
      setDescription(currentBudget.description || '');
    } else if (!isExpanded) {
      // Limpar campos quando fechar
      setPrice('');
      setDescription('');
    }
  }, [isExpanded, currentBudget]);

  // Animar overlay após o modal aparecer
  useEffect(() => {
    if (isExpanded) {
      // Resetar e mostrar overlay
      setShowOverlay(true);
      overlayOpacity.setValue(0);
      // Delay para a sombra aparecer após o modal estar visível
      const timer = setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200, // Fade in suave
          useNativeDriver: true,
        }).start();
      }, 300); // Espera a animação de slide do modal (300ms)

      return () => clearTimeout(timer);
    } else {
      // Esconder overlay quando modal fechar
      setShowOverlay(false);
    }
  }, [isExpanded]);

  const handleClose = () => {
    if (isLoading) return;
    
    // Sombra desaparece instantaneamente removendo do render
    setShowOverlay(false);
    
    // Delay de 0,1s após a sombra desaparecer, depois fecha o modal
    setTimeout(() => {
      setIsExpanded(false);
    }, 1);
  };


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
        const isEdit = currentBudget && parseFloat(currentBudget.price) > 0;
        Alert.alert('Sucesso', isEdit ? 'Orçamento atualizado! O cliente receberá uma notificação.' : 'Orçamento enviado! O cliente receberá uma notificação.');
        
        // Resetar campos
        setPrice('');
        setDescription('');
        setIsExpanded(false);
        
        // Notificar o Chat para recarregar o orçamento
        if (onBudgetSent) {
          setTimeout(() => {
            onBudgetSent();
          }, 500);
        }
      } else {
        throw new Error('Falha ao criar/atualizar orçamento');
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

  const hasExistingBudget = !!(currentBudget && parseFloat(currentBudget.price) > 0);
  const buttonText = hasExistingBudget ? 'Editar Orçamento' : 'Enviar Orçamento';
  const modalTitle = hasExistingBudget ? 'Editar Orçamento' : 'Enviar Orçamento';
  const buttonIcon = hasExistingBudget ? 'create-outline' : 'pricetag-outline';

  if (!isExpanded) {
    return (
      <ExpandButton onPress={() => setIsExpanded(true)} hasBudget={hasExistingBudget}>
        <LeftContent>
          <Ionicons name={buttonIcon} size={20} color={theme.COLORS.WHITE} />
          <ExpandButtonText>{buttonText}</ExpandButtonText>
        </LeftContent>
        {hasExistingBudget && (
          <BudgetValue>
            <BudgetValueText>R$ {parseFloat(currentBudget!.price).toFixed(2).replace('.', ',')}</BudgetValueText>
          </BudgetValue>
        )}
      </ExpandButton>
    );
  }

  return (
    <Modal
      visible={isExpanded}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <ModalContainer>
        {showOverlay && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: overlayOpacity,
            }}
          >
            <TouchableWithoutFeedback onPress={handleClose}>
              <ModalOverlay />
            </TouchableWithoutFeedback>
          </Animated.View>
        )}
        <TouchableWithoutFeedback>
          <ModalContent>
              <Header>
                <HeaderIconContainer>
                  <Ionicons name={hasExistingBudget ? 'create' : 'pricetag'} size={24} color={theme.COLORS.SECONDARY} />
                </HeaderIconContainer>
                <HeaderTitleContainer>
                  <HeaderTitle>{modalTitle}</HeaderTitle>
                  {hasExistingBudget && (
                    <HeaderSubtitle>Atualize as informações do orçamento</HeaderSubtitle>
                  )}
                </HeaderTitleContainer>
                <CloseButton onPress={handleClose} disabled={isLoading}>
                  <Ionicons name="close" size={22} color={theme.COLORS.GREY_60} />
                </CloseButton>
              </Header>

              <ServiceInfoContainer>
                <ServiceLabel>Serviço</ServiceLabel>
                <ServiceName>{serviceName}</ServiceName>
              </ServiceInfoContainer>

              <FormContainer>
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
                    placeholderTextColor={theme.COLORS.GREY_40}
                  />
                </PriceInputContainer>

                <Label>Descrição (opcional)</Label>
                <DescriptionInput
                  placeholder="Ex: Inclui material, prazo de 2 horas..."
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  maxLength={200}
                  editable={!isLoading}
                  placeholderTextColor={theme.COLORS.GREY_40}
                />
              </FormContainer>

              <Footer>
                <CancelButton onPress={handleClose} disabled={isLoading}>
                  <CancelButtonText>Cancelar</CancelButtonText>
                </CancelButton>
                <SendButton onPress={handleSendQuote} disabled={isLoading || !price || parseFloat(price) <= 0}>
                  {isLoading ? (
                    <ActivityIndicator color={theme.COLORS.WHITE} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color={theme.COLORS.WHITE} />
                      <SendButtonText>{hasExistingBudget ? 'Atualizar' : 'Enviar'}</SendButtonText>
                    </>
                  )}
                </SendButton>
              </Footer>
            </ModalContent>
        </TouchableWithoutFeedback>
      </ModalContainer>
    </Modal>
  );
};

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const ModalOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px;
  padding-bottom: 40px;
  max-height: 90%;
  shadow-color: ${({ theme }) => theme.COLORS.SHADOW};
  shadow-offset: 0px -4px;
  shadow-opacity: 0.2;
  shadow-radius: 12px;
  elevation: 8;
  z-index: 1;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const HeaderIconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.COLORS.SECONDARY}15;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const HeaderTitleContainer = styled.View`
  flex: 1;
`;

const HeaderTitle = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.XL}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
  margin-bottom: 4px;
`;

const HeaderSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
`;

const CloseButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.COLORS.GREY_10};
  align-items: center;
  justify-content: center;
`;

const ServiceInfoContainer = styled.View`
  background-color: ${({ theme }) => theme.COLORS.GREY_10};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.COLORS.SECONDARY};
`;

const ServiceLabel = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ServiceName = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
`;

const FormContainer = styled.View`
  margin-bottom: 24px;
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
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 12px;
  padding: 16px;
  border: 2px solid ${({ theme }) => theme.COLORS.SECONDARY}30;
  margin-bottom: 20px;
`;

const CurrencySymbol = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.XL}px;
  color: ${({ theme }) => theme.COLORS.SECONDARY};
  margin-right: 8px;
`;

const PriceInput = styled.TextInput`
  flex: 1;
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.XL}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
  padding: 0;
`;

const DescriptionInput = styled.TextInput`
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 12px;
  padding: 16px;
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  min-height: 100px;
  text-align-vertical: top;
  border: 2px solid ${({ theme }) => theme.COLORS.GREY_20};
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
`;

const CancelButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.COLORS.GREY_20};
  align-items: center;
  justify-content: center;
`;

const CancelButtonText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
`;

const SendButton = styled(TouchableOpacity)<{ disabled?: boolean }>`
  flex: 2;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ theme, disabled }) => disabled ? theme.COLORS.GREY_20 : theme.COLORS.SECONDARY};
`;

const SendButtonText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.WHITE};
`;

const ExpandButton = styled(TouchableOpacity)<{ hasBudget?: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background-color: ${({ theme }) => theme.COLORS.PRIMARY};
  padding: 14px 20px;
  border-radius: 16px;
  margin: 12px 16px;
  shadow-color: ${({ theme }) => theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 4;
`;

const LeftContent = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const ExpandButtonText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.WHITE};
`;

const BudgetValue = styled.View`
  align-items: flex-end;
`;

const BudgetValueText = styled.Text`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.WHITE};
`;

