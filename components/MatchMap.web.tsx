import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Web implementation - No MapView
type MatchMapProps = {
    location: {
        name: string;
        address: string;
        lat: number;
        lng: number;
        city?: string;
    };
    theme: any;
    openNavigation: () => void;
};

export default function MatchMap({ location, theme, openNavigation }: MatchMapProps) {
    return (
        <View style={[styles.card, { padding: 0, overflow: 'hidden', backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.iconBox, { backgroundColor: theme.iconBox }]}>
                    <Ionicons name="location" size={24} color={theme.primary} />
                </View>
                <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{location.name}</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{location.city || location.address}</Text>
                </View>
            </View>

            {/* Static Placeholder for Web */}
            <View style={{ height: 160, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.iconBox }}>
                <Ionicons name="map" size={48} color={theme.primary} style={{ opacity: 0.5 }} />
                <Text style={{ marginTop: 8, color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                    Mappa interattiva non disponibile su Web
                </Text>
            </View>

            <View style={{ padding: 16, flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={openNavigation}>
                    <Ionicons name="navigate" size={18} color="#FFF" />
                    <Text style={styles.primaryButtonText}>APRI NAVIGATORE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.secondaryButton }]}>
                    <Ionicons name="call" size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, borderWidth: 1 },
    cardTitle: { fontSize: 14, fontWeight: '700' },
    cardSubtitle: { fontSize: 12, marginTop: 2 },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    primaryButton: { flex: 1, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    primaryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    secondaryButton: { width: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
