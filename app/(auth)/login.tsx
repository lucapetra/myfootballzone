import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const router = useRouter();

    const handleGoogleLogin = async () => {
        // TODO: Implement Google OAuth with Supabase
        console.log('Google Login');
        router.replace('/(tabs)');
    };

    const handleAppleLogin = async () => {
        // TODO: Implement Apple Sign In with Supabase
        console.log('Apple Login');
        router.replace('/(tabs)');
    };

    const handleEmailLogin = () => {
        router.push('/(auth)/email-login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Image */}
            <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3ardDVZAk76Z8Oc6OVtBKwna-MNoG4fLzKreTYYhjdql27_e-Mth1Z4GxFbhKl3I6E0df5HWCZFi7Rl73-SUcFQlh5c7-17aNUS_P-DjBB5cOBFqEDL3YDveStHcvz4DOIAdwdpui2UloungBV1xMlTnwaoxqRSjbvPYxaP4EIO2P69CBwraCpPyKkk1F7Wr5piCuFoPF2vYkhzY01PED_63M0e_7Y0ur-KeJU7WhlP8TSaGq0KfxmJoFV7kJ5rkrZrRuqzoD8HbC' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                />
            </ImageBackground>

            {/* Content */}
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="football" size={32} color="#FFF" />
                    </View>
                    <Text style={styles.logoText}>MyFootballZone</Text>
                </View>

                {/* Hero Text */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Porta la tua squadra alla vittoria.</Text>
                    <Text style={styles.heroSubtitle}>Lo strumento di gestione definitivo per il campo.</Text>
                </View>

                {/* Auth Buttons */}
                <View style={styles.authSection}>
                    {/* Glass Panel */}
                    <BlurView intensity={30} tint="light" style={styles.glassPanel}>
                        {/* Google Button */}
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} activeOpacity={0.9}>
                            <Ionicons name="logo-google" size={20} color="#333" />
                            <Text style={styles.googleButtonText}>Continua con Google</Text>
                        </TouchableOpacity>

                        {/* Apple Button - Liquid Glass Style */}
                        <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin} activeOpacity={0.9}>
                            <Ionicons name="logo-apple" size={24} color="#FFF" />
                            <Text style={styles.appleButtonText}>Continua con Apple</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OPPURE</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Email Button */}
                        <TouchableOpacity style={styles.emailButton} onPress={handleEmailLogin} activeOpacity={0.9}>
                            <Text style={styles.emailButtonText}>Accedi con Email</Text>
                        </TouchableOpacity>
                    </BlurView>

                    {/* Register Link */}
                    <View style={styles.registerSection}>
                        <Text style={styles.registerText}>
                            Non hai un account?{' '}
                            <Text style={styles.registerLink} onPress={() => router.push('/(auth)/sign-up')}>Registrati</Text>
                        </Text>
                    </View>

                    {/* Terms */}
                    <Text style={styles.termsText}>
                        Continuando, accetti i nostri Termini di Servizio e la Privacy Policy.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    backgroundImage: { position: 'absolute', width: '100%', height: '100%' },
    gradient: { position: 'absolute', width: '100%', height: '100%' },
    content: { flex: 1, justifyContent: 'space-between', paddingVertical: 48, paddingHorizontal: 24, maxWidth: 450, alignSelf: 'center', width: '100%' },

    logoSection: { alignItems: 'center', marginTop: 16 },
    logoCircle: { width: 56, height: 56, backgroundColor: '#28A745', borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#28A745', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    logoText: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 12, letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },

    heroSection: { alignItems: 'center', paddingHorizontal: 8 },
    heroTitle: { color: '#FFF', fontSize: 36, fontWeight: '800', textAlign: 'center', lineHeight: 44, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
    heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '500', textAlign: 'center', marginTop: 16, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

    authSection: { width: '100%' },
    glassPanel: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', gap: 12, overflow: 'hidden' },

    googleButton: { height: 56, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
    googleButtonText: { color: '#1F2937', fontSize: 16, fontWeight: '700' },

    appleButton: { height: 60, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
    appleButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
    dividerText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },

    emailButton: { height: 56, backgroundColor: '#28A745', borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#28A745', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
    emailButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

    registerSection: { alignItems: 'center', marginTop: 16 },
    registerText: { color: '#FFF', fontSize: 15, fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    registerLink: { color: '#28A745', fontWeight: '700' },

    termsText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', marginTop: 12, paddingHorizontal: 40, lineHeight: 16 },
});
