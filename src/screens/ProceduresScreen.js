// Tela de lista e gerenciamento de procedimentos.
import React, { useMemo, useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../styles/colors';
import SearchBar from '../components/SearchBar';
import { useAppData } from '../context/AppDataContext';
import { ListSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { showConfirmation, showErrorAlert } from '../components/ConfirmationAlert';

const formatCurrency = value => {
  const fixed = value.toFixed(2).replace('.', ',');
  return `R$ ${fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const normalize = value => (value || '').toLowerCase().trim();

export default function ProceduresScreen() {
  const navigation = useNavigation();
  const { procedures, removeProcedure, loading, error } = useAppData();
  const [query, setQuery] = useState('');

  const filteredProcedures = useMemo(() => {
    if (!query.trim()) return procedures;
    const normalizedQuery = normalize(query);
    return procedures.filter(item => {
      const nameMatch = normalize(item.name).includes(normalizedQuery);
      const descriptionMatch = normalize(item.description).includes(normalizedQuery);
      return nameMatch || descriptionMatch;
    });
  }, [procedures, query]);

  const handleDeleteProcedure = procedure => {
    showConfirmation(
      'Remover procedimento',
      `Deseja remover "${procedure.name}"?`,
      async () => {
        try {
          await removeProcedure(procedure.id);
        } catch (error) {
          showErrorAlert('Erro', 'Não foi possível remover o procedimento.');
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
          title="Erro ao carregar procedimentos"
          description="Tente novamente em alguns instantes."
        />
      );
    }
    if (query.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum procedimento encontrado"
          description="Tente ajustar a busca."
        />
      );
    }
    return (
      <EmptyState
        icon="medkit-outline"
        title="Nenhum procedimento cadastrado"
        description="Cadastre o primeiro procedimento da clínica."
        actionLabel="Cadastrar procedimento"
        onAction={() => navigation.navigate('NewProcedure')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Procedimentos</Text>
          <Text style={styles.subtitle}>Gerencie os procedimentos da clínica.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NewProcedure')}>
          <Text style={styles.addText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Buscar procedimento"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <Text style={styles.count}>{filteredProcedures.length} procedimentos</Text>

      {loading && !procedures.length ? (
        <ListSkeleton count={5} />
      ) : (
        <FlatList
          data={filteredProcedures}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="medkit-outline" size={18} color={colors.azul} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cardSub} numberOfLines={2}>
                    {(item.durationMinutes ? `${item.durationMinutes} min` : 'Duração n/d')}
                    {item.description ? ` • ${item.description}` : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardValue}>{formatCurrency(item.price)}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardIconButton}
                    onPress={() => navigation.navigate('NewProcedure', { procedureId: item.id })}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.textDark} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardIconButton, styles.cardIconDanger]}
                    onPress={() => handleDeleteProcedure(item)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  subtitle: { marginTop: 4, color: colors.textGray, fontWeight: '600' },
  searchWrapper: { marginTop: 4, marginBottom: 12 },
  count: { marginBottom: 8, color: colors.textGray, fontWeight: '700' },
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bordas,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  cardInfo: { flex: 1, flexShrink: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.corBotoesLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  cardTitle: { color: colors.textDark, fontWeight: '700' },
  cardSub: { color: colors.textGray, marginTop: 4, lineHeight: 18 },
  cardRight: { minWidth: 96, alignItems: 'flex-end', justifyContent: 'space-between' },
  cardValue: { color: colors.corBotoes, fontWeight: '800' },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cardIconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardIconDanger: { backgroundColor: '#FEE2E2' }
});
