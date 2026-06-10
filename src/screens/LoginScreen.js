// Tela de login/cadastro com Firebase Auth.
import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import FormInput from '../components/FormInput';
import ActionButton from '../components/ActionButton';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const isSubmitDisabled = useMemo(() => {
    if (loading) return true;
    if (!email.trim() || !password.trim()) return true;
    if (isRegister && password !== confirmPassword) return true;
    return false;
  }, [loading, email, password, confirmPassword, isRegister]);

  const handleSubmit = async () => {
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe e-mail e senha.');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      Alert.alert('Senhas diferentes', 'Confirme a mesma senha.');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error) {
      const message =
        error?.message && typeof error.message === 'string'
          ? error.message
          : 'Não foi possível autenticar. Verifique os dados.';
      setAuthError(message);
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Ionicons name="medkit" size={26} color={colors.white} />
          </View>
          <Text style={styles.brand}>Odonto App</Text>
          <Text style={styles.tagline}>
            {isRegister ? 'Crie seu acesso para começar.' : 'Acesse sua clínica em poucos cliques.'}
          </Text>
        </View>

        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segmentButton, !isRegister && styles.segmentButtonActive]}
            onPress={() => setIsRegister(false)}
          >
            <Text style={[styles.segmentText, !isRegister && styles.segmentTextActive]}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, isRegister && styles.segmentButtonActive]}
            onPress={() => setIsRegister(true)}
          >
            <Text style={[styles.segmentText, isRegister && styles.segmentTextActive]}>
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isRegister ? 'Dados do novo usuário' : 'Dados de acesso'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isRegister
              ? 'Use um e-mail válido para receber comunicações.'
              : 'Entre com o e-mail cadastrado no sistema.'}
          </Text>
          <FormInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="email@dominio.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {isRegister ? (
            <FormInput
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita sua senha"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : null}

          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
        </View>

        <ActionButton
          title={loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        />

        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setIsRegister(prev => !prev)}
        >
          <Text style={styles.toggleText}>
            {isRegister ? 'Já tenho conta' : 'Não tenho conta'}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32 },
  hero: { alignItems: 'center', marginTop: 12, marginBottom: 16 },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.azul,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  brand: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  tagline: {
    marginTop: 6,
    textAlign: 'center',
    color: colors.textGray,
    fontWeight: '600'
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 6,
    marginBottom: 16
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  },
  segmentText: {
    fontWeight: '700',
    color: colors.textGray
  },
  segmentTextActive: {
    color: colors.textDark
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 16,
    marginBottom: 16
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  cardSubtitle: { marginTop: 4, marginBottom: 12, color: colors.textGray, fontWeight: '600' },
  errorText: { color: '#DC2626', fontWeight: '600', marginTop: 4 },
  toggle: {
    marginTop: 16,
    alignItems: 'center'
  },
  toggleText: { color: colors.corBotoes, fontWeight: '700' }
});
