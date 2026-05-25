// Tela de detalhes do paciente.
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { useAppData } from '../context/AppDataContext';
import { showConfirmation, showErrorAlert } from '../components/ConfirmationAlert';

const formatDate = date => {
  if (!date) return '-';
  if (date.includes('/')) return date.replace(/\//g, '-');
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
};

const formatCurrency = value => {
  if (typeof value !== 'number') return 'R$ 0,00';
  const fixed = value.toFixed(2).replace('.', ',');
  return `R$ ${fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const parseDateTime = item => new Date(`${item.date}T${item.time || '00:00'}`);

export default function PatientDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params || {};
  const { getPatientById, appointments, getProcedureById, removePatient } = useAppData();
  const [filter, setFilter] = useState('all');

  const patient = getPatientById(patientId);
  const patientAppointments = appointments.filter(item => item.patientId === patientId);
  const sortedAppointments = useMemo(
    () => [...patientAppointments].sort((a, b) => parseDateTime(b) - parseDateTime(a)),
    [patientAppointments]
  );
  const filteredAppointments = useMemo(() => {
    if (filter === 'cancelled') return sortedAppointments.filter(item => item.status === 'cancelled');
    if (filter === 'active') return sortedAppointments.filter(item => item.status !== 'cancelled');
    return sortedAppointments;
  }, [sortedAppointments, filter]);
  const totalAppointments = patientAppointments.length;
  const cancelledAppointments = patientAppointments.filter(item => item.status === 'cancelled').length;
  const activeAppointments = totalAppointments - cancelledAppointments;

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Paciente não encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{patient.fullName}</Text>
        <Text style={styles.subtitle}>Ficha completa do paciente</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary]}
            onPress={() => navigation.navigate('NewPatient', { patientId: patient.id })}
          >
            <Text style={styles.actionPrimaryText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              showConfirmation(
                'Remover paciente',
                `Tem certeza que deseja remover ${patient.fullName}?\n\nOs agendamentos vinculados também serão removidos. Esta ação não pode ser desfeita.`,
                () => {
                  removePatient(patient.id)
                    .then(() => navigation.goBack())
                    .catch(() => showErrorAlert('Erro', 'Não foi possível remover o paciente.'));
                },
                true
              )
            }
          >
            <Text style={styles.actionText}>Remover</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <InfoRow label="Data de nascimento" value={formatDate(patient.birthDate)} />
          <InfoRow label="Telefone" value={patient.phone || '-'} />
          <InfoRow label="Instagram" value={patient.instagram || '-'} />
          <InfoRow label="Email" value={patient.email || '-'} />
          <InfoRow label="Endereço" value={patient.address || '-'} />
          {patient.notes ? <InfoRow label="Observações" value={patient.notes} isLast /> : null}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Agendamentos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NewAppointment', { patientId: patient.id })}>
            <Text style={styles.sectionLink}>Novo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Consultas</Text>
            <Text style={styles.statsValue}>{totalAppointments}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Ativas</Text>
            <Text style={styles.statsValue}>{activeAppointments}</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Canceladas</Text>
            <Text style={styles.statsValue}>{cancelledAppointments}</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'active', label: 'Ativas' },
            { id: 'cancelled', label: 'Canceladas' }
          ].map(item => {
            const selected = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterChip, selected && styles.filterChipActive]}
                onPress={() => setFilter(item.id)}
              >
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          {filteredAppointments.length === 0 ? (
            <Text style={styles.empty}>Nenhum agendamento para este paciente.</Text>
          ) : (
            filteredAppointments.map((appointment, index) => {
              const procedure = getProcedureById(appointment.procedureId);
              const lastItem = index === filteredAppointments.length - 1;
              const statusLabel = appointment.status === 'cancelled' ? 'Cancelado' : 'Agendado';
              return (
                <TouchableOpacity
                  key={appointment.id}
                  style={[styles.appointmentRow, lastItem && styles.appointmentRowLast]}
                  onPress={() =>
                    navigation.navigate('AppointmentDetail', { appointmentId: appointment.id })
                  }
                >
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentTitle}>{procedure?.name || 'Procedimento'}</Text>
                    <Text style={styles.appointmentSub}>
                      {formatDate(appointment.date)} • {appointment.time}
                    </Text>
                    <Text style={styles.appointmentMeta}>
                      {formatCurrency(appointment.price)} • {appointment.paymentMethod || 'Não informado'}
                    </Text>
                  </View>
                  <View style={styles.appointmentRight}>
                    <View style={[
                      styles.statusBadge,
                      appointment.status === 'cancelled' && styles.statusBadgeCancelled
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        appointment.status === 'cancelled' && styles.statusBadgeTextCancelled
                      ]}>
                        {statusLabel}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, isLast }) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  subtitle: { marginTop: 4, marginBottom: 16, color: colors.textGray, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 16,
    marginBottom: 16
  },
  infoRow: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  infoRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0
  },
  infoLabel: { color: colors.textGray, fontWeight: '600', marginBottom: 6 },
  infoValue: { color: colors.textDark, fontWeight: '700' },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bordas,
    backgroundColor: colors.surface
  },
  actionPrimary: {
    backgroundColor: colors.corBotoes,
    borderColor: colors.corBotoes
  },
  actionPrimaryText: { color: colors.white, fontWeight: '700' },
  actionText: { color: colors.textDark, fontWeight: '700' },
  sectionRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  sectionLink: { color: colors.corBotoes, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  statsCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 12
  },
  statsLabel: { color: colors.textGray, fontWeight: '600', marginBottom: 6 },
  statsValue: { color: colors.textDark, fontWeight: '800', fontSize: 18 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt
  },
  filterChipActive: { backgroundColor: colors.corBotoesLight },
  filterText: { color: colors.textGray, fontWeight: '700' },
  filterTextActive: { color: colors.azul },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  appointmentRowLast: { borderBottomWidth: 0 },
  appointmentInfo: { flex: 1, paddingRight: 12 },
  appointmentTitle: { color: colors.textDark, fontWeight: '700' },
  appointmentSub: { color: colors.textGray, marginTop: 4 },
  appointmentMeta: { color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  appointmentRight: { alignItems: 'flex-end', gap: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.corBotoesLight
  },
  statusBadgeCancelled: { backgroundColor: colors.surfaceAlt },
  statusBadgeText: { color: colors.azul, fontWeight: '700', fontSize: 12 },
  statusBadgeTextCancelled: { color: colors.textMuted },
  empty: { color: colors.textGray, fontWeight: '600' }
});
