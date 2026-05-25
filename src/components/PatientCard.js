import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

function initials(name = '') {
	return name
		.split(' ')
		.map(n => n[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();
}

export default function PatientCard({
	name = 'Paciente',
	phone = '',
	status = 'Ativo',
	onPress,
	onEdit,
	onDelete
}) {
	return (
		<TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
			<View style={styles.left}>
				<View style={styles.avatar}><Text style={styles.avatarText}>{initials(name)}</Text></View>
				<View style={styles.info}>
					<Text style={styles.name}>{name}</Text>
					{phone ? <Text style={styles.phone}>{phone}</Text> : null}
				</View>
			</View>
			<View style={styles.right}>
				{onEdit ? (
					<TouchableOpacity style={styles.iconButton} onPress={onEdit}>
						<Ionicons name="create-outline" size={18} color={colors.textDark} />
					</TouchableOpacity>
				) : null}
				{onDelete ? (
					<TouchableOpacity style={[styles.iconButton, styles.iconDanger]} onPress={onDelete}>
						<Ionicons name="trash-outline" size={18} color="#DC2626" />
					</TouchableOpacity>
				) : null}
				<View style={styles.chev}>
					<Ionicons name="chevron-forward" size={22} color="#94A3B8" />
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		padding: 14,
		borderRadius: 14,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: colors.bordas,
		shadowColor: colors.shadow,
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 1
	},
	left: { flexDirection: 'row', alignItems: 'center' },
	avatar: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: colors.corBotoesLight,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12
	},
	avatarText: { color: colors.azul, fontWeight: '800' },
	info: {},
	name: { fontSize: 16, color: colors.textDark, fontWeight: '700' },
	phone: { color: colors.textGray, marginTop: 4 },
	right: { flexDirection: 'row', alignItems: 'center' },
	iconButton: {
		width: 32,
		height: 32,
		borderRadius: 10,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 6
	},
	iconDanger: { backgroundColor: '#FEE2E2' },
	status: { backgroundColor: '#F0F8FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
	statusText: { color: colors.azul, fontWeight: '600' },
	chev: { padding: 8 }
});
