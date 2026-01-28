import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmailRegisterScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Email non valida', 'Inserisci un indirizzo email valido.');
            return;
        }

        if (!email || !password || !confirmPassword) {
            Alert.alert('Dati mancanti', 'Inserisci tutti i campi richiesti.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Password debole', 'La password deve avere almeno 6 caratteri.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password non corrispondenti', 'Le due password devono essere uguali.');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Supabase Auth User
            const { data: { user }, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!user) throw new Error('Nessun utente creato');

            // 2. Handle Data Persistence via RPC (Bypass RLS)
            if (params.role === 'mister') {
                // Generate a random 6-char code for the team
                const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

                const { error: rpcError } = await supabase.rpc('create_mister_team', {
                    p_user_id: user.id,
                    p_team_name: params.teamName,
                    p_city: params.city,
                    p_team_code: teamCode
                });

                if (rpcError) throw rpcError;

            } else {
                // Player Flow - Join Team
                const { error: rpcError } = await supabase.rpc('join_team_player', {
                    p_user_id: user.id,
                    p_team_code: params.teamCode,
                    p_role_specific: params.playerRole,
                    p_jersey_number: params.playerNumber,
                    p_preferred_foot: params.playerFoot
                });

                if (rpcError) throw rpcError;
            }

            // 3. Finalize
            await AsyncStorage.setItem('hasLaunched', 'true');
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('Registration Error:', error);
            Alert.alert('Errore', error.message || 'Registrazione fallita. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('@/assets/images/amateurBg.jpeg')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <ScrollView contentContainerStyle={styles.content}>
                            <Text style={styles.title}>Crea Account</Text>
                            <Text style={styles.subtitle}>Inserisci i tuoi dati per completare la registrazione.</Text>

                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <View style={styles.inputIcon}>
                                        <Ionicons name="at" size={20} color="#64748b" />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="#64748b"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.inputIcon}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="#64748b"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#64748b"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.inputIcon}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Conferma Password"
                                        placeholderTextColor="#64748b"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#64748b"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, (!email || !password || !confirmPassword) && styles.disabledButton]}
                                    onPress={handleSignUp}
                                    disabled={!email || !password || !confirmPassword || loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Salva</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 8,
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
    form: {
        gap: 16,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        height: 56,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    submitButton: {
        backgroundColor: '#22c55e',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
