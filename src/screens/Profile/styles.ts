import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@theme/index';

export const Container = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
`;

export const LoadingContainer = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const ScreenTitle = styled(Text)`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.XXL}px;
  margin: 24px 24px 16px;
`;

export const CoverSection = styled(View)`
  position: relative;
  width: 100%;
  height: 220px;
  margin-bottom: 50px;
  overflow: visible;
`;

export const CoverImage = styled(Image)`
  width: 100%;
  height: 100%;
  background-color: ${theme.COLORS.GREY_10};
  resize-mode: cover;
`;

export const CoverPlaceholder = styled(View)`
  width: 100%;
  height: 100%;
  background-color: ${theme.COLORS.GREY_10};
  align-items: center;
  justify-content: center;
`;

export const CoverButton = styled(TouchableOpacity)`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${theme.COLORS.SECONDARY};
  align-items: center;
  justify-content: center;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 6px;
  elevation: 5;
`;

export const ProfileSection = styled(View)`
  align-items: center;
  padding: 0 24px 24px;
  margin-top: 20px;
`;

export const AvatarContainer = styled(View)`
  position: absolute;
  bottom: -70px;
  left: 50%;
  margin-left: -70px;
  width: 140px;
  height: 140px;
  z-index: 10;
`;

export const Avatar = styled(Image)`
  width: 140px;
  height: 140px;
  border-radius: 70px;
  background-color: ${theme.COLORS.GREY_10};
  border-width: 5px;
  border-color: ${theme.COLORS.WHITE};
`;

export const AvatarPlaceholder = styled(View)`
  width: 140px;
  height: 140px;
  border-radius: 70px;
  background-color: ${theme.COLORS.GREY_10};
  align-items: center;
  justify-content: center;
  border-width: 5px;
  border-color: ${theme.COLORS.WHITE};
`;

export const EditAvatarButton = styled(TouchableOpacity)`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${theme.COLORS.SECONDARY};
  align-items: center;
  justify-content: center;
  border-width: 4px;
  border-color: ${theme.COLORS.WHITE};
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 6px;
  elevation: 5;
  z-index: 20;
`;

export const UploadingOverlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 70px;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
`;

export const UserName = styled(Text)`
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.XL}px;
  color: ${theme.COLORS.PRIMARY};
  margin-bottom: 6px;
  text-align: center;
`;

export const UserEmail = styled(Text)`
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: ${theme.FONT_SIZE.MD}px;
  color: ${theme.COLORS.GREY_60};
  text-align: center;
`;

export const SectionCard = styled(View)`
  background-color: ${theme.COLORS.WHITE};
  border-radius: 16px;
  padding: 20px;
  margin: 0 24px 16px;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 3;
`;

export const LastSectionCard = styled(View)`
  background-color: ${theme.COLORS.WHITE};
  border-radius: 16px;
  padding: 20px;
  margin: 0 24px 0;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 3;
`;

export const SectionHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

export const SectionTitle = styled(Text)`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.LG}px;
  margin-left: 10px;
`;

export const SectionBody = styled(View)``;

export const BioInput = styled(TextInput)`
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 12px;
  padding: 16px;
  min-height: 100px;
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: ${theme.FONT_SIZE.MD}px;
  color: ${theme.COLORS.PRIMARY};
  border: 1px solid ${theme.COLORS.GREY_20};
`;

export const PrimaryText = styled(Text)`
  color: ${theme.COLORS.PRIMARY};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.LG}px;
  margin-bottom: 4px;
`;

export const SecondaryText = styled(Text)`
  color: ${theme.COLORS.GREY_60};
  font-family: ${theme.FONT_FAMILY.REGULAR};
  font-size: ${theme.FONT_SIZE.SM}px;
`;

export const SaveButton = styled(TouchableOpacity)<{ disabled?: boolean }>`
  background-color: ${theme.COLORS.SECONDARY};
  border-radius: 12px;
  padding: 16px 24px;
  margin: 0 24px 16px;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  shadow-color: ${theme.COLORS.SECONDARY};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 2;
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

export const ButtonsRow = styled(View)`
  flex-direction: row;
  gap: 8px;
`;

export const BaseButton = styled(TouchableOpacity)`
  border-radius: 12px;
  padding: 14px 20px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
`;

export const DangerButton = styled(BaseButton)`
  background-color: ${theme.COLORS.ERROR}15;
  border: 1px solid ${theme.COLORS.ERROR}30;
  flex: 1;
`;

export const ButtonTextPrimary = styled(Text)`
  color: ${theme.COLORS.WHITE};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.MD}px;
`;

export const ButtonTextDanger = styled(Text)`
  color: ${theme.COLORS.ERROR};
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.SM}px;
`;

export const Icon = styled(Ionicons).attrs({ size: 22, color: theme.COLORS.PRIMARY })``;

export const ModalContainer = styled(View)`
  background-color: ${theme.COLORS.WHITE};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding-top: 20px;
  max-height: 90%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const ModalHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_20};
`;

export const ModalTitle = styled(Text)`
  font-family: ${theme.FONT_FAMILY.BOLD};
  font-size: ${theme.FONT_SIZE.XL}px;
  color: ${theme.COLORS.PRIMARY};
`;

