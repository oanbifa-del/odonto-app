// Tela de perfil do usuário e logout.
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOutUser } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair do sistema', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOutUser }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.white} />
          </View>
          <Text style={styles.name}>Usuário</Text>
          <Text style={styles.email}>{user?.email || 'email@dominio.com'}</Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="E-mail" value={user?.email || '-'} />
          <InfoRow label="Perfil" value="Administrador" />
          <InfoRow label="Status" value="Ativo" isLast />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.white} />
          <Text style={styles.logoutText}>Sair do sistema</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, isLast }) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.azul,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  name: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  email: { marginTop: 4, color: colors.textGray, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 16,
    marginBottom: 24
  },
  infoRow: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  infoRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0
  },
  infoLabel: { color: colors.textGray, fontWeight: '600', marginBottom: 6 },
  infoValue: { color: colors.textDark, fontWeight: '700' },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  logoutText: { color: colors.white, fontWeight: '700' }
});
