import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function AppointmentCard({ title = 'Consulta', time = '00:00', subtitle, status }) {
	const isCancelled = status === 'cancelled';
	return (
		<View style={[styles.card, isCancelled && styles.cardCancelled]}>
			<View style={styles.content}>
				<Text style={[styles.title, isCancelled && styles.titleCancelled]}>{title}</Text>
				{subtitle ? <Text style={[styles.subtitle, isCancelled && styles.subtitleCancelled]}>{subtitle}</Text> : null}
			</View>
			<View style={[styles.timePill, isCancelled && styles.timePillCancelled]}>
				<Text style={[styles.time, isCancelled && styles.timeCancelled]}>{time}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		padding: 14,
		borderRadius: 14,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: colors.bordas,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: colors.shadow,
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 1
	},
	cardCancelled: {
		opacity: 0.7
	},
	content: { flex: 1, paddingRight: 12 },
	title: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.textDark
	},
	titleCancelled: { color: colors.textGray },
	subtitle: {
		marginTop: 4,
		color: colors.textGray,
		fontWeight: '600'
	},
	subtitleCancelled: { color: colors.textMuted },
	timePill: {
		backgroundColor: colors.corBotoesLight,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999
	},
	timePillCancelled: { backgroundColor: colors.surfaceAlt },
	time: {
		color: colors.azul,
		fontWeight: '700'
	},
	timeCancelled: { color: colors.textMuted }
});
