import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@routes/stack.routes';
import theme from '@theme/index';
import { useAuth } from '@hooks/auth';

type Nav = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUp: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSignUp = async () => {
    setError(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Preencha nome, email e senha');
      return;
    }
    setLoading(true);
    try {
      await signUp({ fullName: fullName.trim(), email: email.trim(), password });
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || 'Falha ao criar conta';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.COLORS.BACKGROUND }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Text style={{ fontSize: theme.FONT_SIZE.XL, fontFamily: theme.FONT_FAMILY.BOLD, color: theme.COLORS.PRIMARY, marginBottom: 16 }}>
          Criar conta
        </Text>
        <TextInput
          placeholder="Nome completo"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          style={{ backgroundColor: theme.COLORS.WHITE, borderRadius: 8, padding: 12, marginBottom: 16 }}
        />
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
        <TouchableOpacity disabled={loading} onPress={handleSignUp} style={{ opacity: loading ? 0.7 : 1, backgroundColor: theme.COLORS.SECONDARY, padding: 14, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: theme.COLORS.WHITE, fontFamily: theme.FONT_FAMILY.BOLD }}>{loading ? 'Enviando...' : 'Continuar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ padding: 14, alignItems: 'center' }}>
          <Text style={{ color: theme.COLORS.SECONDARY }}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;


