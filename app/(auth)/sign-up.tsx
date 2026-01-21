import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUp() {
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        if (!fullName || !email || !password) {
            setError('Compila tutti i campi');
            return;
        }
        if (password !== confirmPassword) {
            setError('Le password non corrispondono');
            return;
        }
        if (password.length < 6) {
            setError('La password deve essere di almeno 6 caratteri');
            return;
        }

        setLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
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
                        <Text style={styles.headerTitle}>Crea Account</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nome Completo</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Mario Rossi"
                                        placeholderTextColor="#64748b"
                                        style={styles.input}
                                        value={fullName}
                                        onChangeText={setFullName}
                                        autoCapitalize="words"
                                        textContentType="name"
                                        autoComplete="name"
                                    />
                                </View>
                            </View>

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
                                        textContentType="emailAddress"
                                        autoComplete="email"
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

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Conferma Password</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        secureTextEntry
                                        style={styles.input}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>
                            </View>

                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            <TouchableOpacity
                                style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                                onPress={handleSignUp}
                                activeOpacity={0.9}
                                disabled={loading}
                            >
                                <Text style={styles.signUpButtonText}>{loading ? 'Registrazione...' : 'Crea Account'}</Text>
                            </TouchableOpacity>

                            <View style={styles.loginLink}>
                                <Text style={styles.loginLinkText}>
                                    Hai già un account?{' '}
                                    <Text style={styles.loginLinkHighlight} onPress={() => router.back()}>Accedi</Text>
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
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
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    form: { paddingHorizontal: 24, paddingTop: 10 },
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
    signUpButton: {
        height: 56,
        backgroundColor: '#28A745',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#28A745',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
    },
    signUpButtonDisabled: { opacity: 0.7 },
    signUpButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    loginLink: { alignItems: 'center', marginTop: 24 },
    loginLinkText: { fontSize: 15, color: '#94a3b8' },
    loginLinkHighlight: { color: '#4ADE80', fontWeight: '700' },
});
