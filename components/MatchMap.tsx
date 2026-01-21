import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Reusing colors or passing theme as prop is better, but for isolation let's accept theme colors
type MatchMapProps = {
    location: {
        name: string;
        address: string;
        lat: number;
        lng: number;
    };
    theme: any; // Using any for simplicity in this extraction, effectively Colors[scheme]
    openNavigation: () => void;
};

export default function MatchMap({ location, theme, openNavigation }: MatchMapProps) {
    const scheme = useColorScheme() ?? 'light';

    return (
        <View style={[styles.card, { padding: 0, overflow: 'hidden', backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.iconBox, { backgroundColor: theme.iconBox }]}>
                    <Ionicons name="location" size={24} color={theme.primary} />
                </View>
                <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{location.name}</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{location.address}</Text>
                </View>
            </View>

            <View style={{ height: 160, position: 'relative' }}>
                <MapView
                    style={{ flex: 1 }}
                    region={{
                        latitude: Number(location.lat),
                        longitude: Number(location.lng),
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    userInterfaceStyle={scheme}
                >
                    <Marker
                        coordinate={{ latitude: Number(location.lat), longitude: Number(location.lng) }}
                        pinColor={theme.primary}
                    />
                </MapView>
            </View>

            <View style={{ padding: 16 }}>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={openNavigation}>
                    <Ionicons name="navigate" size={18} color="#FFF" />
                    <Text style={styles.primaryButtonText}>APRI NAVIGATORE</Text>
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

    mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
    pulseDisk: { width: 32, height: 32, borderRadius: 16, borderWidth: 4, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

    primaryButton: { flex: 1, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    primaryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    secondaryButton: { width: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
