import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function SyncStatusIndicator({ syncing = false, error = null }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!syncing) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 600, useNativeDriver: false }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: false })
      ])
    ).start();
  }, [syncing]);

  if (!syncing && !error) return null;

  const errorText =
    typeof error === 'string' && error.trim()
      ? error.trim()
      : 'Erro ao sincronizar';
  const label = error ? errorText : 'Sincronizando...';

  return (
    <View style={[styles.container, error && styles.containerError]}>
      <Animated.View style={[styles.icon, syncing && { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons
          name={error ? 'alert-circle-outline' : 'cloud-outline'}
          size={14}
          color={error ? '#DC2626' : colors.azul}
        />
      </Animated.View>
      <Text style={[styles.text, error && styles.textError]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  containerError: {
    backgroundColor: '#FEE2E2'
  },
  icon: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 11,
    color: colors.azul,
    fontWeight: '600'
  },
  textError: {
    color: '#DC2626'
  }
});
