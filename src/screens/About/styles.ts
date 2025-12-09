import { View, Text, Image, TouchableOpacity, TextInput as RNTextInput, ScrollView, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@theme/index';

export const Container = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: ${theme.COLORS.WHITE};
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

export const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
  flex: 1;
  text-align: center;
  margin-right: 24px;
`;

export const EditButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.COLORS.PRIMARY};
`;

export const SaveButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.COLORS.PRIMARY};
`;

export const SectionCard = styled.View`
  background-color: ${theme.COLORS.WHITE};
  margin: 12px 20px;
  padding: 16px;
  border-radius: 12px;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

export const SectionHeader = styled.View`
  margin-bottom: 8px;
`;

export const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.COLORS.GREY_60};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SectionValue = styled.Text`
  font-size: 16px;
  color: ${theme.COLORS.GREY_80};
  line-height: 24px;
`;

export const TextInput = styled(RNTextInput)`
  font-size: 16px;
  color: ${theme.COLORS.GREY_80};
  padding: 12px;
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 8px;
  border-width: 1px;
  border-color: ${theme.COLORS.GREY_20};
  margin-top: 8px;
`;

export const SelectButton = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 8px;
  border-width: 1px;
  border-color: ${theme.COLORS.GREY_20};
`;

export const SelectButtonText = styled.Text`
  font-size: 16px;
  color: ${theme.COLORS.GREY_80};
`;

export const SheetHeader = styled.View`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

export const SheetTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
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

