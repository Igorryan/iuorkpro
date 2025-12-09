import styled from 'styled-components/native';
import theme from '@theme/index';

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  padding-bottom: 24px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

export const Title = styled.Text`
  font-size: 20px;
  font-family: ${theme.FONT_FAMILY.BOLD};
  color: ${theme.COLORS.PRIMARY};
  flex: 1;
`;

