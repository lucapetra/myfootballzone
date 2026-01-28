import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetupMisterScreen() {
    const router = useRouter();
    const [teamName, setTeamName] = useState('');
    const [city, setCity] = useState('');

    // Auto-Logo Logic
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const handleContinue = () => {
        if (!teamName || !city) {
            Alert.alert('Campi mancanti', 'Inserisci il nome della squadra e la città.');
            return;
        }

        // Navigate to Permissions with params
        router.push({
            pathname: '/onboarding/permissions',
            params: {
                role: 'mister',
                teamName,
                city
            }
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.title}>Crea il tuo Spogliatoio</Text>
                        <Text style={styles.subtitle}>Dai un'identità alla tua squadra.</Text>

                        {/* Auto-Logo Preview */}
                        <View style={styles.logoPreviewContainer}>
                            <View style={styles.logoBadge}>
                                <Ionicons name="shield" size={120} color="#22c55e" />
                                <View style={styles.logoTextContainer}>
                                    <Text style={styles.logoText}>{getInitials(teamName)}</Text>
                                </View>
                            </View>
                            <Text style={styles.logoLabel}>Logo generato automaticamente</Text>
                        </View>

                        {/* Inputs */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Nome Squadra</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Es. Real Madrink"
                                    placeholderTextColor="#64748b"
                                    value={teamName}
                                    onChangeText={setTeamName}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Città</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Es. Milano"
                                    placeholderTextColor="#64748b"
                                    value={city}
                                    onChangeText={setCity}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, (!teamName || !city) && styles.buttonDisabled]}
                        onPress={handleContinue}
                        disabled={!teamName || !city}
                    >
                        <Text style={styles.buttonText}>Continua</Text>
                    </TouchableOpacity>
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
        backgroundColor: '#1e1e1e',
    },
    content: {
        paddingHorizontal: 24,
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
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 40,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    logoPreviewContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBadge: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 16,
    },
    logoTextContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10, // Adjust for shield shape
    },
    logoText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#020403', // Dark text on green shield
    },
    logoLabel: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputContainer: {
        gap: 24,
    },
    inputWrapper: {
        gap: 8,
    },
    label: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#FFF',
        fontWeight: '600',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    button: {
        backgroundColor: '#22c55e',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
