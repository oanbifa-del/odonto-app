// Tela inicial com ações rápidas e próximas consultas.
import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import colors from '../styles/colors';
import SearchBar from '../components/SearchBar';
import { useAppData } from '../context/AppDataContext';
import SyncStatusIndicator from '../components/SyncStatusIndicator';

// Funções auxiliares para normalizar strings e extrair apenas dígitos
const normalize = value => (value || '').toLowerCase().trim();
const digitsOnly = value => String(value || '').replace(/\D/g, '');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { appointments, patients, getPatientById, getProcedureById, loading, error } = useAppData();
  const [query, setQuery] = useState(''); // Estado para o texto da barra de busca

  // ============== 3 PRÓXIMAS CONSULTAS ===============
  // useMemo recalcula a lista de próximas consultas apenas quando appointments mudar
  const upcoming = useMemo(() => {
   // Filtra consultas não canceladas, ordena por data/hora, seleciona as 3 primeiras e prepara os dados para exibição
    return [...appointments.filter(item => item.status !== 'cancelled')]
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA - dateB;
      })
      .slice(0, 3)
      .map(item => {
        const patient = getPatientById(item.patientId); // Busca dados do paciente pelo ID
        const procedure = getProcedureById(item.procedureId); // Busca dados do procedimento
        return {
          id: item.id,
          time: item.time,
          name: patient?.fullName || 'Paciente',
          procedure: procedure?.name || 'Procedimento'
        };
      });
  }, [appointments, getPatientById, getProcedureById]); // Dependências que disparam o recálculo

  // ============= BUSCA DE PACIENTES ==============
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const normalizedQuery = normalize(query);
    const numericQuery = digitsOnly(query);
    return patients
      .filter(patient => {
        const nameMatch = normalize(patient.fullName).includes(normalizedQuery);
        const phoneMatch = numericQuery
          ? digitsOnly(patient.phone).includes(numericQuery)
          : false;
        return nameMatch || phoneMatch;
      })
      .slice(0, 4);
  }, [patients, query]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Buscar paciente"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        {loading || error ? (
          <View style={styles.syncRow}>
            <SyncStatusIndicator syncing={loading} error={error} />
          </View>
        ) : null}

        {query.trim() ? (
          <View style={styles.searchCard}>
            {searchResults.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum paciente encontrado.</Text>
            ) : (
              searchResults.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.searchRow}
                  onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
                >
                  <View>
                    <Text style={styles.searchName}>{item.fullName}</Text>
                    <Text style={styles.searchPhone}>{item.phone || 'Telefone não informado'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rowAction} onPress={() => navigation.navigate('Procedures')}>
            <View style={styles.iconBox}><Ionicons name="medkit" size={22} color="#fff" /></View>
            <Text style={styles.rowText}>Procedimentos</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowAction} onPress={() => navigation.navigate('NewPatient')}>
            <View style={[styles.iconBox, { backgroundColor: colors.success }]}><Ionicons name="person" size={22} color="#fff" /></View>
            <Text style={styles.rowText}>Novo Paciente</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowAction} onPress={() => navigation.navigate('NewAppointment')}>
            <View style={styles.iconBox}><Ionicons name="calendar" size={22} color="#fff" /></View>
            <Text style={styles.rowText}>Nova Consulta</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Próximas consultas</Text>
            <TouchableOpacity style={styles.viewFull} onPress={() => navigation.navigate('Agenda')}>
              <Text style={styles.viewFullText}>Ver agenda</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.corBotoes} />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={styles.emptyText}>Erro ao carregar consultas.</Text>
          ) : loading ? (
            <Text style={styles.emptyText}>Carregando consultas...</Text>
          ) : upcoming.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma consulta cadastrada.</Text>
          ) : (
            upcoming.map(a => (
              <View key={a.id} style={styles.appRow}>
                <View style={styles.appLeft}>
                  <Text style={styles.appTime}>{a.time}</Text>
                  <View>
                    <Text style={styles.appName}>{a.name}</Text>
                    <Text style={styles.appSub}>{a.procedure}</Text>
                  </View>
                </View>
                <View style={styles.appBadge}>
                  <Text style={styles.appBadgeText}>Consulta</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 120 },
  searchWrapper: { marginBottom: 8 },
  syncRow: { alignItems: 'flex-start', marginBottom: 8 },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bordas,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  searchName: { color: colors.textDark, fontWeight: '700' },
  searchPhone: { color: colors.textGray, marginTop: 4 },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textGray,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  actions: { marginTop: 4 },
  rowAction: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.bordas,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.azul,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.textDark },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  appLeft: { flexDirection: 'row', alignItems: 'center' },
  appTime: { color: colors.azul, width: 64, fontWeight: '700' },
  appName: { color: colors.textDark, fontWeight: '700' },
  appSub: { color: colors.textGray, marginTop: 2 },
  appBadge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  appBadgeText: { color: colors.textGray, fontSize: 12, fontWeight: '700' },
  viewFull: { flexDirection: 'row', alignItems: 'center' },
  viewFullText: { color: colors.corBotoes, marginRight: 6, fontWeight: '700' },
  emptyText: { color: colors.textGray, fontWeight: '600', paddingVertical: 8 }
});
