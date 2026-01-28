import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
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

const { width } = Dimensions.get('window');

type PlayerRole = 'ATT' | 'CEN' | 'DIF' | 'POR';
type PreferredFoot = 'DX' | 'SX' | 'AMB';

export default function SetupPlayerScreen() {
    const router = useRouter();
    const [teamCode, setTeamCode] = useState('');
    const [isJoined, setIsJoined] = useState(false); // Validated code state

    // FUT Card Props
    const [role, setRole] = useState<PlayerRole>('ATT');
    const [number, setNumber] = useState('10');
    const [foot, setFoot] = useState<PreferredFoot>('DX');

    const handleJoin = async () => {
        // Simulate code validation
        if (teamCode.length < 4) {
            Alert.alert('Codice non valido', 'Il codice squadra deve avere almeno 4 caratteri.');
            return;
        }
        setIsJoined(true);
    };

    const handleContinue = () => {
        // Navigate to Permissions with params
        router.push({
            pathname: '/onboarding/permissions',
            params: {
                role: 'player',
                teamCode,
                playerRole: role,
                playerNumber: number,
                playerFoot: foot
            }
        });
    };

    const renderFutCard = () => (
        <View style={styles.cardContainer}>
            {/* Card Background / Shape */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.ratingText}>88</Text>
                    <Text style={styles.positionText}>{role}</Text>
                </View>

                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={60} color="#334155" />
                </View>

                <View style={styles.cardStats}>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>NUM</Text>
                        <Text style={styles.statValue}>{number || '??'}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>PIEDE</Text>
                        <Text style={styles.statValue}>{foot}</Text>
                    </View>
                </View>

                {/* Visual Flair */}
                <View style={styles.cardShine} />
            </View>
        </View>
    );

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
                        {!isJoined ? (
                            <>
                                <Text style={styles.title}>Unisciti allo Spogliatoio</Text>
                                <Text style={styles.subtitle}>Inserisci il codice invito della tua squadra.</Text>

                                <View style={styles.codeContainer}>
                                    <Ionicons name="key-outline" size={40} color="#22c55e" style={{ marginBottom: 16 }} />
                                    <TextInput
                                        style={styles.codeInput}
                                        placeholder="CODE"
                                        placeholderTextColor="#333"
                                        value={teamCode}
                                        onChangeText={(t) => setTeamCode(t.toUpperCase())}
                                        maxLength={6}
                                        autoCapitalize="characters"
                                    />
                                    <Text style={styles.codeHint}>Chiedi il codice al tuo Mister</Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, teamCode.length < 4 && styles.buttonDisabled]}
                                    onPress={handleJoin}
                                    disabled={teamCode.length < 4}
                                >
                                    <Text style={styles.buttonText}>Verifica Codice</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.title}>Crea la tua Carta</Text>
                                <Text style={styles.subtitle}>Personalizza il tuo profilo giocatore.</Text>

                                {/* FUT Card Preview */}
                                {renderFutCard()}

                                {/* Controls */}
                                <View style={styles.controls}>
                                    <View style={styles.controlGroup}>
                                        <Text style={styles.label}>Ruolo</Text>
                                        <View style={styles.pillContainer}>
                                            {(['ATT', 'CEN', 'DIF', 'POR'] as PlayerRole[]).map((r) => (
                                                <TouchableOpacity
                                                    key={r}
                                                    style={[styles.pill, role === r && styles.pillActive]}
                                                    onPress={() => setRole(r)}
                                                >
                                                    <Text style={[styles.pillText, role === r && styles.pillTextActive]}>{r}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.controlGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Numero</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={number}
                                                onChangeText={setNumber}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                            />
                                        </View>

                                        <View style={[styles.controlGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Piede</Text>
                                            <View style={styles.pillContainer}>
                                                {(['DX', 'SX'] as PreferredFoot[]).map((f) => (
                                                    <TouchableOpacity
                                                        key={f}
                                                        style={[styles.pill, foot === f && styles.pillActive, { paddingHorizontal: 12 }]}
                                                        onPress={() => setFoot(f)}
                                                    >
                                                        <Text style={[styles.pillText, foot === f && styles.pillTextActive]}>{f}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, styles.finishButton]}
                                    onPress={handleContinue}
                                >
                                    <Text style={styles.buttonText}>Continua</Text>
                                </TouchableOpacity>
                            </>
                        )}

                    </ScrollView>
                </KeyboardAvoidingView>
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
        paddingBottom: 40,
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
    codeContainer: {
        backgroundColor: '#121212',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 32,
    },
    codeInput: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        letterSpacing: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#22c55e',
        width: '80%',
        paddingBottom: 8,
    },
    codeHint: {
        marginTop: 16,
        color: '#64748b',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#22c55e',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    finishButton: {
        marginTop: 32,
    },

    // FUT Card Styles
    cardContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    card: {
        width: 180,
        height: 260,
        backgroundColor: '#d4af37', // Gold base
        borderRadius: 16,
        padding: 12,
        borderWidth: 4,
        borderColor: '#aa8c2c',
        position: 'relative',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000',
    },
    positionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    avatarPlaceholder: {
        position: 'absolute',
        right: 12,
        top: 40,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
    },
    cardStats: {
        marginTop: 80,
        borderTopWidth: 2,
        borderTopColor: 'rgba(0,0,0,0.1)',
        paddingTop: 12,
        gap: 4,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#333',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000',
    },
    cardShine: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        backgroundColor: 'rgba(255,255,255,0.2)',
        transform: [{ rotate: '45deg' }],
    },

    // Controls
    controls: {
        gap: 20,
    },
    controlGroup: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    pillContainer: {
        flexDirection: 'row',
        backgroundColor: '#121212',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#333',
    },
    pill: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    pillActive: {
        backgroundColor: '#334155',
    },
    pillText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 12,
    },
    pillTextActive: {
        color: '#FFF',
    },
    input: {
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 12,
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '700',
    },

});
