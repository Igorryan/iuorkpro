import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import styled from 'styled-components/native';

export const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND};
`;

export const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.COLORS.GREY_20};
`;

export const BackButton = styled(TouchableOpacity)`
  padding: 8px;
  margin-right: 8px;
`;

export const HeaderContent = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const Avatar = styled(Image)`
  width: 42px;
  height: 42px;
  border-radius: 21px;
  background-color: ${({ theme }) => theme.COLORS.GREY_10};
  margin-right: 12px;
`;

export const AvatarPlaceholder = styled(View)`
  width: 42px;
  height: 42px;
  border-radius: 21px;
  background-color: ${({ theme }) => theme.COLORS.GREY_10};
  margin-right: 12px;
  align-items: center;
  justify-content: center;
`;

export const HeaderInfo = styled(View)`
  flex: 1;
`;

export const HeaderName = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.GREY};
`;

export const HeaderStatus = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.SUCCESS};
  margin-top: 2px;
`;

export const HeaderActions = styled(View)`
  flex-direction: row;
  gap: 8px;
`;

export const HeaderButton = styled(TouchableOpacity)`
  padding: 8px;
`;

export const MessagesContainer = styled(View)`
  flex: 1;
`;

export const MessagesList = styled(ScrollView)`
  flex: 1;
  padding-top: 16px;
`;

export const MessageWrapper = styled(View)<{ isMine: boolean }>`
  margin-bottom: 16px;
  align-items: ${({ isMine }) => (isMine ? 'flex-end' : 'flex-start')};
`;

export const MessageBubble = styled(View)<{ isMine: boolean }>`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 20px;
  background-color: ${({ theme, isMine }) => (isMine ? theme.COLORS.WHITE : theme.COLORS.GREY)};
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
`;

export const MessageText = styled(Text)<{ isMine: boolean }>`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme, isMine }) => (isMine ? theme.COLORS.GREY : theme.COLORS.WHITE)};
  line-height: 20px;
`;

export const MessageTime = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-top: 4px;
  padding: 0 4px;
`;

export const ImageMessageContainer = styled(View)`
  max-width: 75%;
`;

export const MessageImage = styled(Image)`
  width: 280px;
  height: 210px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.COLORS.GREY_10};
  margin-bottom: 8px;
`;

export const BudgetRequestWrapper = styled(View)`
  margin: 20px 0;
  padding: 16px;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 3;
`;

export const BudgetRequestHeader = styled(View)`
  flex-direction: row;
  align-items: center;
`;

export const ServiceIcon = styled(Image)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.COLORS.GREY_10};
  margin-right: 12px;
`;

export const BudgetRequestTitle = styled(Text)`
  flex: 1;
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  line-height: 20px;
`;

export const BudgetServiceName = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY};
`;

export const InputContainer = styled(View)`
  flex-direction: row;
  align-items: flex-end;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.COLORS.GREY_20};
  gap: 12px;
`;

export const InputWrapper = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND};
  border-radius: 24px;
  padding: 8px 12px;
  min-height: 44px;
`;

export const Input = styled(TextInput)`
  flex: 1;
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  max-height: 100px;
  padding: 4px 8px;
`;

export const InputActions = styled(View)`
  flex-direction: row;
  gap: 8px;
`;

export const InputButton = styled(TouchableOpacity)`
  padding: 4px;
`;

export const SendButton = styled(TouchableOpacity)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.COLORS.BLACK};
  align-items: center;
  justify-content: center;
`;

export const EmptyStateContainer = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 200px;
`;

export const EmptyStateText = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  text-align: center;
`;

export const RecordingContainer = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND};
  border-radius: 24px;
  gap: 12px;
`;

export const RecordingDot = styled(View)`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.COLORS.WARNING};
`;

export const RecordingText = styled(Text)`
  flex: 1;
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY};
`;

export const CancelRecordingButton = styled(TouchableOpacity)`
  padding: 8px 12px;
`;

export const CancelRecordingText = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.WARNING};
`;

export const DisabledText = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  text-align: center;
  padding: 12px 16px;
`;

// Mensagem de início do orçamento
export const BudgetInfoMessage = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

export const BudgetInfoIcon = styled(Text)`
  font-size: 20px;
  margin-right: 8px;
`;

export const BudgetInfoText = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_40};
  text-align: center;
`;

// Mensagem de orçamento finalizado
export const BudgetClosedContainer = styled(View)`
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.COLORS.GREY_20};
  padding: 20px 24px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const BudgetClosedMessage = styled(View)`
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 16px;
  elevation: 3;
  flex: 1;
  `;

export const BudgetClosedIcon = styled(Text)`
  font-size: 16px;
  margin-right: 6px;
`;

export const BudgetTitleContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const BudgetClosedTitle = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-bottom: 4px;
  margin-top: 4px;
  text-align: center;
`;

export const BudgetClosedText = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-bottom: 24px;
`;

export const BudgetClosedPrice = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-weight: 500;
  font-size: 22px;
  color: ${({ theme }) => theme.COLORS.GREY};
`;
export const BudgetServiceNameButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BudgetContractContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

export const BudgetPriceContainer = styled(View)`
`;

export const BudgetContractButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 16px;
  background-color: ${({ theme }) => theme.COLORS.BLACK};
  border-radius: 24px;
  align-items: center;
  justify-content: center;
`;

export const BudgetContractButtonText = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.WHITE};
`;

export const BudgetSentCard = styled(View)`
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 12px;
  padding: 16px;
  max-width: 75%;
  margin: 0;
  shadow-color: ${({ theme }) => theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  border: 2px solid ${({ theme }) => theme.COLORS.SECONDARY};
`;

export const BudgetSentHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

export const BudgetSentIconContainer = styled(View)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.COLORS.SECONDARY}20;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

export const BudgetSentHeaderContent = styled(View)`
  flex: 1;
`;

export const BudgetSentTitle = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.PRIMARY};
`;

export const BudgetSentSubtitle = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-top: 2px;
`;

export const BudgetSentServiceInfo = styled(View)`
  margin-bottom: 12px;
`;

export const BudgetSentServiceLabel = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-bottom: 4px;
`;

export const BudgetSentServiceName = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
  color: ${({ theme }) => theme.COLORS.GREY};
`;

export const BudgetSentPriceContainer = styled(View)`
  background-color: ${({ theme }) => theme.COLORS.SECONDARY}10;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
`;

export const BudgetSentPriceLabel = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  margin-bottom: 4px;
`;

export const BudgetSentPrice = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
  font-size: ${({ theme }) => theme.FONT_SIZE.XXL}px;
  color: ${({ theme }) => theme.COLORS.SECONDARY};
`;

export const BudgetSentDescriptionContainer = styled(View)`
  margin-bottom: 12px;
`;

export const BudgetSentDescriptionLabel = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.MEDIUM};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY};
  margin-bottom: 4px;
`;

export const BudgetSentDescription = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
  line-height: 20px;
`;

export const BudgetSentExpiryInfo = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const BudgetSentExpiryText = styled(Text)`
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR};
  font-size: ${({ theme }) => theme.FONT_SIZE.SSM}px;
  color: ${({ theme }) => theme.COLORS.GREY_60};
`;

