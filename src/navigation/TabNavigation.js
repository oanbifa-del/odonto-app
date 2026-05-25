// Navegação de abas (menu inferior) do app.
import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import PatientsScreen from '../screens/PatientsScreen';
import AgendaScreen from '../screens/AgendaScreen';
import FinanceScreen from '../screens/FinanceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

import {
    View,
    Text,
    Image,
    StyleSheet
} from 'react-native';


import iconeOdonto from '../../assets/images/iconeOdonto.png';

const Tab = createBottomTabNavigator();

export default function TabNavigation() {

    return (

        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                headerTintColor: colors.textDark,
                tabBarActiveTintColor: colors.azul,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabLabel,
                tabBarStyle: styles.tabBar,
                tabBarHideOnKeyboard: true
            }}
        >
            <Tab.Screen
                name="Início"
                component={HomeScreen}

                options={{
                    ...headerOptions,

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="home"
                            color={color}
                            size={size}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="Pacientes"
                component={PatientsScreen}
                options={{
                    ...headerOptions,

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="people"
                            color={color}
                            size={size}
                        />
                    )
                }}

            />

            <Tab.Screen
                name="Agenda"
                component={AgendaScreen}
                options={{
                    ...headerOptions,

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="calendar"
                            color={color}
                            size={size}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="Financeiro"
                component={FinanceScreen}
                options={{
                    ...headerOptions,

                    tabBarIcon: ({ color, size }) => (

                        <Ionicons
                            name="trending-up"
                            color={color}
                            size={size}
                        />
                    )
                }}
            />

            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
                options={{
                    ...headerOptions,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-circle"
                            color={color}
                            size={size}
                        />
                    )
                }}
            />

        </Tab.Navigator>

    );

}

const styles = StyleSheet.create({
    logo: {
        width: 32,
        height: 45,
        marginLeft: 16,
        resizeMode: 'contain'
    },
    header: {
        backgroundColor: colors.surface
    },
    headerTitle: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerOverline: {
        color: colors.textGray,
        fontSize: 12,
        fontWeight: '600'
    },
    headerName: {
        color: colors.textDark,
        fontSize: 16,
        fontWeight: '800'
    },
    tabBar: {
        position: 'absolute',
        height: 72,
        left: 12,
        right: 12,
        bottom: 12,
        borderRadius: 18,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.bordas,
        paddingBottom: 10,
        paddingTop: 6,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 8
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '700'
    }
});

const headerOptions = {
    headerLeft: () => (
        <Image
            source={iconeOdonto}
            style={styles.logo}
        />
    ),

    headerTitle: () => (
        <View style={styles.headerTitle}>
            <Text style={styles.headerOverline}>Clinica Odonto</Text>
            <Text style={styles.headerName}>Dr Leopoldo Da Silva</Text>
        </View>
    ),

    headerTitleAlign: 'center',

    headerStyle: styles.header,
    headerShadowVisible: false,

    headerRight: () => null
};
