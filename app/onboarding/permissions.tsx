// @refresh reset
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PermissionsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [notifStatus, setNotifStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [locStatus, setLocStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

    const requestNotifications = async () => {
        // TODO: Implement actual permission request logic
        setNotifStatus('granted');
        Alert.alert('Notifiche attivate', 'Riceverai aggiornamenti sulle convocazioni.');
    };

    const requestLocation = async () => {
        // TODO: Implement actual permission request logic
        setLocStatus('granted');
        Alert.alert('Posizione attivata', 'Il meteo sarà aggiornato in base al campo.');
    };

    const handleContinue = () => {
        // Forward all params to the next screen (Register)
        router.push({
            pathname: '/onboarding/register',
            params: params as any, // Forward received params
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>Ultimo Riscaldamento</Text>
                    <Text style={styles.subtitle}>Prepara il terreno di gioco per la tua prima partita.</Text>

                    {/* Notifications Card */}
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="notifications-outline" size={28} color="#FFF" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Non restare in panchina</Text>
                            <Text style={styles.cardDesc}>Attiva le notifiche per sapere notifiche su convocazioni e cambi orario.</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionButton, notifStatus === 'granted' && styles.actionButtonActive]}
                            onPress={requestNotifications}
                            disabled={notifStatus === 'granted'}
                        >
                            <Text style={[styles.actionText, notifStatus === 'granted' && { color: '#FFF' }]}>
                                {notifStatus === 'granted' ? 'ON' : 'Attiva'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Location Card */}
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="rainy-outline" size={28} color="#FFF" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Sfida il meteo</Text>
                            <Text style={styles.cardDesc}>Usa la tua posizione per vedere le previsioni sul campo.</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionButton, locStatus === 'granted' && styles.actionButtonActive]}
                            onPress={requestLocation}
                            disabled={locStatus === 'granted'}
                        >
                            <Text style={[styles.actionText, locStatus === 'granted' && { color: '#FFF' }]}>
                                {locStatus === 'granted' ? 'ON' : 'Attiva'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.mainButton} onPress={handleContinue}>
                        <Text style={styles.mainButtonText}>Continua</Text>
                    </TouchableOpacity>
                    <Text style={styles.disclaimer}>Potrai modificare i permessi più tardi nelle impostazioni.</Text>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020403',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(30,30,30,0.6)', // Semi-transparent
    },
    headerTitle: {
        display: 'none',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#e2e8f0',
        textAlign: 'center',
        marginBottom: 40,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: '#cbd5e1',
        lineHeight: 18,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        minWidth: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonActive: {
        backgroundColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#4ade80',
    },
    actionText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    mainButton: {
        backgroundColor: '#22c55e',
        width: '100%',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    mainButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    disclaimer: {
        color: '#cbd5e1',
        fontSize: 12,
        textAlign: 'center',
    },
});
