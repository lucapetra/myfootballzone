import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type AuthView = 'selection' | 'email';

export default function Login() {
    const router = useRouter();
    const [currentView, setCurrentView] = useState<AuthView>('selection');

    // Email Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleLogin = async () => {
        console.log('Google Login');
        router.replace('/(tabs)');
    };

    const handleAppleLogin = async () => {
        console.log('Apple Login');
        router.replace('/(tabs)');
    };

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

    const handleBack = () => {
        if (currentView === 'email') {
            setCurrentView('selection');
            setError('');
        } else {
            router.back();
        }
    };

    return (
        <ImageBackground
            source={require('@/assets/images/lastWarmup.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                style={styles.gradient}
            >
                <StatusBar style="light" />
                <SafeAreaView style={styles.safeArea}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        {currentView === 'email' && (
                            <Text style={styles.headerTitle}>Accedi</Text>
                        )}
                        {currentView === 'email' && <View style={{ width: 40 }} />}
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <ScrollView contentContainerStyle={styles.content}>

                            {currentView === 'selection' ? (
                                <>
                                    {/* Hero Text */}
                                    <View style={styles.heroSection}>
                                        <Text style={styles.heroTitle}>Benvenuto in Campo</Text>
                                        <Text style={styles.heroSubtitle}>Gestisci la tua squadra, organizza le partite e porta a casa la vittoria.</Text>
                                    </View>

                                    {/* Auth Buttons */}
                                    <View style={styles.buttonsContainer}>
                                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} activeOpacity={0.9}>
                                            <Ionicons name="logo-google" size={20} color="#FFF" />
                                            <Text style={styles.googleButtonText}>Continua con Google</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin} activeOpacity={0.9}>
                                            <Ionicons name="logo-apple" size={24} color="#FFF" />
                                            <Text style={styles.appleButtonText}>Continua con Apple</Text>
                                        </TouchableOpacity>

                                        <View style={styles.dividerRow}>
                                            <View style={styles.dividerLine} />
                                            <Text style={styles.dividerText}>OPPURE</Text>
                                            <View style={styles.dividerLine} />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.emailButton}
                                            onPress={() => setCurrentView('email')}
                                            activeOpacity={0.9}
                                        >
                                            <Text style={styles.emailButtonText}>Accedi con Email</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.termsText}>
                                        Continuando, accetti i nostri Termini di Servizio e la Privacy Policy.
                                    </Text>
                                </>
                            ) : (
                                /* Email Form */
                                <View style={styles.formContainer}>
                                    <View style={styles.formGroup}>
                                        <View style={styles.inputWrapper}>
                                            <Text style={styles.label}>Email</Text>
                                            <View style={styles.inputGroup}>
                                                <View style={styles.inputIcon}>
                                                    <Ionicons name="mail-outline" size={20} color="#64748b" />
                                                </View>
                                                <TextInput
                                                    placeholder="Inserisci la tua email"
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

                                        <View style={styles.inputWrapper}>
                                            <Text style={styles.label}>Password</Text>
                                            <View style={styles.inputGroup}>
                                                <View style={styles.inputIcon}>
                                                    <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                                                </View>
                                                <TextInput
                                                    placeholder="Inserisci la tua password"
                                                    placeholderTextColor="#64748b"
                                                    secureTextEntry={!showPassword}
                                                    style={styles.input}
                                                    value={password}
                                                    onChangeText={setPassword}
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
                                        {loading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={styles.loginButtonText}>Accedi</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    gradient: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 56,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    keyboardView: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 60,
        maxWidth: 450,
        alignSelf: 'center',
        width: '100%',
    },
    heroSection: {
        marginBottom: 80,
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 40,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        lineHeight: 24,
    },
    buttonsContainer: {
        gap: 24,
    },
    googleButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    appleButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    appleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '600',
    },
    emailButton: {
        backgroundColor: '#1e293b',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    emailButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 32,
        lineHeight: 18,
    },
    formContainer: {
        gap: 24,
    },
    formGroup: {
        gap: 16,
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
        letterSpacing: 0,
    },
    eyeIcon: {
        padding: 4,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#22c55e',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    loginButtonDisabled: {
        opacity: 0.5,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

