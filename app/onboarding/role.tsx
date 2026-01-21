import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleContinue = async () => {
        if (!selectedRole) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('people')
                    .update({ role_primary: selectedRole })
                    .eq('user_id', user.id);

                if (error) throw error;
            }

            router.push({
                pathname: '/onboarding/action',
                params: { role: selectedRole }
            });
        } catch (error) {
            console.error('Error updating role:', error);
            // Optionally show alert
            router.push({
                pathname: '/onboarding/action',
                params: { role: selectedRole }
            });
        }
    };

    const RoleCard = ({ id, icon, title, description }: { id: string, icon: keyof typeof MaterialIcons.glyphMap, title: string, description: string }) => {
        const isSelected = selectedRole === id;
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    isSelected && styles.cardSelected
                ]}
                onPress={() => setSelectedRole(id)}
                activeOpacity={0.8}
            >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                    <MaterialIcons name={icon} size={28} color={isSelected ? '#FFF' : '#1E6B3E'} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, isSelected && styles.textSelected]}>{title}</Text>
                    <Text style={[styles.cardDesc, isSelected && styles.textDescSelected]}>{description}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
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
                    <View style={[styles.progressStep, styles.progressActive]} />
                    <View style={styles.progressStep} />
                    {/* <View style={styles.progressStep} /> */}
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Chi sei in squadra?</Text>
                <Text style={styles.subtitle}>Seleziona il tuo ruolo principale per personalizzare la tua esperienza.</Text>

                <View style={styles.cardsContainer}>
                    <RoleCard
                        id="allenatore"
                        icon="sports"
                        title="Mister (Allenatore)"
                        description="Guido la squadra, decido la formazione e gestisco le convocazioni."
                    />
                    <RoleCard
                        id="dirigente"
                        icon="assignment"
                        title="Dirigente"
                        description="Organizzo la logistica, gestisco i contatti e supporto lo staff."
                    />
                    <RoleCard
                        id="giocatore"
                        icon="sports-soccer"
                        title="Giocatore"
                        description="Voglio vedere le mie statistiche, convocazioni e il calendario."
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !selectedRole && styles.buttonDisabled]}
                    disabled={!selectedRole}
                    onPress={handleContinue}
                >
                    <Text style={styles.buttonText}>Continua</Text>
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

    cardsContainer: { gap: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    cardSelected: {
        borderColor: '#1E6B3E',
        backgroundColor: '#f0fdf4'
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    iconContainerSelected: {
        backgroundColor: '#1E6B3E',
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#64748b', lineHeight: 16 },
    textSelected: { color: '#1E6B3E' },
    textDescSelected: { color: '#166534' },

    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
    radioSelected: { borderColor: '#1E6B3E' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1E6B3E' },

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
