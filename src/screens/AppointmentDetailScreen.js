// Tela de detalhes do agendamento com ações rápidas.
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../styles/colors';
import { useAppData } from '../context/AppDataContext';

const formatCurrency = value => {
  const fixed = value.toFixed(2).replace('.', ',');
  return `R$ ${fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

// Converte DD-MM-AAAA para AAAA-MM-DD.
const toIsoDate = value => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  const day = cleaned.slice(0, 2);
  const month = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);
  return `${year}-${month}-${day}`;
};

const formatDateFromDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDateFromValue = value => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  const day = Number(cleaned.slice(0, 2));
  const month = Number(cleaned.slice(2, 4));
  const year = Number(cleaned.slice(4, 8));
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const formatTimeFromDate = date => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const parseTimeFromValue = value => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 4) return null;
  const hours = Number(cleaned.slice(0, 2));
  const minutes = Number(cleaned.slice(2, 4));
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Validação básica de data.
const isValidDate = value => {
  const iso = toIsoDate(value);
  if (!iso) return false;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

// Validação básica de horário.
const isValidTime = value => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 4) return false;
  const hours = Number(cleaned.slice(0, 2));
  const minutes = Number(cleaned.slice(2, 4));
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const formatDate = date => {
  if (!date) return '-';
  if (date.includes('/')) return date.replace(/\//g, '-');
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
};

export default function AppointmentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params || {};
  const { getAppointmentById, getPatientById, getProcedureById, updateAppointment, cancelAppointment } = useAppData();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);

  const appointment = getAppointmentById(appointmentId);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDatePickerVisible, setRescheduleDatePickerVisible] = useState(false);
  const [rescheduleTimePickerVisible, setRescheduleTimePickerVisible] = useState(false);
  const [rescheduleDateDraft, setRescheduleDateDraft] = useState(() => new Date());
  const [rescheduleTimeDraft, setRescheduleTimeDraft] = useState(() => new Date());

  useEffect(() => {
    if (appointment) {
      setRescheduleDate(formatDate(appointment.date));
      setRescheduleTime(appointment.time || '');
    }
  }, [appointment]);

  const openRescheduleDatePicker = () => {
    const parsed = parseDateFromValue(rescheduleDate);
    setRescheduleDateDraft(parsed || new Date());
    setRescheduleDatePickerVisible(true);
  };

  const openRescheduleTimePicker = () => {
    const parsed = parseTimeFromValue(rescheduleTime);
    setRescheduleTimeDraft(parsed || new Date());
    setRescheduleTimePickerVisible(true);
  };

  const handleRescheduleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setRescheduleDatePickerVisible(false);
      if (event?.type === 'set' && selectedDate) {
        setRescheduleDate(formatDateFromDate(selectedDate));
      }
      return;
    }
    if (selectedDate) {
      setRescheduleDateDraft(selectedDate);
    }
  };

  const handleRescheduleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setRescheduleTimePickerVisible(false);
      if (event?.type === 'set' && selectedDate) {
        setRescheduleTime(formatTimeFromDate(selectedDate));
      }
      return;
    }
    if (selectedDate) {
      setRescheduleTimeDraft(selectedDate);
    }
  };

  const confirmRescheduleDate = () => {
    setRescheduleDate(formatDateFromDate(rescheduleDateDraft));
    setRescheduleDatePickerVisible(false);
  };

  const confirmRescheduleTime = () => {
    setRescheduleTime(formatTimeFromDate(rescheduleTimeDraft));
    setRescheduleTimePickerVisible(false);
  };

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Agendamento não encontrado</Text>
      </SafeAreaView>
    );
  }

  const patient = getPatientById(appointment.patientId);
  const procedure = getProcedureById(appointment.procedureId);
  const paymentOptions = ['Dinheiro', 'Cartão', 'PIX'];
  const isCancelled = appointment.status === 'cancelled';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Detalhes do agendamento</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary, isCancelled && styles.actionDisabled]}
            onPress={() => {
              if (isCancelled) return;
              navigation.navigate('NewAppointment', { appointmentId: appointment.id });
            }}
            disabled={isCancelled}
          >
            <Text style={styles.actionPrimaryText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, isCancelled && styles.actionDisabled]}
            onPress={() => {
              if (isCancelled) return;
              setRescheduleDate(formatDate(appointment.date));
              setRescheduleTime(appointment.time || '');
              setRescheduleModalVisible(true);
            }}
            disabled={isCancelled}
          >
            <Text style={styles.actionText}>Remarcar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.actionText}>Pagamento</Text>
          </TouchableOpacity>
          {!isCancelled ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionDanger]}
              onPress={() =>
                Alert.alert(
                  'Cancelar agendamento',
                  'Deseja cancelar este agendamento?',
                  [
                    { text: 'Voltar', style: 'cancel' },
                    {
                      text: 'Cancelar',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await cancelAppointment(appointment.id);
                        } catch (error) {
                          Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
                        }
                      }
                    }
                  ]
                )
              }
            >
              <Text style={styles.actionDangerText}>Cancelar</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionButton, styles.actionDisabled]}>
              <Text style={styles.actionDisabledText}>Cancelado</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <InfoRow label="Paciente" value={patient?.fullName || '-'} />
          <InfoRow label="Procedimento" value={procedure?.name || '-'} />
          <InfoRow label="Data" value={formatDate(appointment.date)} />
          <InfoRow label="Horário" value={appointment.time || '-'} />
          <InfoRow label="Valor" value={formatCurrency(appointment.price)} />
          <InfoRow label="Pagamento" value={appointment.paymentMethod || '-'} />
          <InfoRow label="Status" value={appointment.status === 'cancelled' ? 'Cancelado' : 'Agendado'} />
          {appointment.notes ? <InfoRow label="Observações" value={appointment.notes} isLast /> : null}
        </View>
      </ScrollView>

      <Modal visible={paymentModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar pagamento</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>
              {paymentOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalItem}
                  onPress={async () => {
                    try {
                      await updateAppointment(appointment.id, { paymentMethod: option });
                      setPaymentModalVisible(false);
                    } catch (error) {
                      Alert.alert('Erro', 'Não foi possível atualizar o pagamento.');
                    }
                  }}
                >
                  <Text style={styles.modalItemLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </Modal>

      <Modal visible={rescheduleModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Remarcar consulta</Text>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Nova data</Text>
              <TouchableOpacity style={styles.modalInput} onPress={openRescheduleDatePicker}>
                <Text
                  style={[
                    styles.modalInputText,
                    !rescheduleDate && styles.modalPlaceholder
                  ]}
                >
                  {rescheduleDate || 'DD-MM-AAAA'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Novo horário</Text>
              <TouchableOpacity style={styles.modalInput} onPress={openRescheduleTimePicker}>
                <Text
                  style={[
                    styles.modalInputText,
                    !rescheduleTime && styles.modalPlaceholder
                  ]}
                >
                  {rescheduleTime || 'HH:MM'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionPrimary]}
                onPress={async () => {
                  if (!isValidDate(rescheduleDate)) {
                    Alert.alert('Data inválida', 'Informe a data no formato DD-MM-AAAA.');
                    return;
                  }
                  if (!isValidTime(rescheduleTime)) {
                    Alert.alert('Horário inválido', 'Informe o horário no formato HH:MM.');
                    return;
                  }

                  try {
                    await updateAppointment(appointment.id, {
                      date: toIsoDate(rescheduleDate),
                      time: rescheduleTime.trim()
                    });
                    setRescheduleModalVisible(false);
                  } catch (error) {
                    Alert.alert('Erro', 'Não foi possível remarcar o agendamento.');
                  }
                }}
              >
                <Text style={styles.actionPrimaryText}>Salvar nova data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {Platform.OS === 'android' && rescheduleDatePickerVisible && (
        <DateTimePicker
          value={rescheduleDateDraft}
          mode="date"
          display="calendar"
          onChange={handleRescheduleDateChange}
        />
      )}

      {Platform.OS === 'android' && rescheduleTimePickerVisible && (
        <DateTimePicker
          value={rescheduleTimeDraft}
          mode="time"
          display="clock"
          onChange={handleRescheduleTimeChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={rescheduleDatePickerVisible} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Selecionar nova data</Text>
              <DateTimePicker
                value={rescheduleDateDraft}
                mode="date"
                display="spinner"
                onChange={handleRescheduleDateChange}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.pickerCancel]}
                  onPress={() => setRescheduleDatePickerVisible(false)}
                >
                  <Text style={styles.pickerCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={confirmRescheduleDate}>
                  <Text style={styles.pickerConfirmText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={rescheduleTimePickerVisible} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Selecionar novo horário</Text>
              <DateTimePicker
                value={rescheduleTimeDraft}
                mode="time"
                display="spinner"
                onChange={handleRescheduleTimeChange}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.pickerCancel]}
                  onPress={() => setRescheduleTimePickerVisible(false)}
                >
                  <Text style={styles.pickerCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={confirmRescheduleTime}>
                  <Text style={styles.pickerConfirmText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  title: { fontSize: 26, fontWeight: '800', paddingBottom: 12, color: colors.textDark },
  subtitle: { marginTop: 4, marginBottom: 16, color: colors.textGray, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
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
  actionPrimary: { backgroundColor: colors.corBotoes, borderColor: colors.corBotoes },
  actionPrimaryText: { color: colors.white, fontWeight: '700' },
  actionText: { color: colors.textDark, fontWeight: '700' },
  actionDanger: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  actionDangerText: { color: '#DC2626', fontWeight: '700' },
  actionDisabled: { backgroundColor: colors.surfaceAlt, borderColor: colors.bordas },
  actionDisabledText: { color: colors.textMuted, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 16
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  modalItemLabel: { color: colors.textDark, fontWeight: '700' },
  modalField: { marginBottom: 12 },
  modalLabel: { color: colors.textGray, fontWeight: '600', marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.bordas,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center'
  },
  modalInputText: {
    color: colors.textDark,
    fontWeight: '700'
  },
  modalPlaceholder: { color: colors.textMuted },
  modalActions: { marginTop: 8 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 24
  },
  pickerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  pickerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.corBotoes
  },
  pickerCancel: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.bordas
  },
  pickerCancelText: {
    color: colors.textDark,
    fontWeight: '700'
  },
  pickerConfirmText: {
    color: colors.white,
    fontWeight: '700'
  }
});
