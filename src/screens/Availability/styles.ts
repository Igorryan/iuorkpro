import styled from 'styled-components/native';
import theme from '@theme/index';

export const Container = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.BACKGROUND};
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
`;

export const DayCard = styled.View`
  background-color: ${theme.COLORS.WHITE};
  margin: 8px 20px;
  padding: 16px;
  border-radius: 12px;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

export const DayHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const DayName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.COLORS.GREY_80};
`;

export const DayActions = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const TimeSlot = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 8px;
  margin-bottom: 8px;
`;

export const TimeRange = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const TimeText = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${theme.COLORS.GREY_80};
`;

export const TimeSeparator = styled.Text`
  font-size: 15px;
  color: ${theme.COLORS.GREY_60};
  margin: 0 8px;
`;

export const UnavailableText = styled.Text`
  font-size: 14px;
  color: ${theme.COLORS.GREY_60};
  font-style: italic;
  padding: 12px 0;
`;

export const ModalContainer = styled.View`
  background-color: ${theme.COLORS.WHITE};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 80%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const ModalHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

export const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
  flex: 1;
`;

export const ModalFooter = styled.View`
  padding: 20px;
  border-top-width: 1px;
  border-top-color: ${theme.COLORS.GREY_10};
`;

export const EditSheetHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.COLORS.GREY_10};
`;

export const EditSheetTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.COLORS.GREY_80};
  flex: 1;
`;

export const TimeInput = styled.TextInput`
  font-size: 16px;
  color: ${theme.COLORS.GREY_80};
  padding: 12px;
  background-color: ${theme.COLORS.GREY_10};
  border-radius: 8px;
  border-width: 1px;
  border-color: ${theme.COLORS.GREY_20};
`;

