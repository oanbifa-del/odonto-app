import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function SelectField({ label, value, placeholder, onPress }) {
  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.input}>
        <Text style={[styles.value, isPlaceholder && styles.placeholder]}>{displayValue}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { color: colors.textGray, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.bordas,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  value: { color: colors.textDark, fontSize: 15, fontWeight: '600' },
  placeholder: { color: colors.textMuted, fontWeight: '500' }
});
