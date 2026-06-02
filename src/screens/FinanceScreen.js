// Tela de resumo financeiro da clínica.
import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../styles/colors';
import { useAppData } from '../context/AppDataContext';

const formatCurrency = value => {
  const fixed = value.toFixed(2).replace('.', ',');
  return `R$ ${fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const monthLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const monthNames = [
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

const parseMonthKey = date => date.slice(0, 7);
const parseDateTime = item => new Date(`${item.date}T${item.time || '00:00'}`);

export default function FinanceScreen() {
  const navigation = useNavigation();
  const { appointments, patients, procedures, loading, error } = useAppData();
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  const activeAppointments = appointments.filter(item => item.status !== 'cancelled' && item.date);
  const baseDate = new Date();
  const selectedDate = new Date(baseDate);
  selectedDate.setMonth(selectedDate.getMonth() + monthOffset);
  const year = selectedDate.getFullYear();
  const monthIndex = selectedDate.getMonth();
  const selectedMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const allMonthAppointments = appointments.filter(
    item => item.date && parseMonthKey(item.date) === selectedMonth
  );
  const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const previousYear = monthIndex === 0 ? year - 1 : year;
  const previousMonth = `${previousYear}-${String(previousMonthIndex + 1).padStart(2, '0')}`;
  const monthAppointments = activeAppointments.filter(item => parseMonthKey(item.date) === selectedMonth);
  const cancelledAppointments = allMonthAppointments.filter(item => item.status === 'cancelled');
  const previousAppointments = activeAppointments.filter(item => parseMonthKey(item.date) === previousMonth);
  const totalMonthValue = monthAppointments.reduce((sum, item) => sum + item.price, 0);
  const previousMonthValue = previousAppointments.reduce((sum, item) => sum + item.price, 0);
  const totalProcedures = monthAppointments.length;
  const previousProcedures = previousAppointments.length;
  const cancelledCount = cancelledAppointments.length;
  const cancelledValue = cancelledAppointments.reduce((sum, item) => sum + (item.price || 0), 0);
  const avgTicket = totalProcedures ? totalMonthValue / totalProcedures : 0;
  const uniquePatients = new Set(monthAppointments.map(item => item.patientId)).size;
  const cancelledPercent = allMonthAppointments.length
    ? (cancelledCount / allMonthAppointments.length) * 100
    : 0;

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const averagePerDay = totalMonthValue / (daysInMonth || 1);
  const variationPercent = previousMonthValue
    ? ((totalMonthValue - previousMonthValue) / previousMonthValue) * 100
    : 0;
  const variationText = `${variationPercent >= 0 ? '+' : ''}${variationPercent.toFixed(2).replace('.', ',')}%`;
  const periodLabel = `${monthNames[monthIndex]}/${year}`;
  const handleMonthChange = direction => setMonthOffset(prev => prev + direction);
  const resetMonthOffset = () => setMonthOffset(0);

  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 24; i += 1) {
      const optionDate = new Date(baseDate);
      optionDate.setMonth(optionDate.getMonth() - i);
      const offset =
        (optionDate.getFullYear() - baseDate.getFullYear()) * 12 +
        (optionDate.getMonth() - baseDate.getMonth());
      options.push({
        id: `m-${i}`,
        label: `${monthNames[optionDate.getMonth()]}/${optionDate.getFullYear()}`,
        offset
      });
    }
    return options.reverse();
  }, [baseDate]);

  const stats = [
    {
      id: 's1',
      icon: 'receipt-outline',
      label: 'Este mês',
      value: formatCurrency(totalMonthValue),
      foot: `${totalProcedures} procedimentos`
    },
    {
      id: 's2',
      icon: 'calendar-outline',
      label: 'Mês anterior',
      value: formatCurrency(previousMonthValue),
      foot: `${previousProcedures} procedimentos`
    },
    {
      id: 's3',
      icon: 'trending-up-outline',
      label: 'Variação',
      value: variationText,
      foot: 'vs mês anterior',
      isPositive: totalMonthValue >= previousMonthValue
    },
    {
      id: 's4',
      icon: 'time-outline',
      label: 'Média por dia',
      value: formatCurrency(averagePerDay),
      foot: `${daysInMonth} dias`
    }
  ];

  const paymentTotals = monthAppointments.reduce((acc, item) => {
    const key = item.paymentMethod || 'Não informado';
    acc[key] = (acc[key] || 0) + item.price;
    return acc;
  }, {});

  const paymentSummary = [
    { id: 'p1', label: 'Dinheiro', color: colors.azul },
    { id: 'p2', label: 'Cartão', color: colors.azulEscuro },
    { id: 'p3', label: 'PIX', color: colors.textMuted },
    { id: 'p4', label: 'Não informado', color: colors.borderStrong }
  ]
    .map(item => {
      const total = paymentTotals[item.label] || 0;
      const percent = totalMonthValue ? (total / totalMonthValue) * 100 : 0;
      return {
        ...item,
        value: formatCurrency(total),
        percent: `${percent.toFixed(1).replace('.', ',')}%`
      };
    })
    .filter(item => item.value !== formatCurrency(0));

  const procedureMap = procedures.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const procedureTotals = monthAppointments.reduce((acc, item) => {
    const procedure = procedureMap[item.procedureId];
    const key = item.procedureId || 'unknown';
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: procedure?.name || 'Procedimento',
        total: 0,
        count: 0
      };
    }
    acc[key].total += item.price || 0;
    acc[key].count += 1;
    return acc;
  }, {});

  const topProcedures = Object.values(procedureTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map((item, index) => {
      const percent = totalMonthValue ? (item.total / totalMonthValue) * 100 : 0;
      return {
        ...item,
        rank: index + 1,
        value: formatCurrency(item.total),
        percent: `${percent.toFixed(1).replace('.', ',')}%`
      };
    });

  const recent = [...monthAppointments]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateB - dateA;
    })
    .slice(0, 5)
    .map(item => {
      const [itemYear, itemMonth, itemDay] = item.date.split('-');
      const patient = patients.find(current => current.id === item.patientId);
      const procedure = procedures.find(current => current.id === item.procedureId);
      return {
        id: item.id,
        day: itemDay,
        month: monthLabels[Number(itemMonth) - 1],
        name: patient?.fullName || 'Paciente',
        procedure: procedure?.name || 'Procedimento',
        value: formatCurrency(item.price)
      };
    });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Financeiro</Text>
            <Text style={styles.subtitle}>Acompanhe seus resultados</Text>
          </View>
        </View>

        <View style={styles.periodControlsRow}>
          <View style={styles.periodControls}>
            <TouchableOpacity
              style={styles.periodNav}
              onPress={() => handleMonthChange(-1)}
            >
              <Ionicons name="chevron-back" size={18} color={colors.textDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.periodButton}
              onPress={() => setMonthModalVisible(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.textGray}
              />
              <Text style={styles.periodText}>{periodLabel}</Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.periodNav}
              onPress={() => handleMonthChange(1)}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textDark}
              />
            </TouchableOpacity>
          </View>

          {monthOffset !== 0 && (
            <TouchableOpacity
              style={styles.resetMonth}
              onPress={resetMonthOffset}
            >
              <Text style={styles.resetMonthText}>
                Voltar para mês atual
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIcon}>
              <Ionicons name="cash-outline" size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Total de procedimentos</Text>
              <Text style={styles.summaryPeriod}>{periodLabel}</Text>
            </View>
          </View>

          <View style={styles.summaryRight}>
            <Text style={styles.summaryValueLabel}>Total recebido</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalMonthValue)}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map(item => (
            <View key={item.id} style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name={item.icon} size={18} color={colors.azul} />
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.statValue,
                  item.isPositive === true && styles.statValuePositive,
                  item.isPositive === false && styles.statValueNegative
                ]}
              >
                {item.value}
              </Text>
              <Text style={styles.statFoot}>{item.foot}</Text>
            </View>
          ))}
        </View>

        <View style={styles.indicatorCard}>
          <View style={styles.indicatorRow}>
            <IndicatorItem label="Ticket médio" value={formatCurrency(avgTicket)} />
            <IndicatorItem label="Pacientes atendidos" value={`${uniquePatients}`} />
          </View>
          <View style={styles.indicatorRow}>
            <IndicatorItem
              label="Canceladas"
              value={`${cancelledCount} (${cancelledPercent.toFixed(1).replace('.', ',')}%)`}
            />
            <IndicatorItem label="Receita perdida" value={formatCurrency(cancelledValue)} />
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Resumo por forma de pagamento</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.paymentContent}>
            <View style={styles.donut}>
              <View style={styles.donutInner} />
            </View>

            <View style={styles.paymentList}>
              {error ? (
                <Text style={styles.emptyText}>Erro ao carregar pagamentos.</Text>
              ) : loading ? (
                <Text style={styles.emptyText}>Carregando pagamentos...</Text>
              ) : paymentSummary.length === 0 ? (
                <Text style={styles.emptyText}>Sem dados neste período.</Text>
              ) : (
                paymentSummary.map(item => (
                  <View key={item.id} style={styles.paymentRow}>
                    <View style={styles.paymentLeft}>
                      <View style={[styles.paymentDot, { backgroundColor: item.color }]} />
                      <Text style={styles.paymentLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.paymentRight}>
                      <Text style={styles.paymentValue}>{item.value}</Text>
                      <Text style={styles.paymentPercent}>{item.percent}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Últimos procedimentos</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topCard}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Procedimentos mais lucrativos</Text>
            <Ionicons name="trending-up-outline" size={18} color={colors.textMuted} />
          </View>
          {loading ? (
            <Text style={styles.emptyText}>Carregando ranking...</Text>
          ) : topProcedures.length === 0 ? (
            <Text style={styles.emptyText}>Sem dados suficientes para ranking.</Text>
          ) : (
            topProcedures.map((item, index) => (
              <View
                key={item.id}
                style={[styles.topRow, index === topProcedures.length - 1 && styles.topRowLast]}
              >
                <View style={styles.topLeft}>
                  <View style={styles.topRank}>
                    <Text style={styles.topRankText}>{item.rank}</Text>
                  </View>
                  <View>
                    <Text style={styles.topName}>{item.name}</Text>
                    <Text style={styles.topMeta}>
                      {item.count} consultas • {item.percent}
                    </Text>
                  </View>
                </View>
                <Text style={styles.topValue}>{item.value}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.recentCard}>
          {error ? (
            <Text style={styles.emptyText}>Erro ao carregar procedimentos.</Text>
          ) : loading ? (
            <Text style={styles.emptyText}>Carregando procedimentos...</Text>
          ) : recent.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum procedimento registrado no período.</Text>
          ) : (
            recent.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.recentItem, index === recent.length - 1 && styles.recentItemLast]}
                onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
              >
                <View style={styles.datePill}>
                  <Text style={styles.dateMonth}>{item.month}</Text>
                  <Text style={styles.dateDay}>{item.day}</Text>
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{item.name}</Text>
                  <Text style={styles.recentProc}>{item.procedure}</Text>
                </View>
                <View style={styles.recentRight}>
                  <Text style={styles.recentValue}>{item.value}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={monthModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar mês</Text>
              <TouchableOpacity onPress={() => setMonthModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            {monthOptions.map(item => {
              const selected = item.offset === monthOffset;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.modalItem, selected && styles.modalItemActive]}
                  onPress={() => {
                    setMonthOffset(item.offset);
                    setMonthModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selected && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                  {selected ? <Ionicons name="checkmark" size={18} color={colors.azul} /> : null}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                setMonthOffset(0);
                setMonthModalVisible(false);
              }}
            >
              <Ionicons name="calendar" size={18} color={colors.white} />
              <Text style={styles.modalActionText}>Voltar para o mês atual</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function IndicatorItem({ label, value }) {
  return (
    <View style={styles.indicatorItem}>
      <Text style={styles.indicatorLabel}>{label}</Text>
      <Text style={styles.indicatorValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 120 },
  titleRow: { 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between' 
  },
  titleBlock: { 
    flex: 1, 
    paddingRight: 12 
  },
  title: { fontSize: 26, 
    fontWeight: '800', 
    color: colors.textDark 
  },
  subtitle: { 
    marginTop: 4, 
    color: colors.textGray, 
    fontWeight: '600' 
  },
  periodControls: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
  },
  resetMonth: { // VOLTAR PARA O MÊS ATUAL (CARD)
    marginTop: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.bordas
  },
  periodControlsRow: {
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetMonthText: { 
    backgroundColor: colors.corBotoesLight,
    color: colors.azul, 
    fontWeight: '600',
    fontSize:13, 
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.bordas,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
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
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  modalItemActive: { backgroundColor: colors.surfaceAlt },
  modalItemText: { color: colors.textDark, fontWeight: '700' },
  modalItemTextActive: { color: colors.azul },
  modalAction: {
    marginTop: 8,
    backgroundColor: colors.corBotoes,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  modalActionText: { color: colors.white, fontWeight: '700' },
  periodNav: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  periodText: { marginLeft: 8, marginRight: 6, color: colors.textDark, fontWeight: '700' },
  
  //CARD AZUL GRANDE DO SUMÁRIO
  summaryCard: {
    marginTop: 10,
    backgroundColor: colors.azul,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  summaryLabel: { color: colors.azulLight, fontWeight: '600' },
  summaryPeriod: { color: colors.azulLight, marginTop: 2 },
  summaryRight: { alignItems: 'flex-end' },
  summaryValueLabel: { color: colors.azulLight, fontWeight: '600' },
  summaryValue: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  indicatorCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 16,
    marginBottom: 16
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  indicatorItem: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  indicatorLabel: { color: colors.textGray, fontWeight: '600', marginBottom: 6 },
  indicatorValue: { color: colors.textDark, fontWeight: '800', fontSize: 16 },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 12,
    marginBottom: 12
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.corBotoesLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statLabel: { color: colors.textGray, fontWeight: '600' },
  statValue: { color: colors.textDark, fontWeight: '800', marginTop: 4 },
  statFoot: { color: colors.textMuted, fontWeight: '600', fontSize: 12, marginTop: 4 },
  statValuePositive: { color: colors.success },
  statValueNegative: { color: '#DC2626' },
  sectionRow: {
    marginTop: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  sectionLink: { color: colors.corBotoes, fontWeight: '700' },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 16
  },
  paymentContent: { flexDirection: 'row', alignItems: 'center' },
  donut: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 14,
    borderColor: colors.azul,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  donutInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface
  },
  paymentList: { flex: 1 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  paymentLeft: { flexDirection: 'row', alignItems: 'center' },
  paymentDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  paymentLabel: { color: colors.textDark, fontWeight: '600' },
  paymentRight: { alignItems: 'flex-end' },
  paymentValue: { color: colors.textDark, fontWeight: '700' },
  paymentPercent: { color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  emptyText: { color: colors.textGray, fontWeight: '600' },
  topCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 16,
    marginBottom: 16
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  topRowLast: { borderBottomWidth: 0 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.corBotoesLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  topRankText: { color: colors.azul, fontWeight: '800' },
  topName: { color: colors.textDark, fontWeight: '700' },
  topMeta: { color: colors.textGray, marginTop: 4 },
  topValue: { color: colors.corBotoes, fontWeight: '800' },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bordas
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  recentItemLast: { borderBottomWidth: 0 },
  datePill: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  dateMonth: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  dateDay: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  recentInfo: { flex: 1 },
  recentName: { color: colors.textDark, fontWeight: '700' },
  recentProc: { color: colors.textGray, marginTop: 2 },
  recentRight: { alignItems: 'flex-end' },
  recentValue: { color: colors.corBotoes, fontWeight: '800', marginBottom: 2 }
});
