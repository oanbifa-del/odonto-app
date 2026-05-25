import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'information-circle-outline'
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.azul} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.corBotoesLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center'
  },
  description: {
    marginTop: 6,
    color: colors.textGray,
    fontWeight: '600',
    textAlign: 'center'
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.corBotoes,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  buttonText: { color: colors.white, fontWeight: '700' }
});
