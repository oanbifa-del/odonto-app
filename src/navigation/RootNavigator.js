// Navegação principal com autenticação.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../styles/colors';
import TabNavigation from './TabNavigation';
import NewPatientScreen from '../screens/NewPatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import NewProcedureScreen from '../screens/NewProcedureScreen';
import ProceduresScreen from '../screens/ProceduresScreen';
import NewAppointmentScreen from '../screens/NewAppointmentScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { AppDataProvider } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const stackHeaderOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { fontWeight: '800', color: colors.textDark },
  headerTintColor: colors.textDark,
  headerShadowVisible: false
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2563FF'
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
      
        }
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login', headerTitleAlign: 'center'}}
      />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppDataProvider>
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="Tabs"
          component={TabNavigation}
        />

        <AppStack.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{
            ...stackHeaderOptions,
            headerShown: true,
            title: 'Perfil'
          }}
        />
        <AppStack.Screen
          name="NewPatient"
          component={NewPatientScreen}
          options={{ ...stackHeaderOptions, headerShown: true, title: 'Novo paciente' }}
        />
        <AppStack.Screen
          name="PatientDetail"
          component={PatientDetailScreen}
          options={{ ...stackHeaderOptions, headerShown: true, title: 'Paciente' }}
        />
        <AppStack.Screen
          name="NewProcedure"
          component={NewProcedureScreen}
          options={{ ...stackHeaderOptions, headerShown: true, title: 'Novo procedimento' }}
        />
        <AppStack.Screen
          name="Procedures"
          component={ProceduresScreen}
          options={{ ...stackHeaderOptions, headerShown: true, title: 'Procedimentos' }}
        />
        <AppStack.Screen
          name="NewAppointment"
          component={NewAppointmentScreen}
          options={{ ...stackHeaderOptions, headerShown: true, title: 'Nova consulta' }}
        />
        <AppStack.Screen
          name="AppointmentDetail"
          component={AppointmentDetailScreen}
          options={{ ...stackHeaderOptions, headerShown: true, title: 'Agendamento' }}
        />
      </AppStack.Navigator>
    </AppDataProvider>
  );
}

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <LoadingScreen />;
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}
