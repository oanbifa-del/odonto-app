// Tela de criação/edição de consultas.
import React, { useEffect, useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../styles/colors';
import FormInput from '../components/FormInput';
import SelectField from '../components/SelectField';
import ActionButton from '../components/ActionButton';
import SearchBar from '../components/SearchBar';
import { useAppData } from '../context/AppDataContext';

// Converte o valor digitado para número.
const parseCurrency = value => {
  if (!value) return null;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

// Formata número para padrão monetário brasileiro.
const formatCurrency = value => {
  const fixed = value.toFixed(2).replace('.', ',');
  return `R$ ${fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

// Aplica máscara de moeda enquanto o usuário digita.
const maskCurrency = value => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const number = Number(digits) / 100;
  return formatCurrency(number);
};

// Máscara de data no formato DD-MM-AAAA.
const maskDate = value => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const parts = [];
  if (digits.length >= 2) parts.push(digits.slice(0, 2));
  if (digits.length >= 4) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  return parts.join('-');
};

// Máscara de horário no formato HH:MM.
const maskTime = value => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
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

// Converte DD-MM-AAAA para AAAA-MM-DD (padrão salvo no banco).
const toIsoDate = value => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  const day = cleaned.slice(0, 2);
  const month = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);
  return `${year}-${month}-${day}`;
};

// Converte AAAA-MM-DD para DD-MM-AAAA (para edição).
const formatDate = date => {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
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

const paymentOptions = ['Dinheiro', 'Cartão', 'PIX'];

export default function NewAppointmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId, patientId: preselectedPatientId } = route.params || {};
  const {
    patients,
    procedures,
    appointments,
    addAppointment,
    updateAppointment,
    getAppointmentById,
    getPatientById,
    getProcedureById
  } = useAppData();

  const existingAppointment = useMemo(() => {
    return appointmentId ? getAppointmentById(appointmentId) : null;
  }, [appointmentId, getAppointmentById]);

  const [patientId, setPatientId] = useState(
    existingAppointment?.patientId || preselectedPatientId || ''
  );
  const [procedureId, setProcedureId] = useState(existingAppointment?.procedureId || '');
  const [date, setDate] = useState(
    existingAppointment?.date ? formatDate(existingAppointment.date) : ''
  );
  const [time, setTime] = useState(existingAppointment?.time || '');
  const [price, setPrice] = useState(
    existingAppointment?.price ? formatCurrency(existingAppointment.price) : ''
  );
  const [paymentMethod, setPaymentMethod] = useState(existingAppointment?.paymentMethod || '');
  const [notes, setNotes] = useState(existingAppointment?.notes || '');

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [dateDraft, setDateDraft] = useState(() => parseDateFromValue(date) || new Date());
  const [timeDraft, setTimeDraft] = useState(() => parseTimeFromValue(time) || new Date());

  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [procedureModalVisible, setProcedureModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const selectedPatient = useMemo(
    () => patients.find(item => item.id === patientId),
    [patientId, patients]
  );
  const selectedProcedure = useMemo(
    () => procedures.find(item => item.id === procedureId),
    [procedureId, procedures]
  );

  const handleSelectProcedure = item => {
    const procedure = procedures.find(current => current.id === item.id);
    if (!procedure) return;
    setProcedureId(procedure.id);
    setPrice(formatCurrency(procedure.price));
    setProcedureModalVisible(false);
  };

  const openDatePicker = () => {
    const parsed = parseDateFromValue(date);
    setDateDraft(parsed || new Date());
    setDatePickerVisible(true);
  };

  const openTimePicker = () => {
    const parsed = parseTimeFromValue(time);
    setTimeDraft(parsed || new Date());
    setTimePickerVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
      if (event?.type === 'set' && selectedDate) {
        setDate(formatDateFromDate(selectedDate));
      }
      return;
    }
    if (selectedDate) {
      setDateDraft(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setTimePickerVisible(false);
      if (event?.type === 'set' && selectedDate) {
        setTime(formatTimeFromDate(selectedDate));
      }
      return;
    }
    if (selectedDate) {
      setTimeDraft(selectedDate);
    }
  };

  const confirmDate = () => {
    setDate(formatDateFromDate(dateDraft));
    setDatePickerVisible(false);
  };

  const confirmTime = () => {
    setTime(formatTimeFromDate(timeDraft));
    setTimePickerVisible(false);
  };

  const handleSave = async () => {
    if (!patientId || !procedureId || !date.trim() || !time.trim()) {
      Alert.alert('Campos obrigatórios', 'Selecione paciente, procedimento, data e horário.');
      return;
    }

    if (!isValidDate(date)) {
      Alert.alert('Data inválida', 'Informe a data no formato DD-MM-AAAA.');
      return;
    }

    if (!isValidTime(time)) {
      Alert.alert('Horário inválido', 'Informe o horário no formato HH:MM.');
      return;
    }

    const parsedPrice = parseCurrency(price);
    if (!parsedPrice) {
      Alert.alert('Valor inválido', 'Informe o valor do procedimento.');
      return;
    }

    const isoDate = toIsoDate(date);
    const cleanTime = time.trim();
    const payload = {
      patientId,
      procedureId,
      date: isoDate,
      time: cleanTime,
      price: parsedPrice,
      paymentMethod: paymentMethod.trim() || 'Não informado',
      notes: notes.trim()
    };

    try {
      const conflict = appointments.find(item => {
        if (item.id === existingAppointment?.id) return false;
        if (item.status === 'cancelled') return false;
        return item.date === isoDate && item.time === cleanTime;
      });

      const saveAppointment = async () => {
        if (existingAppointment) {
          await updateAppointment(existingAppointment.id, payload);
          navigation.replace('AppointmentDetail', { appointmentId: existingAppointment.id });
          return;
        }

        const newAppointment = await addAppointment(payload);
        navigation.replace('AppointmentDetail', { appointmentId: newAppointment.id });
      };

      if (conflict) {
        const conflictPatient = getPatientById(conflict.patientId);
        const conflictProcedure = getProcedureById(conflict.procedureId);
        Alert.alert(
          'Conflito de horário',
          `Já existe uma consulta nesse horário para ${conflictPatient?.fullName || 'Paciente'} (${conflictProcedure?.name || 'Procedimento'}).`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salvar mesmo assim', onPress: saveAppointment }
          ]
        );
        return;
      }

      await saveAppointment();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o agendamento.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{existingAppointment ? 'Editar consulta' : 'Nova consulta'}</Text>

        <View style={styles.card}>
          <SelectField
            label="Paciente"
            value={selectedPatient?.fullName}
            placeholder="Selecionar paciente"
            onPress={() => setPatientModalVisible(true)}
          />
          <SelectField
            label="Procedimento"
            value={selectedProcedure?.name}
            placeholder="Selecionar procedimento"
            onPress={() => setProcedureModalVisible(true)}
          />
          <FormInput
            label="Data"
            value={date}
            onChangeText={value => setDate(maskDate(value))}
            placeholder="DD-MM-AAAA"
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            showSoftInputOnFocus={false}
            caretHidden
            onFocus={openDatePicker}
            onPressIn={openDatePicker}
          />
          <FormInput
            label="Horário"
            value={time}
            onChangeText={value => setTime(maskTime(value))}
            placeholder="HH:MM"
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={5}
            showSoftInputOnFocus={false}
            caretHidden
            onFocus={openTimePicker}
            onPressIn={openTimePicker}
          />
          <FormInput
            label="Valor"
            value={price}
            onChangeText={value => setPrice(maskCurrency(value))}
            placeholder="R$ 0,00"
            keyboardType="numeric"
            maxLength={18}
          />
          <SelectField
            label="Método de pagamento"
            value={paymentMethod}
            placeholder="Selecionar método"
            onPress={() => setPaymentModalVisible(true)}
          />
          <FormInput
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            placeholder="Notas sobre a consulta"
            multiline
          />
        </View>

        <ActionButton
          title={existingAppointment ? 'Salvar alterações' : 'Salvar consulta'}
          onPress={handleSave}
        />
      </ScrollView>

      {Platform.OS === 'android' && datePickerVisible && (
        <DateTimePicker
          value={dateDraft}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'android' && timePickerVisible && (
        <DateTimePicker
          value={timeDraft}
          mode="time"
          display="clock"
          onChange={handleTimeChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={datePickerVisible} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Selecionar data da consulta</Text>
              <DateTimePicker
                value={dateDraft}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.pickerCancel]}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Text style={styles.pickerCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={confirmDate}>
                  <Text style={styles.pickerConfirmText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={timePickerVisible} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Selecionar horário</Text>
              <DateTimePicker
                value={timeDraft}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.pickerCancel]}
                  onPress={() => setTimePickerVisible(false)}
                >
                  <Text style={styles.pickerCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={confirmTime}>
                  <Text style={styles.pickerConfirmText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <SelectionModal
        visible={patientModalVisible}
        title="Selecionar paciente"
        items={patients.map(item => ({ id: item.id, label: item.fullName, sub: item.phone }))}
        placeholder="Buscar paciente"
        onClose={() => setPatientModalVisible(false)}
        onSelect={item => {
          setPatientId(item.id);
          setPatientModalVisible(false);
        }}
      />

      <SelectionModal
        visible={procedureModalVisible}
        title="Selecionar procedimento"
        items={procedures.map(item => ({
          id: item.id,
          label: item.name,
          sub: formatCurrency(item.price)
        }))}
        placeholder="Buscar procedimento"
        onClose={() => setProcedureModalVisible(false)}
        onSelect={handleSelectProcedure}
      />

      <SelectionModal
        visible={paymentModalVisible}
        title="Selecionar pagamento"
        items={paymentOptions.map(item => ({ id: item, label: item }))}
        placeholder="Buscar método"
        onClose={() => setPaymentModalVisible(false)}
        onSelect={item => {
          setPaymentMethod(item.id);
          setPaymentModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function SelectionModal({ visible, title, items, onClose, onSelect, placeholder }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setQuery('');
    }
  }, [visible]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const normalizedQuery = query.toLowerCase().trim();
    const numericQuery = query.replace(/\\D/g, '');
    return items.filter(item => {
      const labelMatch = String(item.label || '').toLowerCase().includes(normalizedQuery);
      const sub = String(item.sub || '');
      const subMatch = sub.toLowerCase().includes(normalizedQuery);
      const numericMatch = numericQuery ? sub.replace(/\\D/g, '').includes(numericQuery) : false;
      return labelMatch || subMatch || numericMatch;
    });
  }, [items, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearch}>
            <SearchBar
              placeholder={placeholder || 'Buscar'}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {filteredItems.length === 0 ? (
            <Text style={styles.modalEmpty}>Nenhum resultado encontrado.</Text>
          ) : (
            filteredItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalItem}
                onPress={() => onSelect(item)}
              >
                <View>
                  <Text style={styles.modalItemLabel}>{item.label}</Text>
                  {item.sub ? <Text style={styles.modalItemSub}>{item.sub}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textDark, marginLeft: 6, marginBottom: 6 },
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    paddingHorizontal: 16, 
    paddingVertical: 6,
    paddingBottom: 0.2,
    marginBottom: 8
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 20
  },
  pickerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 10
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
  },
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
  modalSearch: { marginBottom: 12 },
  modalEmpty: { color: colors.textGray, fontWeight: '600', paddingVertical: 12 },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  modalItemLabel: { color: colors.textDark, fontWeight: '700' },
  modalItemSub: { color: colors.textGray, marginTop: 4 }
});
