import React from 'react';
import { View, Text } from 'react-native';
import theme from '@theme/index';

const NewEmpty: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: theme.FONT_SIZE.LG, color: theme.COLORS.PRIMARY }}>Tela vazia</Text>
    </View>
  );
};

export default NewEmpty;


