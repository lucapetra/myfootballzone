import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    // console.log('Register Params:', params);

    const handleRegister = async (provider: 'apple' | 'google' | 'email') => {
        setLoading(true);

        try {
            // TODO: Implement actual Supabase Auth logic here
            // const { data, error } = await supabase.auth.signUp(...) OR signInWithOAuth

            // Simulate Auth & Data Saving
            await new Promise(resolve => setTimeout(resolve, 1500));

            // After Auth, save the params data to DB
            if (params.role === 'mister') {
                // Create Team
                console.log('Creating Team:', params.teamName, params.city);
            } else {
                // Join Team / Create Player Profile
                console.log('Joining Team:', params.teamCode, params.playerRole, params.playerNumber);
            }

            // Set Onboarding Complete
            await AsyncStorage.setItem('hasLaunched', 'true');

            // Go to Home
            router.replace('/(tabs)');

        } catch (error) {
            Alert.alert('Errore Registrazione', 'Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('@/assets/images/saveProgress.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)', '#020403']}
                style={styles.gradient}
            >
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={styles.safeArea}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="save-outline" size={60} color="#22c55e" />
                        </View>

                        <Text style={styles.title}>Salva i progressi</Text>
                        <Text style={styles.subtitle}>
                            Crea un account per confermare {params.role === 'mister' ? 'la tua squadra' : 'il tuo giocatore'} ed entrare in campo.
                        </Text>

                        <View style={styles.authContainer}>
                            <TouchableOpacity style={styles.authButton} onPress={() => handleRegister('apple')}>
                                <Ionicons name="logo-apple" size={24} color="#FFF" />
                                <Text style={styles.authText}>Continua con Apple</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.authButton} onPress={() => handleRegister('google')}>
                                <Ionicons name="logo-google" size={24} color="#FFF" />
                                <Text style={styles.authText}>Continua con Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.authButton, styles.emailButton]}
                                onPress={() => router.push({
                                    pathname: '/onboarding/email-register',
                                    params: params as any
                                })}
                            >
                                <Ionicons name="mail" size={24} color="#FFF" style={{ opacity: 0.8 }} />
                                <Text style={styles.authText}>Usa Email</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#22c55e" />
                        </View>
                    )}

                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020403',
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(30,30,30,0.6)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -80, // Visual offset
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
        backdropFilter: 'blur(10px)',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 12,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#e2e8f0',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    authContainer: {
        width: '100%',
        gap: 16,
    },
    authButton: {
        height: 56,
        backgroundColor: 'rgba(30,30,30,0.8)', // More transparent for background context
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
        backdropFilter: 'blur(10px)',
    },
    emailButton: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.2)',
    },
    authText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
