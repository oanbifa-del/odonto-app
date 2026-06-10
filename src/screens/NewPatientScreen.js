// Tela de cadastro/edição de paciente.
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../styles/colors';
import FormInput from '../components/FormInput';
import ActionButton from '../components/ActionButton';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import PickerField from '../components/PickerField';
import { useAppData } from '../context/AppDataContext';

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

// Garante o @ no usuário do Instagram.
const maskInstagram = value => {
  const cleaned = value.replace(/\s/g, '');
  if (!cleaned) return '';
  return cleaned.startsWith('@') ? cleaned : `@${cleaned}`;
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

export default function NewPatientScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params || {};
  const { addPatient, getPatientById, updatePatient } = useAppData();

  const existingPatient = useMemo(() => {
    return patientId ? getPatientById(patientId) : null;
  }, [getPatientById, patientId]);

  const [firstName, setFirstName] = useState(existingPatient?.firstName || '');
  const [lastName, setLastName] = useState(existingPatient?.lastName || '');
  const [birthDate, setBirthDate] = useState(() => {
    if (!existingPatient?.birthDate) return '';
    if (existingPatient.birthDate.includes('-')) {
      const [year, month, day] = existingPatient.birthDate.split('-');
      return `${day}-${month}-${year}`;
    }
    return existingPatient.birthDate;
  });
  const [birthDatePickerVisible, setBirthDatePickerVisible] = useState(false);
  const [birthDateDraft, setBirthDateDraft] = useState(
    () => parseDateFromValue(birthDate) || new Date(2000, 0, 1)
  );
  const [instagram, setInstagram] = useState(existingPatient?.instagram || '');
  const [phone, setPhone] = useState(existingPatient?.phone || '');
  const [email, setEmail] = useState(existingPatient?.email || '');
  const [address, setAddress] = useState(existingPatient?.address || '');
  const [notes, setNotes] = useState(existingPatient?.notes || '');

  const openBirthDatePicker = () => {
    const parsed = parseDateFromValue(birthDate);
    setBirthDateDraft(parsed || new Date(2000, 0, 1));
    setBirthDatePickerVisible(true);
  };

  const handleBirthDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setBirthDatePickerVisible(false);
      if (event?.type === 'set' && selectedDate) {
        setBirthDate(formatDateFromDate(selectedDate));
      }
      return;
    }
    if (selectedDate) {
      setBirthDateDraft(selectedDate);
    }
  };

  const confirmBirthDate = () => {
    setBirthDate(formatDateFromDate(birthDateDraft));
    setBirthDatePickerVisible(false);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe nome e sobrenome para continuar.');
      return;
    }

    const isoBirthDate = birthDate ? toIsoDate(birthDate) : '';
    if (birthDate && !isoBirthDate) {
      Alert.alert('Data inválida', 'Informe a data no formato DD-MM-AAAA.');
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: isoBirthDate || '',
      instagram: instagram.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes.trim()
    };

    try {
      if (existingPatient) {
        await updatePatient(existingPatient.id, payload);
        navigation.goBack();
        return;
      }

      const newPatient = await addPatient(payload);
      navigation.replace('PatientDetail', { patientId: newPatient.id });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o paciente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{existingPatient ? 'Editar paciente' : 'Novo paciente'}</Text>
        <Text style={styles.subtitle}>
          {existingPatient ? 'Atualize os dados do paciente.' : 'Preencha os dados para cadastrar o paciente.'}
        </Text>

        <View style={styles.card}>
          <FormInput label="Nome" value={firstName} onChangeText={setFirstName} placeholder="Ex: João" />
          <FormInput label="Sobrenome" value={lastName} onChangeText={setLastName} placeholder="Ex: Silva" />
          <PickerField
            label="Data de nascimento"
            value={birthDate}
            placeholder="DD-MM-AAAA"
            onPress={openBirthDatePicker}
          />
          <FormInput
            label="Instagram"
            value={instagram}
            onChangeText={value => setInstagram(maskInstagram(value))}
            placeholder="@usuario"
          />
          <FormInput
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            mask="phone"
          />
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@dominio.com"
            keyboardType="email-address"
          />
          <FormInput label="Endereço" value={address} onChangeText={setAddress} placeholder="Rua, número, bairro" />
          <FormInput
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            placeholder="Informações importantes"
            multiline
          />
        </View>

        <ActionButton title={existingPatient ? 'Salvar alterações' : 'Salvar paciente'} onPress={handleSave} />
      </KeyboardAwareScrollView>

      {Platform.OS === 'android' && birthDatePickerVisible && (
        <DateTimePicker
          value={birthDateDraft}
          mode="date"
          display="calendar"
          onChange={handleBirthDateChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={birthDatePickerVisible} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Selecionar data de nascimento</Text>
              <DateTimePicker
                value={birthDateDraft}
                mode="date"
                display="spinner"
                onChange={handleBirthDateChange}
              />
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.pickerCancel]}
                  onPress={() => setBirthDatePickerVisible(false)}
                >
                  <Text style={styles.pickerCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={confirmBirthDate}>
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
