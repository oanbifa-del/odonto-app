// Tela simples de carregamento (usada enquanto verifica login).
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import colors from '../styles/colors';

export default function LoadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Carregando...</Text>
        <Text style={styles.subtitle}>Aguarde um momento.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 24,
    alignItems: 'center'
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  subtitle: { marginTop: 6, color: colors.textGray, fontWeight: '600' }
});
