import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import PatientsScreen from '../screens/PatientsScreen';
import AgendaScreen from '../screens/AgendaScreen';
import FinanceScreen from '../screens/FinanceScreen';
import { Ionicons } from '@expo/vector-icons';

import {
    View,
    Text,
    Image
} from 'react-native';


import iconeOdonto from '../../assets/images/iconeOdonto.png';

const Tab = createBottomTabNavigator();

const headerOptions = {
    headerLeft: () => (
        <Image
            source={iconeOdonto}
            style={{
                width: 32,
                height: 45,
                marginLeft: 15
            }}
        />
    ),

    headerTitle: () => (

        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'

            }}
        >

            <Ionicons
                name="person"
                size={26}
                color="white"
                style={{ marginRight: 8 }}
            />

            <Text
                style={{
                    color: 'white',
                    fontSize: 22,
                    fontWeight: 'bold'
                }}
            >
                Dr Leopoldo
            </Text>

        </View>

    ),

    headerTitleAlign: 'center',

    headerStyle: {
        backgroundColor: '#2563FF'
    },


    headerRight: () => (
        <Ionicons
            name="menu"
            size={28}
            color="white"
            style={{ marginRight: 15 }}
        />
    )
}

export default function TabNavigation() {

    return (

        <Tab.Navigator
            screenOptions={{
                headerShown: true
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

        </Tab.Navigator>

    );

}
