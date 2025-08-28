import { View } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;

  border: 1px solid ${({ theme }) => theme.COLORS.GREY_20};
  border-radius: 12px;

  background: ${({ theme }) => theme.COLORS.WHITE};

  padding: 0px 16px 0 16px;
`;

export const Icon = styled(Ionicons).attrs(({ theme }) => ({
  size: 20,
  color: theme.COLORS.GREY_60,
}))`
  position: absolute;
  z-index: 1;
  top: 17px;
  left: 16px;
`;


