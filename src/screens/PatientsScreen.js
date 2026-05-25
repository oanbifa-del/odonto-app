// Tela de lista e gerenciamento de pacientes.
import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';

import colors from '../styles/colors';
import PatientCard from '../components/PatientCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { useNavigation } from '@react-navigation/native';
import { useAppData } from '../context/AppDataContext';
import { ListSkeleton } from '../components/SkeletonLoader';
import { showConfirmation, showErrorAlert } from '../components/ConfirmationAlert';

const normalize = value => value.toLowerCase().trim();
const digitsOnly = value => value.replace(/\D/g, '');

export default function PatientsScreen() {
  const navigation = useNavigation();
  const { patients, removePatient, loading, error } = useAppData();
  const [query, setQuery] = useState('');

  const filteredPatients = useMemo(() => {
    if (!query.trim()) return patients;
    const normalizedQuery = normalize(query);
    const numericQuery = digitsOnly(query);

    return patients.filter(patient => {
      const nameMatch = normalize(patient.fullName).includes(normalizedQuery);
      const phoneMatch = numericQuery
        ? digitsOnly(patient.phone || '').includes(numericQuery)
        : false;
      return nameMatch || phoneMatch;
    });
  }, [patients, query]);

  const handleDeletePatient = patient => {
    showConfirmation(
      'Remover paciente',
      `Deseja remover ${patient.fullName}?\n\nOs agendamentos vinculados também serão removidos.`,
      async () => {
        try {
          await removePatient(patient.id);
        } catch (error) {
          showErrorAlert('Erro', 'Não foi possível remover o paciente.');
        }
      },
      true
    );
  };

  const renderEmptyState = () => {
    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Erro ao carregar pacientes"
          description="Tente novamente em alguns instantes."
        />
      );
    }
    if (query.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum paciente encontrado"
          description="Tente ajustar a busca."
        />
      );
    }
    return (
      <EmptyState
        icon="people-outline"
        title="Nenhum paciente cadastrado"
        description="Cadastre seu primeiro paciente."
        actionLabel="Cadastrar paciente"
        onAction={() => navigation.navigate('NewPatient')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Pacientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NewPatient')}>
          <Text style={styles.addText}>+ Novo Paciente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Buscar por nome ou telefone"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <Text style={styles.count}>{filteredPatients.length} pacientes</Text>

      {loading && !patients.length ? (
        <ListSkeleton count={5} />
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <PatientCard
              name={item.fullName}
              phone={item.phone}
              onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
              onEdit={() => navigation.navigate('NewPatient', { patientId: item.id })}
              onDelete={() => handleDeletePatient(item)}
            />
          )}
          ListEmptyComponent={renderEmptyState()}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  addButton: {
    backgroundColor: colors.corBotoes,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  addText: { color: colors.white, fontWeight: '700' },
  searchWrapper: { marginTop: 12, marginBottom: 12 },
  count: { marginBottom: 8, color: colors.textGray, fontWeight: '700' }
});
