import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

const Login: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Falha no login';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
        Entrar
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ backgroundColor: theme.COLORS.WHITE, borderRadius: 8, padding: 12, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ backgroundColor: theme.COLORS.WHITE, borderRadius: 8, padding: 12, marginBottom: 16 }}
      />
      {error ? (
        <Text style={{ color: theme.COLORS.WARNING, marginBottom: 8 }}>{error}</Text>
      ) : null}
      <TouchableOpacity disabled={loading} onPress={handleLogin} style={{ opacity: loading ? 0.7 : 1, backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ padding: 14, alignItems: 'center' }}>
        <Text style={{ color: theme.COLORS.SECONDARY }}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;


