import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
        Meu Perfil
      </Text>
      <Text style={{ fontSize: theme.FONT_SIZE.MD, color: theme.COLORS.PRIMARY, marginBottom: 8 }}>Nome: {user?.name}</Text>
      <Text style={{ fontSize: theme.FONT_SIZE.MD, color: theme.COLORS.PRIMARY, marginBottom: 24 }}>Email: {user?.email || '-'}</Text>
      <TouchableOpacity onPress={logout} style={{ backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;


