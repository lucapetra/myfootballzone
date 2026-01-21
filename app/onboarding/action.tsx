import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActionSelectionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const role = params.role as string;
    const [selectedAction, setSelectedAction] = useState<'create' | 'join' | null>(null);

    const handleContinue = async () => {
        if (!selectedAction) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('people')
                    .update({ onboarding_intent: selectedAction })
                    .eq('user_id', user.id);

                if (error) throw error;
            }

            router.replace('/(tabs)');

        } catch (error) {
            console.error('Error updating intent:', error);
            router.replace('/(tabs)');
        }
    };

    const ActionCard = ({ id, icon, title, description, badge }: { id: 'create' | 'join', icon: keyof typeof MaterialIcons.glyphMap, title: string, description: string, badge?: string }) => {
        const isSelected = selectedAction === id;
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    isSelected && styles.cardSelected
                ]}
                onPress={() => setSelectedAction(id)}
                activeOpacity={0.8}
            >
                {badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
                <View style={[styles.iconContainer, isSelected ? styles.iconContainerSelected : { backgroundColor: '#f1f5f9' }]}>
                    <MaterialIcons name={icon} size={32} color={isSelected ? '#FFF' : '#64748b'} />
                </View>
                <Text style={[styles.cardTitle, isSelected && styles.textSelected]}>{title}</Text>
                <Text style={[styles.cardDesc, isSelected && styles.textDescSelected]}>{description}</Text>

                <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <MaterialIcons name="check" size={16} color="#FFF" />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={styles.progressStep} />
                    <View style={[styles.progressStep, styles.progressActive]} />
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Cosa vuoi fare?</Text>
                <Text style={styles.subtitle}>
                    Come <Text style={styles.roleHighlight}>{role?.toUpperCase()}</Text>, qual è il tuo prossimo passo?
                </Text>

                <View style={styles.cardsContainer}>
                    <ActionCard
                        id="create"
                        icon="add-circle-outline"
                        title="Crea una Nuova Squadra"
                        description="Fonda un nuovo club, gestisci la rosa e invita i tuoi compagni."
                        badge="CONSIGLIATO PER MISTER"
                    />
                    <ActionCard
                        id="join"
                        icon="vpn-key"
                        title="Unisciti a una Squadra"
                        description="Hai un codice invito? Entra subito nello spogliatoio ed accedi ai dati."
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !selectedAction && styles.buttonDisabled]}
                    disabled={!selectedAction}
                    onPress={handleContinue}
                >
                    <Text style={styles.buttonText}>Inizia Setup</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8faf9' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { padding: 8 },
    progressContainer: { flexDirection: 'row', gap: 4 },
    progressStep: { width: 30, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' },
    progressActive: { backgroundColor: '#1E6B3E' },

    content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#64748b', marginBottom: 32, lineHeight: 24 },
    roleHighlight: { color: '#1E6B3E', fontWeight: '700' },

    cardsContainer: { gap: 20 },
    card: {
        padding: 24,
        backgroundColor: '#FFF',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        alignItems: 'center',
        position: 'relative'
    },
    cardSelected: {
        borderColor: '#1E6B3E',
        backgroundColor: '#f0fdf4'
    },
    badge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#1E6B3E',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
    },
    iconContainerSelected: {
        backgroundColor: '#1E6B3E',
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
    cardDesc: { fontSize: 14, color: '#64748b', lineHeight: 20, textAlign: 'center' },
    textSelected: { color: '#1E6B3E' },
    textDescSelected: { color: '#166534' },

    checkCircle: { position: 'absolute', top: 16, right: 16, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
    checkCircleSelected: { backgroundColor: '#1E6B3E', borderColor: '#1E6B3E' },

    footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    button: {
        backgroundColor: '#1E6B3E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#1E6B3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
