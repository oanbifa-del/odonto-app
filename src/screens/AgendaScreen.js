// Tela de agenda com visualizações por dia/semana/mês.
import React, { useMemo, useState } from 'react';

import { SafeAreaView, Text, StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import AppointmentCard from '../components/AppointmentCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { useAppData } from '../context/AppDataContext';

const views = [
  { id: 'day', label: 'Dia' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' }
];

const parseDate = date => new Date(`${date}T00:00:00`);

const formatCurrency = value => {
  if (typeof value !== 'number') return 'R$ 0,00';
  const fixed = value.toFixed(2).replace('.', ',');
  return `R$ ${fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfWeek = date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const endOfWeek = date => {
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const formatDateLabel = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const monthLabels = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const formatPeriodLabel = (date, viewMode) => {
  if (viewMode === 'day') return formatDateLabel(date);
  if (viewMode === 'week') {
    const start = startOfWeek(date);
    const end = endOfWeek(start);
    return `${formatDateLabel(start)} - ${formatDateLabel(end)}`;
  }
  return `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
};

const normalize = value => (value || '').toLowerCase().trim();
const digitsOnly = value => String(value || '').replace(/\D/g, '');

export default function AgendaScreen() {
  const navigation = useNavigation();
  const { appointments, getPatientById, getProcedureById, loading, error } = useAppData();
  const [viewMode, setViewMode] = useState('day');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const [currentDate, setCurrentDate] = useState(() => {
    const firstDate = appointments[0]?.date;
    return firstDate ? parseDate(firstDate) : new Date();
  });

  const filtered = useMemo(() => {
    const byStatus = appointments.filter(item => {
      if (statusFilter === 'active') return item.status !== 'cancelled';
      if (statusFilter === 'cancelled') return item.status === 'cancelled';
      return true;
    });

    return byStatus.filter(item => {
      const itemDate = parseDate(item.date);
      if (viewMode === 'day') return isSameDay(itemDate, currentDate);
      if (viewMode === 'week') {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(start);
        return itemDate >= start && itemDate <= end;
      }
      return (
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getFullYear() === currentDate.getFullYear()
      );
    }).filter(item => {
      if (!query.trim()) return true;
      const normalizedQuery = normalize(query);
      const numericQuery = digitsOnly(query);
      const patient = getPatientById(item.patientId);
      const procedure = getProcedureById(item.procedureId);
      const nameMatch = normalize(patient?.fullName).includes(normalizedQuery);
      const phoneMatch = numericQuery
        ? digitsOnly(patient?.phone).includes(numericQuery)
        : false;
      const procedureMatch = normalize(procedure?.name).includes(normalizedQuery);
      return nameMatch || phoneMatch || procedureMatch;
    });
  }, [appointments, currentDate, viewMode, statusFilter, query, getPatientById, getProcedureById]);

  const listData = useMemo(() => {
    return filtered.map(item => {
      const patient = getPatientById(item.patientId);
      const procedure = getProcedureById(item.procedureId);
      const itemDate = parseDate(item.date);
      const dateLabel = formatDateLabel(itemDate);
      const procedureLabel = procedure?.name || 'Procedimento';
      const paymentLabel = item.paymentMethod ? ` • ${item.paymentMethod}` : '';
      const valueLabel = item.price ? ` • ${formatCurrency(item.price)}` : '';
      const statusLabel = item.status === 'cancelled' ? ' • Cancelado' : '';
      return {
        id: item.id,
        time: item.time,
        status: item.status,
        title: patient?.fullName || 'Paciente',
        subtitle:
          viewMode === 'day'
            ? `${procedureLabel}${valueLabel}${paymentLabel}${statusLabel}`
            : `${dateLabel} • ${procedureLabel}${valueLabel}${paymentLabel}${statusLabel}`
      };
    });
  }, [filtered, getPatientById, getProcedureById, viewMode]);

  const handleChangePeriod = direction => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'day') {
      nextDate.setDate(nextDate.getDate() + direction);
    } else if (viewMode === 'week') {
      nextDate.setDate(nextDate.getDate() + direction * 7);
    } else {
      nextDate.setMonth(nextDate.getMonth() + direction);
    }
    setCurrentDate(nextDate);
  };

  const renderEmptyState = () => {
    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Erro ao carregar agendamentos"
          description="Tente novamente em alguns instantes."
        />
      );
    }
    if (loading) {
      return (
        <EmptyState
          icon="time-outline"
          title="Carregando agenda"
          description="Buscando agendamentos..."
        />
      );
    }
    if (query.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum agendamento encontrado"
          description="Tente ajustar a busca."
        />
      );
    }
    return (
      <EmptyState
        icon="calendar-outline"
        title="Nenhum agendamento neste período"
        description="Adicione uma nova consulta para começar."
        actionLabel="Nova consulta"
        onAction={() => navigation.navigate('NewAppointment')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.subtitle}>Veja o que está marcado</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NewAppointment')}>
          <Text style={styles.addText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segment}>
        {views.map(item => {
          const selected = viewMode === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.segmentItem, selected && styles.segmentItemActive]}
              onPress={() => setViewMode(item.id)}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.periodRow}>
        <TouchableOpacity style={styles.periodButton} onPress={() => handleChangePeriod(-1)}>
          <Ionicons name="chevron-back" size={18} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.periodLabel}>{formatPeriodLabel(currentDate, viewMode)}</Text>
        <View style={styles.periodActions}>
          <TouchableOpacity style={styles.todayButton} onPress={() => setCurrentDate(new Date())}>
            <Text style={styles.todayText}>Hoje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.periodButton} onPress={() => handleChangePeriod(1)}>
            <Ionicons name="chevron-forward" size={18} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Buscar por paciente ou procedimento"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <Text style={styles.sectionLabel}>
        {viewMode === 'day' ? 'Agenda do dia' : viewMode === 'week' ? 'Agenda da semana' : 'Agenda do mês'}
      </Text>

      <View style={styles.filterRow}>
        {[
          { id: 'all', label: 'Todas' },
          { id: 'active', label: 'Ativas' },
          { id: 'cancelled', label: 'Canceladas' }
        ].map(item => {
          const selected = statusFilter === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, selected && styles.filterChipActive]}
              onPress={() => setStatusFilter(item.id)}
            >
              <Text style={[styles.filterText, selected && styles.filterTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={listData}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
          >
            <AppointmentCard title={item.title} time={item.time} subtitle={item.subtitle} status={item.status} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          renderEmptyState()
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  subtitle: { marginTop: 4, marginBottom: 16, color: colors.textGray, fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  addButton: {
    backgroundColor: colors.corBotoes,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  addText: { color: colors.white, fontWeight: '700' },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10
  },
  segmentItemActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  segmentText: { color: colors.textGray, fontWeight: '700' },
  segmentTextActive: { color: colors.textDark },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bordas,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  periodActions: { flexDirection: 'row', alignItems: 'center' },
  todayButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8
  },
  todayText: { color: colors.textDark, fontWeight: '700', fontSize: 12 },
  periodButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  periodLabel: { color: colors.textDark, fontWeight: '700' },
  searchWrapper: { marginBottom: 12 },
  sectionLabel: { marginBottom: 8, color: colors.textGray, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt
  },
  filterChipActive: { backgroundColor: colors.corBotoesLight },
  filterText: { color: colors.textGray, fontWeight: '700' },
  filterTextActive: { color: colors.azul },
  listContent: { paddingBottom: 120 }
});
