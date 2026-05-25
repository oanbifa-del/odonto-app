import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar...' }) {
	return (
		<View style={styles.container}>
			<Ionicons name="search" size={18} color={colors.textMuted} style={styles.icon} />
			<TextInput
				style={styles.input}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={colors.textMuted}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.bordas,
		paddingHorizontal: 12,
		borderRadius: 12,
		height: 48,
		shadowColor: colors.shadow,
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 1
	},
	icon: {
		marginRight: 8
	},
	input: {
		flex: 1,
		fontSize: 15,
		color: colors.textDark
	}
});
