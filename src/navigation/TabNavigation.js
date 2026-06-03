// Navegação de abas (menu inferior) do app.
// + Cabeçalho com menu hamburguer funcional

import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import PatientsScreen from '../screens/PatientsScreen';
import AgendaScreen from '../screens/AgendaScreen';
import FinanceScreen from '../screens/FinanceScreen';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable
} from 'react-native';

import iconeOdonto from '../../assets/images/iconeOdonto.png';

const Tab = createBottomTabNavigator();

export default function TabNavigation() {

    const navigationRef = useNavigation();

    const [menuVisible, setMenuVisible] = React.useState(false);

    const { signOutUser } = useAuth();

    return (

        <>
            {/* ===== MENU HAMBURGUER ===== */}

            <Modal
                transparent={true}
                visible={menuVisible}
                animationType="fade"
            >

                <Pressable
                    style={styles.overlay}
                    onPress={() => setMenuVisible(false)}
                >

                    <View style={styles.menuContainer}>

                        <TouchableOpacity
                            style={styles.menuItem}

                            onPress={() => {

                                setMenuVisible(false);

                                navigationRef.navigate('Perfil');
                            }}
                        >

                            <Text style={styles.menuText}>
                                Perfil
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                        >

                            <Text style={styles.menuText}>
                                Configurações
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={async () => {
                                setMenuVisible(false);
                                await signOutUser();
                            }}
                        >

                            <Text style={styles.menuText}>
                                Sair
                            </Text>

                        </TouchableOpacity>

                    </View>

                </Pressable>

            </Modal>

            <Tab.Navigator

                screenOptions={({ navigation }) => ({

                    // ===== HEADER =====

                    headerShown: true,

                    headerStyle: {
                        backgroundColor: '#2563FF'
                    },

                    headerShadowVisible: false,

                    headerTitleAlign: 'center',

                    headerTitle: () => (

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >

                            <Ionicons
                                name="person"
                                size={24}
                                color="white"
                                style={{ marginRight: 8 }}
                            />

                            <Text
                                style={{
                                    color: 'white',
                                    fontSize: 20,
                                    fontWeight: 'bold'
                                }}
                            >
                                Dr Leopoldo
                            </Text>

                        </View>
                    ),

                    headerLeft: () => (

                        <Image
                            source={iconeOdonto}
                            style={{
                                width: 32,
                                height: 45,
                                marginLeft: 18,
                                resizeMode: 'contain'
                            }}
                        />
                    ),

                    // ===== BOTÃO MENU =====

                    headerRight: () => (

                        <TouchableOpacity
                            onPress={() => setMenuVisible(true)}
                            style={{ marginRight: 15 }}
                        >

                            <Ionicons
                                name="menu"
                                size={28}
                                color="white"
                            />

                        </TouchableOpacity>
                    ),

                    // ===== TAB BAR =====

                    tabBarActiveTintColor: colors.azul,

                    tabBarInactiveTintColor: colors.textMuted,

                    tabBarShowLabel: true,

                    tabBarLabelStyle: styles.tabLabel,

                    tabBarStyle: styles.tabBar,

                    tabBarHideOnKeyboard: true
                })}
            >

                <Tab.Screen
                    name="Início"
                    component={HomeScreen}

                    options={{
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
        </>
    );
}

// ===== ESTILOS =====

const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)'
    },

    menuContainer: {
        position: 'absolute',
        top: 90,
        right: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        width: 180,
        paddingVertical: 10,
        elevation: 10
    },

    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 18
    },

    menuText: {
        fontSize: 16,
        fontWeight: '600'
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