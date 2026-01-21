import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EmailLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Attenzione', 'Inserisci la tua email per recuperare la password.');
            return;
        }

        Alert.alert(
            'Conferma',
            `Vuoi inviare una email di recupero password a ${email}?`,
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Invia',
                    onPress: async () => {
                        setLoading(true);
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                            redirectTo: 'myfootballzone://reset-password',
                        });
                        setLoading(false);

                        if (error) {
                            Alert.alert('Errore', error.message);
                        } else {
                            Alert.alert('Inviata', 'Controlla la tua email per il link di recupero.');
                        }
                    },
                },
            ]
        );
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Inserisci email e password');
            return;
        }

        setLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Image */}
            <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3ardDVZAk76Z8Oc6OVtBKwna-MNoG4fLzKreTYYhjdql27_e-Mth1Z4GxFbhKl3I6E0df5HWCZFi7Rl73-SUcFQlh5c7-17aNUS_P-DjBB5cOBFqEDL3YDveStHcvz4DOIAdwdpui2UloungBV1xMlTnwaoxqRSjbvPYxaP4EIO2P69CBwraCpPyKkk1F7Wr5piCuFoPF2vYkhzY01PED_63M0e_7Y0ur-KeJU7WhlP8TSaGq0KfxmJoFV7kJ5rkrZrRuqzoD8HbC' }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Overlay Gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                style={styles.gradient}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="mario.rossi@example.com"
                                    placeholderTextColor="#64748b"
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                            <Text style={styles.forgotPasswordText}>Password dimenticata?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            activeOpacity={0.9}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>{loading ? 'Accesso in corso...' : 'Accedi'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    image: { ...StyleSheet.absoluteFillObject },
    gradient: { ...StyleSheet.absoluteFillObject, top: '20%' },
    keyboardView: { flex: 1 },
    content: { flex: 1, paddingTop: 50 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 20 },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
    form: { paddingHorizontal: 24, paddingTop: 20 },
    inputGroup: { marginBottom: 20 },
    label: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        height: 56
    },
    inputIcon: { marginLeft: 16 },
    input: { flex: 1, color: '#FFF', padding: 16, fontSize: 16 },
    errorText: { color: '#ef4444', fontSize: 14, marginBottom: 16, textAlign: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 8 },
    forgotPassword: { alignItems: 'flex-end', marginBottom: 32 },
    forgotPasswordText: { color: '#4ADE80', fontSize: 14, fontWeight: '600' },
    loginButton: {
        height: 56,
        backgroundColor: '#28A745',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#28A745',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
    },
    loginButtonDisabled: { opacity: 0.7 },
    loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
