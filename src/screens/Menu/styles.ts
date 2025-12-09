import styled from 'styled-components/native';
import theme from '@theme/index';

export const Container = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
`;

export const Header = styled.View`
  padding: 20px;
  background-color: ${theme.COLORS.WHITE};
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

export const Title = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
`;

export const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: ${theme.COLORS.WHITE};
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

export const MenuItemLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const IconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

export const MenuItemContent = styled.View`
  flex: 1;
`;

export const MenuItemTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.COLORS.GREY_80};
  margin-bottom: 4px;
`;

export const MenuItemSubtitle = styled.Text`
  font-size: 14px;
  color: ${theme.COLORS.GREY_60};
`;

