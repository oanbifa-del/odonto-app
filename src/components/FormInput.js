import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../styles/colors';

const maskPhone = value => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const maskCPF = value => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  inputMode,
  returnKeyType,
  onFocus,
  onPressIn,
  showSoftInputOnFocus,
  caretHidden,
  multiline = false,
  maxLength,
  secureTextEntry,
  autoCapitalize,
  autoCorrect,
  editable = true,
  mask
}) {
  const handleChangeText = text => {
    let formatted = text;
    if (mask === 'phone') {
      formatted = maskPhone(text);
    } else if (mask === 'cpf') {
      formatted = maskCPF(text);
    }
    onChangeText(formatted);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        inputMode={inputMode}
        returnKeyType={returnKeyType}
        onFocus={onFocus}
        onPressIn={onPressIn}
        showSoftInputOnFocus={showSoftInputOnFocus}
        caretHidden={caretHidden}
        multiline={multiline}
        maxLength={maxLength || (mask === 'phone' ? 14 : mask === 'cpf' ? 14 : undefined)}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={editable}
      />
    </View>
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
    color: colors.textDark,
    fontSize: 15
  },
  inputMultiline: {
    height: 72,
    textAlignVertical: 'top'
  }
});
