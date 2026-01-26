import { CalendarPicker } from '@/components/CalendarPicker';
import { useTheme } from '@/context/ThemeContext';
import { deleteMatch, fetchEvents, MatchData } from '@/services/matchService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color definitions matching the app theme structure
const Colors = {
    light: {
        background: '#f8fafc',
        card: '#FFFFFF',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: '#22c55e',
        border: '#e2e8f0',
        backgroundStriped: '#f1f5f9',
    },
    dark: {
        background: '#020403',
        card: '#121212',
        text: '#F8faf9',
        textSecondary: '#94a3b8',
        primary: '#4ADE80',
        border: '#333333',
        backgroundStriped: '#0a0a0a',
    }
};
const { width: SCREEN_WIDTH } = Dimensions.get('window');
// UX Improvement: "Peek" effect. Card width is 85% of screen.
// This leaves 15% space. If centered, 7.5% visible on left/right.
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const SPACING = 12; // Gap between cards
const EVENT_SECTION_HEIGHT = 160; // Fixed height for consistency
const CARD_HEIGHT = 130; // Fixed card height inside the section

export default function CalendarScreen() {
    const { activeTheme } = useTheme();
    const theme = Colors[activeTheme];
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Default to showing all events
    const [events, setEvents] = useState<MatchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const HandleEventPress = (event: MatchData) => {
        Alert.alert(
            'Gestisci Evento',
            'Cosa vuoi fare con questo evento?',
            [
                {
                    text: 'Annulla',
                    style: 'cancel'
                },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: () => confirmDelete(event)
                },
                {
                    text: 'Modifica',
                    onPress: () => {
                        if (event.id) {
                            router.push({ pathname: '/matches/manage', params: { mode: 'edit', id: event.id, from: 'calendar' } });
                        } else {
                            Alert.alert('Errore', 'ID evento mancante');
                        }
                    }
                }
            ]
        );
    };

    const confirmDelete = (event: MatchData) => {
        Alert.alert(
            'Conferma eliminazione',
            'Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: async () => {
                        if (!event.id) return;
                        try {
                            // Optimistic Update: Remove locally first
                            setEvents(prev => prev.filter(e => e.id !== event.id));

                            // Delete from server
                            await deleteMatch(event.id);

                            // Silent refresh to ensure sync
                            loadEvents(false);
                        } catch (error) {
                            Alert.alert('Errore', 'Impossibile eliminare l\'evento.');
                            loadEvents(false); // Revert on error (fetch true state)
                        } finally {
                            // No loading state needed here
                        }
                    }
                }
            ]
        );
    };

    const loadEvents = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true); // Reset state to loading on focus only if requested
            // Fetch all upcoming/recent events (e.g. from 2 weeks ago to 2 months ahead)
            // or just fetch ALL and filter locally for smoother UX on small datasets
            // For now, let's fetch all future and recent past (last 30 days)
            const start = new Date();
            start.setDate(start.getDate() - 30);

            const fetchedEvents = await fetchEvents(start);
            setEvents(fetchedEvents);
        } catch (error) {
            console.error(error);
            Alert.alert('Errore', 'Impossibile caricare gli eventi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadEvents();
    };

    const handleDateSelect = (date: Date) => {
        // If clicking same date, maybe toggle off? Or keep selected.
        // User example logic: toggle off if same.
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
    };

    const eventDates = events.map(e => new Date(e.isoDate));

    const filteredEvents = selectedDate
        ? events.filter(e => new Date(e.isoDate).toDateString() === selectedDate.toDateString())
        : events;

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'training': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' }; // Blue
            case 'match': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' }; // Red
            case 'event': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.2)' }; // Purple
            case 'trial': return { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', border: 'rgba(249, 115, 22, 0.2)' }; // Orange
            default: return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b', border: 'rgba(100, 116, 139, 0.2)' };
        }
    };

    const renderEventCard = ({ item }: { item: MatchData }) => {
        const style = getEventTypeColor(item.event_type);
        const date = new Date(item.isoDate);
        const day = date.getDate();
        const month = date.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();

        return (
            <TouchableOpacity
                style={[styles.eventCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => HandleEventPress(item)}
                activeOpacity={0.7}
            >
                {/* Date Column */}
                <View style={[styles.dateColumn, { borderRightColor: theme.border }]}>
                    <Text style={[styles.dateDay, { color: theme.primary }]}>{day}</Text>
                    <Text style={[styles.dateMonth, { color: theme.textSecondary }]}>{month}</Text>
                </View>

                {/* Content */}
                <View style={styles.eventContent}>
                    <View style={styles.headerRow}>
                        <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
                            <Text style={[styles.badgeText, { color: style.text }]}>
                                {item.event_type === 'match' ? 'GARA' :
                                    item.event_type === 'training' ? 'ALLENAMENTO' :
                                        item.event_type === 'trial' ? 'PROVA' : 'EVENTO'}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.eventTitle, { color: theme.text }]}>
                        {item.event_type === 'match'
                            ? `${item.home} vs ${item.away}`
                            : (item.description || (item.event_type === 'training' ? 'Allenamento Squadra' : 'Evento'))}
                    </Text>

                    <View style={styles.detailsColumn}>
                        <View style={styles.detailItem}>
                            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                            <Text style={[styles.detailText, { color: theme.textSecondary }]}>{item.time}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                            <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
                                {item.location.name}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background, flex: 1 }}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Calendario</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearButton}>
                                <Text style={[styles.clearText, { color: theme.primary }]}>Tutti</Text>
                                <Ionicons name="close-circle" size={16} color={theme.primary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => router.push({ pathname: '/matches/manage', params: { from: 'calendar' } })} style={{ padding: 4 }}>
                            <Ionicons name="add-circle" size={28} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>


                <View style={{ flex: 1, paddingBottom: 20 }}>
                    <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                        <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0 }]}>
                            Prossimi appuntamenti
                        </Text>
                    </View>

                    <View style={{ height: EVENT_SECTION_HEIGHT }}>
                        <FlatList
                            horizontal
                            data={filteredEvents}
                            renderItem={renderEventCard}
                            keyExtractor={(item) => item.id || Math.random().toString()}
                            contentContainerStyle={styles.horizontalListContent}
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={CARD_WIDTH + SPACING}
                            decelerationRate="fast"
                            snapToAlignment="center" // Centers the card
                            ListEmptyComponent={
                                <View style={[styles.emptyContainer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
                                    <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                        {selectedDate ? 'Nessun evento' : 'Nessun evento'}
                                    </Text>
                                </View>
                            }
                        />
                    </View>

                    <View style={styles.calendarContainer}>
                        <CalendarPicker
                            selectedDate={selectedDate || new Date()}
                            onDateSelect={handleDateSelect}
                            eventDates={eventDates}
                        />
                    </View>
                </View>
            </SafeAreaView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    clearButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    clearText: { fontSize: 14, fontWeight: '600' },

    listContent: { paddingBottom: 40 },
    horizontalListContent: {
        paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
        paddingBottom: 30, // Increased bottom space
    },
    calendarContainer: { marginTop: 'auto', marginBottom: 20 }, // Pushed to bottom
    sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginTop: 16, marginBottom: 16, textTransform: 'capitalize' }, // Increased vertical spacing

    eventCard: {
        flexDirection: 'row',
        width: CARD_WIDTH,
        height: CARD_HEIGHT, // Enforce fixed height
        marginRight: SPACING,
        borderRadius: 24, // Increased radius for softer look
        borderWidth: 1,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 }, // Increased shadow
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    dateColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
        borderRightWidth: 1,
        minWidth: 50,
    },
    dateDay: { fontSize: 24, fontWeight: '800' },
    dateMonth: { fontSize: 12, fontWeight: '700' },

    eventContent: { flex: 1, paddingLeft: 16 },
    headerRow: { flexDirection: 'row', marginBottom: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '700' },

    eventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },

    detailsRow: { flexDirection: 'row', gap: 12 },
    detailsColumn: { flexDirection: 'column', gap: 6 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 12, fontWeight: '500' },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        height: 130, // Fixed height to match event cards
        borderWidth: 1, // Optional: visual placeholder look? Or just invisible box. 
        // Let's keep it transparent but same size.
        // Actually, user said "same space", so maybe visual consistency helps.
        // But borders on empty state might look weird. Let's just fix height.
        borderColor: 'transparent',
    },
    emptyText: { fontSize: 16, fontWeight: '500' }
});
