// Tela de cadastro/edição de procedimento.
import React, { useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../styles/colors';
import FormInput from '../components/FormInput';
import ActionButton from '../components/ActionButton';
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

export default function NewProcedureScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { procedureId } = route.params || {};
  const { addProcedure, updateProcedure, getProcedureById } = useAppData();

  const existingProcedure = useMemo(() => {
    return procedureId ? getProcedureById(procedureId) : null;
  }, [getProcedureById, procedureId]);

  const [name, setName] = useState(existingProcedure?.name || '');
  const [description, setDescription] = useState(existingProcedure?.description || '');
  const [price, setPrice] = useState(
    existingProcedure?.price ? formatCurrency(existingProcedure.price) : ''
  );
  const [duration, setDuration] = useState(
    existingProcedure?.durationMinutes ? String(existingProcedure.durationMinutes) : ''
  );

  const handleSave = async () => {
    const parsedPrice = parseCurrency(price);
    const parsedDuration = Number(duration);

    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do procedimento.');
      return;
    }

    if (!parsedPrice) {
      Alert.alert('Valor inválido', 'Informe um valor válido para o procedimento.');
      return;
    }

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      Alert.alert('Duração inválida', 'Informe a duração em minutos.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      durationMinutes: parsedDuration
    };

    try {
      if (existingProcedure) {
        await updateProcedure(existingProcedure.id, payload);
        navigation.goBack();
        return;
      }

      await addProcedure(payload);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o procedimento.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{existingProcedure ? 'Editar procedimento' : 'Novo procedimento'}</Text>
        <Text style={styles.subtitle}>
          {existingProcedure ? 'Atualize os dados do procedimento.' : 'Cadastre novos procedimentos para sua clínica.'}
        </Text>

        <View style={styles.card}>
          <FormInput label="Nome" value={name} onChangeText={setName} placeholder="Ex: Clareamento dental" />
          <FormInput
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição do procedimento"
            multiline
          />
          <FormInput
            label="Valor"
            value={price}
            onChangeText={value => setPrice(maskCurrency(value))}
            placeholder="R$ 0,00"
            keyboardType="numeric"
            maxLength={18}
          />
          <FormInput
            label="Duração (min)"
            value={duration}
            onChangeText={setDuration}
            placeholder="Ex: 60"
            keyboardType="numeric"
          />
        </View>

        <ActionButton
          title={existingProcedure ? 'Salvar alterações' : 'Salvar procedimento'}
          onPress={handleSave}
        />
      </ScrollView>
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
  }
});
