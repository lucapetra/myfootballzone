import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
    light: {
        background: '#f8faf9',
        card: '#FFFFFF',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: '#1E6B3E',
        border: '#f1f5f9',
        divider: '#e2e8f0'
    },
    dark: {
        background: '#020403',
        card: '#121212',
        text: '#F8faf9',
        textSecondary: '#94a3b8',
        primary: '#4ADE80',
        border: '#333333',
        divider: '#1e293b'
    }
};

export default function SettingsScreen() {
    const router = useRouter();
    const { theme, setTheme, activeTheme } = useTheme();
    const { mockDataEnabled, setMockDataEnabled } = useSettings();
    const currentColors = activeTheme === 'dark' ? Colors.dark : Colors.light;

    const ThemeOption = ({ mode, label, icon }: { mode: 'light' | 'dark' | 'system', label: string, icon: keyof typeof MaterialIcons.glyphMap }) => {
        const isSelected = theme === mode;
        return (
            <TouchableOpacity
                style={[styles.optionRow, { borderBottomColor: currentColors.divider }]}
                onPress={() => setTheme(mode)}
            >
                <View style={styles.optionLeft}>
                    <MaterialIcons name={icon} size={24} color={currentColors.text} />
                    <Text style={[styles.optionLabel, { color: currentColors.text }]}>{label}</Text>
                </View>
                {isSelected && (
                    <MaterialIcons name="check-circle" size={24} color={currentColors.primary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={currentColors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: currentColors.text }]}>Impostazioni</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Appearance Section */}
                    <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>ASPETTO</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
                        <ThemeOption mode="system" label="Sistema" icon="settings-system-daydream" />
                        <ThemeOption mode="light" label="Chiaro" icon="wb-sunny" />
                        {/* Last item, maybe remove border bottom? kept simple for now */}
                        <ThemeOption mode="dark" label="Scuro" icon="nightlight-round" />
                    </View>

                    {/* Data Section */}
                    <Text style={[styles.sectionTitle, { color: currentColors.primary, marginTop: 24 }]}>DATI</Text>
                    <View style={[styles.sectionContainer, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
                        <View style={[styles.optionRow, { borderBottomColor: currentColors.divider, borderBottomWidth: 0 }]}>
                            <View style={styles.optionLeft}>
                                <MaterialIcons name="storage" size={24} color={currentColors.text} />
                                <View>
                                    <Text style={[styles.optionLabel, { color: currentColors.text }]}>Abilita dati di esempio (Mock)</Text>
                                    <Text style={{ fontSize: 11, color: currentColors.textSecondary, marginTop: 2 }}>Usa dati fittizi per test e demo</Text>
                                </View>
                            </View>
                            <Switch
                                value={mockDataEnabled}
                                onValueChange={setMockDataEnabled}
                                trackColor={{ false: '#767577', true: currentColors.primary }}
                                thumbColor={'#f4f3f4'}
                            />
                        </View>
                    </View>

                    {/* App Info */}
                    <View style={styles.versionContainer}>
                        <Text style={[styles.versionText, { color: currentColors.textSecondary }]}>MyFootballZone v1.0.0</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    content: { padding: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
    sectionContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
    optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    optionLabel: { fontSize: 16, fontWeight: '500' },
    versionContainer: { marginTop: 40, alignItems: 'center' },
    versionText: { fontSize: 13 },
});
