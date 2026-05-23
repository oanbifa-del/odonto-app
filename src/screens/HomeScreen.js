import React from 'react';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';  /*BIBLIOTECA PARA ICONES*/

import colors from '../styles/colors';   /*IMPORT DAS CORES no colors.js*/

export default function HomeScreen() {

  return (

    <View style={styles.container}>

      {/* 🔍 Barra de busca */}
      <View style={styles.searchBar}>
        <Ionicons name="search" 
        size={20} 
        color="#999" 
        style={{ marginRight: 8 }}
        style={styles.icon} 
        />
        <TextInput
          placeholder="Buscar pacientes..."
          placeholderTextColor="#999"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.quickButton}>

        <Ionicons
          name="add-circle-outline"
          size={28}
          color={colors.white}
          style={styles.icon}
        />

        <Text style={styles.quickButtonText}>
          Novo Procedimento
        </Text>

      </TouchableOpacity>

      <TouchableOpacity style={styles.quickButton}>

        <Ionicons
          name="person-add-outline"
          size={28}
          color={colors.white}
          style={styles.icon}
        />

        <Text style={styles.quickButtonText}>
          Novo Paciente
        </Text>

      </TouchableOpacity>

      <TouchableOpacity style={styles.quickButton}>

        <Ionicons
          name="calendar-clear-outline"
          size={28}
          color={colors.white}
          style={styles.icon}
        />

        <Text style={styles.quickButtonText}>
          Nova Consulta
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.bordas,
    height: 45,
    marginTop: 16,
    marginHorizontal: 25,
    marginBottom: 100
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },

  quickButton: {

    backgroundColor: colors.corBotoes,
    marginHorizontal: 60,
    marginTop: 30,
    padding: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1.0,
    shadowRadius: 8,
    elevation: 3,
  },

  quickButtonText: {

    marginLeft: 12,
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
    textShadowColor: colors.shadow,
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 3,
  },
  icon: {
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }
});

