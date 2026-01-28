import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type Role = 'mister' | 'player';

export default function AuthRoleScreen() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        // Navigate immediately to setup
        if (role === 'mister') {
            router.push('/onboarding/setup-mister');
        } else {
            router.push('/onboarding/setup-player');
        }
    };

    const handleLogin = () => {
        // Go to the separate Login screen
        router.push('/(auth)/login');
    };

    return (
        <ImageBackground
            source={require('@/assets/images/playerOrMister.jpeg')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)', '#020403']}
                style={styles.gradient}
            >
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={styles.safeArea}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Chi sei in campo?</Text>
                        <Text style={styles.subtitle}>Scegli il tuo ruolo per personalizzare l'esperienza.</Text>

                        {/* Role Selection */}
                        <View style={styles.roleContainer}>
                            <TouchableOpacity
                                style={styles.roleCard}
                                onPress={() => handleRoleSelect('mister')}
                                activeOpacity={0.9}
                            >
                                <View style={styles.iconCircle}>
                                    <Ionicons name="clipboard-outline" size={32} color="#64748b" />
                                </View>
                                <Text style={styles.roleTitle}>Mister</Text>
                                <Text style={styles.roleDesc}>Gestisco la squadra</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.roleCard}
                                onPress={() => handleRoleSelect('player')}
                                activeOpacity={0.9}
                            >
                                <View style={styles.iconCircle}>
                                    <Ionicons name="person-outline" size={32} color="#64748b" />
                                </View>
                                <Text style={styles.roleTitle}>Giocatore</Text>
                                <Text style={styles.roleDesc}>Faccio parte della rosa</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                                <Text style={styles.loginText}>Hai già un account? <Text style={styles.loginHighlight}>Accedi</Text></Text>
                            </TouchableOpacity>

                            {/* Invite Code Shortcut */}
                            <TouchableOpacity style={styles.inviteLink} onPress={() => router.push('/onboarding/setup-player')}>
                                <Text style={styles.inviteText}>Hai un codice invito squadra? <Text style={styles.inviteHighlight}>Entra qui</Text></Text>
                            </TouchableOpacity>
                        </View>

                    </View>
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
        paddingHorizontal: 24,
        paddingTop: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
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
        textShadowRadius: 2,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40,
    },
    roleCard: {
        flex: 1,
        backgroundColor: 'rgba(18,18,18,0.8)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(30,30,30,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 4,
    },
    roleDesc: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
        gap: 16,
    },
    loginButton: {
        padding: 12,
    },
    loginText: {
        color: '#cbd5e1',
        fontSize: 16,
    },
    loginHighlight: {
        color: '#22c55e',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    inviteLink: {
        padding: 10,
    },
    inviteText: {
        color: '#64748b',
        fontSize: 14,
    },
    inviteHighlight: {
        color: '#22c55e',
        fontWeight: '700',
    }
});
