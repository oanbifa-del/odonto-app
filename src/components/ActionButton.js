import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function ActionButton({ title = 'Ação', onPress, disabled = false }) {
	return (
		<TouchableOpacity
			style={[styles.button, disabled && styles.buttonDisabled]}
			onPress={onPress}
			disabled={disabled}
		>
			<Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: colors.corBotoes,
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: colors.shadow,
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2
	},
	buttonDisabled: {
		backgroundColor: colors.borderStrong,
		shadowOpacity: 0
	},
	text: {
		color: colors.white,
		fontWeight: '700',
		fontSize: 15
	},
	textDisabled: {
		color: colors.textMuted
	}
});
