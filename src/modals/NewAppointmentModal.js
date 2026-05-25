import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function NewAppointmentModal() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Nova Consulta (placeholder)</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: colors.background,
		flex: 1
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.textDark
	}
});
