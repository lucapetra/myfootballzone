import { useMockMatch } from '@/context/MockMatchContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { deleteMatch, fetchLastCreatedEvent, fetchMatchById, MatchData, upsertMatch } from '@/services/matchService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Color Palette
const Colors = {
    light: {
        background: '#f8fafc',
        headerBackground: 'rgba(248,250,252,0.8)',
        card: '#FFFFFF',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: '#22c55e',
        border: '#e2e8f0',
        iconBox: 'rgba(34, 197, 94, 0.1)',
        statBox: '#f8fafc',
        secondaryButton: '#f1f5f9'
    },
    dark: {
        background: '#020403',
        headerBackground: 'rgba(2, 4, 3, 0.8)',
        card: '#121212',
        text: '#F8faf9',
        textSecondary: '#94a3b8',
        primary: '#4ADE80',
        border: '#333333',
        iconBox: 'rgba(74, 222, 128, 0.1)',
        statBox: '#1E1E1E',
        secondaryButton: '#1E1E1E'
    }
};

export default function ManageMatch() {
    const { activeTheme } = useTheme();
    const theme = Colors[activeTheme];
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = params.mode === 'edit';
    const { mockDataEnabled } = useSettings();
    const { mockMatch, updateMockMatch } = useMockMatch();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [eventType, setEventType] = useState<'match' | 'training' | 'event' | 'trial'>('match');
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');
    const [startDateTime, setStartDateTime] = useState(new Date());
    const [locationText, setLocationText] = useState('');
    const [locationShortText, setLocationShortText] = useState(''); // For DB name (Street + Number)
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLng, setLocationLng] = useState<number | null>(null);
    const [locationAddress, setLocationAddress] = useState<string | null>(null); // For DB address (Full)
    const [locationCity, setLocationCity] = useState<string>(''); // For DB city
    const [pitchType, setPitchType] = useState<'grass' | 'synthetic'>('grass'); // Default to grass
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

    // Logos
    const [homeLogo, setHomeLogo] = useState<string | null | number>(null);
    const [awayLogo, setAwayLogo] = useState<string | null | number>(null);

    const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
    const [originalEventType, setOriginalEventType] = useState<'match' | 'training' | 'event' | 'trial' | null>(null);

    // Keyboard Animation
    const keyboardHeight = useSharedValue(0);

    // Listen to keyboard events
    React.useEffect(() => {
        const showSubscription = Platform.OS !== 'web' && require('react-native').Keyboard.addListener(
            'keyboardWillShow',
            (e: any) => {
                keyboardHeight.value = withTiming(e.endCoordinates.height, { duration: 250 });
            }
        );
        const hideSubscription = Platform.OS !== 'web' && require('react-native').Keyboard.addListener(
            'keyboardWillHide',
            () => {
                keyboardHeight.value = withTiming(0, { duration: 250 });
            }
        );

        return () => {
            showSubscription && showSubscription.remove();
            hideSubscription && hideSubscription.remove();
        };
    }, []);

    const keyboardStyle = useAnimatedStyle(() => ({
        paddingBottom: keyboardHeight.value,
    }));

    // Debounce timer for location search
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isEditMode) {
            loadMatchData();
        }
    }, [isEditMode, params.id]);

    const loadMatchData = async () => {
        try {
            setLoading(true);
            let data: MatchData | null = null;

            if (params.id) {
                // Load specific event
                data = await fetchMatchById(params.id as string);
                setCurrentMatchId(params.id as string);
            } else {
                // Fallback: Load last created (Legacy "Edit Mode" existing behavior)
                data = mockDataEnabled ? mockMatch : await fetchLastCreatedEvent();
                if (data?.id) setCurrentMatchId(data.id);
            }

            if (data) {
                const loadedEventType = data.event_type || 'match';
                setEventType(loadedEventType);
                setOriginalEventType(loadedEventType);
                // Clear generic "Prima Squadra" names so inputs appear empty (placeholder visible)
                setHomeTeam(data.home === 'Prima Squadra' ? '' : (data.home || ''));
                setAwayTeam(data.away === 'Prima Squadra' ? '' : (data.away || ''));
                setStartDateTime(new Date(data.isoDate));
                // Load Full Address into Input (User wants to see full address in edit)
                // If data.location.address is present, use it. Otherwise fallback to name.
                setLocationText(data.location?.address || data.location?.name || '');
                setLocationShortText(data.location?.name || '');

                setLocationLat(data.location?.lat || null);
                setLocationLng(data.location?.lng || null);
                setLocationAddress(data.location?.address || null);
                setHomeLogo(data.home_team_logo || null);
                setAwayLogo(data.away_team_logo || null);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Errore', 'Impossibile caricare i dati');
        } finally {
            setLoading(false);
        }
    };

    // Search location using Nominatim (OpenStreetMap) - FREE!
    const searchLocation = async (query: string) => {
        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length < 3) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            return;
        }

        // Debounce: wait 1 second after user stops typing
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                // Nominatim requires a User-Agent header
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                    `q=${encodeURIComponent(query)}&` +
                    `format=json&` +
                    `addressdetails=1&` +
                    `limit=5&` +
                    `countrycodes=it&` +
                    `accept-language=it`,
                    {
                        headers: {
                            'User-Agent': 'MyFootballZone/1.0 (petraluca30@gmail.com)', // More specific User-Agent might be required
                            'Accept': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                // Check if response is valid JSON
                try {
                    const data = JSON.parse(text);
                    setLocationSuggestions(data);
                    setShowLocationSuggestions(data.length > 0);
                } catch (e) {
                    console.error('Invalid JSON response:', text.substring(0, 100)); // Log first 100 chars
                    setLocationSuggestions([]);
                    setShowLocationSuggestions(false);
                }
            } catch (error) {
                console.error('Error searching location:', error);
                setLocationSuggestions([]);
                setShowLocationSuggestions(false);
            }
        }, 1000);
    };

    const selectLocation = (location: any) => {
        const address = location.address || {};
        // Calculate Short Address (Street + Number)
        const streetName = address.road || address.pedestrian || address.hamlet || location.display_name.split(',')[0];
        const houseNumber = address.house_number || '';
        const shortAddress = houseNumber ? `${streetName} ${houseNumber}` : streetName;

        // Visual text in input = Full Address
        setLocationText(location.display_name);

        // Store Short Address for DB 'name'
        setLocationShortText(shortAddress);

        // Coordinates
        setLocationLat(parseFloat(location.lat));
        setLocationLng(parseFloat(location.lon));

        // Store Full Address in state for DB 'address'
        setLocationAddress(location.display_name);

        setShowLocationSuggestions(false);
        Platform.OS !== 'web' && require('react-native').Keyboard.dismiss();
    };

    // Format location for display (street + city only)
    // Format location for display (street + number + city)
    const formatLocationDisplay = (location: any) => {
        const address = location.address || {};
        const parts = [];

        // Add street/road
        if (address.road) parts.push(address.road);
        else if (address.pedestrian) parts.push(address.pedestrian);
        else if (address.hamlet) parts.push(address.hamlet);

        // Add house number if available
        if (address.house_number) parts.push(address.house_number);

        // Add city/town/village
        if (address.city) parts.push(address.city);
        else if (address.town) parts.push(address.town);
        else if (address.village) parts.push(address.village);
        else if (address.municipality) parts.push(address.municipality);

        return parts.length > 0 ? parts.join(', ') : location.display_name;
    };



    // pickImage removed

    const handleSave = async () => {
        try {
            if (eventType === 'match' && (!homeTeam.trim() || !awayTeam.trim())) {
                Alert.alert('Errore', 'Inserisci i nomi delle squadre');
                return;
            }
            if (!locationText.trim()) {
                Alert.alert('Errore', 'Inserisci il luogo');
                return;
            }
            // Enforce location selection
            if (locationLat === null || locationLng === null) {
                Alert.alert('Attenzione', 'Devi selezionare un luogo dai suggerimenti per salvare l\'evento.');
                return;
            }

            if (mockDataEnabled) {
                // Mock Save
                const newDate = startDateTime;
                const dayName = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(newDate).toUpperCase();
                const timeStr = newDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                const updatedMock: MatchData = {
                    event_type: eventType,
                    home: homeTeam,
                    away: awayTeam,
                    date: dayName,
                    isoDate: newDate.toISOString(),
                    time: timeStr,
                    location: {
                        name: locationShortText || locationText,
                        address: locationAddress || '',
                        lat: locationLat || 0,
                        lng: locationLng || 0,
                        city: locationCity,
                        pitchType: pitchType // Pass pitchType
                    },
                    home_team_logo: homeLogo,
                    away_team_logo: awayLogo,
                    weather: { // Keep existing weather or random
                        temp: '18°C',
                        condition: 'Pioggia leggera',
                        cleats: 'SG',
                        cleatsDesc: 'Terreno morbido'
                    },
                    callups: { confirmed: 14, total: 18 }
                };

                updateMockMatch(updatedMock);
                Alert.alert('Successo', 'Evento (Mock) aggiornato!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
                return;
            }

            setSaving(true);

            // Upload logic removed
            let finalHomeLogo: string | null = null;
            let finalAwayLogo: string | null = null;

            await upsertMatch(
                eventType,
                startDateTime,
                locationShortText || locationText, // Use Short name for DB name
                homeTeam,
                awayTeam,
                finalHomeLogo,
                finalAwayLogo,
                locationLat, // Pass lat
                locationLng, // Pass lng
                locationAddress || locationText, // Pass address (full)
                locationCity, // Pass city
                currentMatchId || undefined, // Pass ID for update if exists
                pitchType // Pass pitchType
            );

            Alert.alert('Successo', 'Evento salvato correttamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert('Errore', error.message || 'Errore durante il salvataggio');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Conferma Eliminazione',
            'Sei sicuro di voler eliminare questo evento? Questa azione non è reversibile.',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            if (mockDataEnabled) {
                                // Mock Delete - requires implementation in context or just generic success
                                Alert.alert('Info', 'Cancellazione mock non implementata completamente, ma simulo successo.');
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.replace('/(tabs)');
                                }
                                return;
                            }

                            if (currentMatchId) {
                                await deleteMatch(currentMatchId);
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.replace('/(tabs)');
                                }
                            }
                        } catch (error) {
                            Alert.alert('Errore', 'Impossibile eliminare l\'evento');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(startDateTime.getHours());
            newDate.setMinutes(startDateTime.getMinutes());
            setStartDateTime(newDate);
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            const newDate = new Date(startDateTime);
            newDate.setHours(selectedDate.getHours());
            newDate.setMinutes(selectedDate.getMinutes());
            setStartDateTime(newDate);
        }
    };

    const onAndroidChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
            const newDate = new Date(startDateTime);
            if (datePickerMode === 'date') {
                newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            } else {
                newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
            }
            setStartDateTime(newDate);
        }
    };

    const showAndroidPicker = (mode: 'date' | 'time') => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    // Helper to format for Android buttons
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <Stack.Screen options={{
                headerShown: false
            }} />

            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {isEditMode ? 'Modifica Evento' : 'Nuovo Evento'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Event Type Selector */}
                    <View style={[styles.selectorContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                eventType === 'match' && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setEventType('match')}
                        >
                            <Text style={[
                                styles.selectorText,
                                eventType === 'match' ? { color: '#fff' } : { color: theme.textSecondary }
                            ]}>Partita</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                eventType === 'training' && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setEventType('training')}
                        >
                            <Text style={[
                                styles.selectorText,
                                eventType === 'training' ? { color: '#fff' } : { color: theme.textSecondary }
                            ]}>Allenamento</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Team Inputs (Only for Match) */}
                    {eventType === 'match' && (
                        <View style={styles.teamsSection}>
                            <View style={styles.teamInputContainer}>
                                {/* Logo Upload Removed */}
                                <TextInput
                                    placeholder="Squadra in casa"
                                    placeholderTextColor={theme.textSecondary}
                                    style={[styles.input, { color: theme.text, borderColor: theme.border, flex: 1 }]}
                                    value={homeTeam}
                                    onChangeText={setHomeTeam}
                                />
                            </View>

                            <Text style={[styles.vsText, { color: theme.textSecondary }]}>VS</Text>

                            <View style={styles.teamInputContainer}>
                                {/* Logo Upload Removed */}
                                <TextInput
                                    placeholder="Squadra ospite"
                                    placeholderTextColor={theme.textSecondary}
                                    style={[styles.input, { color: theme.text, borderColor: theme.border, flex: 1 }]}
                                    value={awayTeam}
                                    onChangeText={setAwayTeam}
                                />
                            </View>
                        </View>
                    )}

                    {/* Date & Time */}
                    <View style={styles.dateTimeSection}>
                        {Platform.OS === 'android' ? (
                            <>
                                <View style={styles.dateTimeRow}>
                                    <Text style={[styles.label, { color: theme.text }]}>Data</Text>
                                    <TouchableOpacity
                                        onPress={() => showAndroidPicker('date')}
                                        style={{ padding: 10, backgroundColor: theme.card, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
                                    >
                                        <Text style={{ color: theme.text }}>{formatDate(startDateTime)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateTimeRow}>
                                    <Text style={[styles.label, { color: theme.text }]}>Ora</Text>
                                    <TouchableOpacity
                                        onPress={() => showAndroidPicker('time')}
                                        style={{ padding: 10, backgroundColor: theme.card, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
                                    >
                                        <Text style={{ color: theme.text }}>{formatTime(startDateTime)}</Text>
                                    </TouchableOpacity>
                                </View>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={startDateTime}
                                        minimumDate={new Date()}
                                        mode={datePickerMode}
                                        display="default"
                                        onChange={onAndroidChange}
                                        themeVariant={activeTheme}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <View style={styles.dateTimeRow}>
                                    <Text style={[styles.label, { color: theme.text }]}>Data</Text>
                                    <DateTimePicker
                                        value={startDateTime}
                                        minimumDate={new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                        themeVariant={activeTheme}
                                    />
                                </View>
                                <View style={styles.dateTimeRow}>
                                    <Text style={[styles.label, { color: theme.text }]}>Ora</Text>
                                    <DateTimePicker
                                        value={startDateTime}
                                        mode="time"
                                        display="default"
                                        onChange={onTimeChange}
                                        themeVariant={activeTheme}
                                    />
                                </View>
                            </>
                        )}
                    </View>

                    {/* Location with Nominatim (Free!) */}
                    <View style={[styles.section, { zIndex: 100 }]}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: 8 }]}>Luogo</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Ionicons name="location-outline" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                            <TextInput
                                placeholder="Cerca luogo..."
                                placeholderTextColor={theme.textSecondary}
                                style={[styles.inputText, { color: theme.text }]}
                                value={locationText}
                                onChangeText={(text) => {
                                    setLocationText(text);
                                    setLocationLat(null);
                                    setLocationLng(null);
                                    setLocationAddress(null);
                                    searchLocation(text);
                                }}
                            />
                        </View>
                        {showLocationSuggestions && locationSuggestions.length > 0 && (
                            <ScrollView
                                style={[styles.suggestionsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                            >
                                {locationSuggestions.map((loc, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                                        onPress={() => selectLocation(loc)}
                                    >
                                        <Text style={[styles.suggestionName, { color: theme.text }]}>{formatLocationDisplay(loc)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>SALVA</Text>
                        )}
                    </TouchableOpacity>

                    {isEditMode && currentMatchId && originalEventType === eventType && (
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                {
                                    backgroundColor: theme.card,
                                    marginTop: 24,
                                    borderWidth: 0,
                                    shadowOpacity: 0.1, // Softer shadow
                                    elevation: 1
                                }
                            ]}
                            onPress={handleDelete}
                            disabled={loading || saving}
                        >
                            <Text style={[styles.saveButtonText, { color: '#FF3B30' }]}>ELIMINA</Text>
                        </TouchableOpacity>
                    )}

                </ScrollView >
            </View >
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    selectorContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        marginBottom: 24,
    },
    selectorButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    selectorText: {
        fontWeight: '600',
        fontSize: 14,
    },
    teamsSection: {
        marginBottom: 24,
    },
    teamInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    logoPlaceholder: {
        width: 48,
        height: 48,
    },
    logoPreview: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    logoCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    vsText: {
        alignSelf: 'center',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
        opacity: 0.5,
    },
    dateTimeSection: {
        marginBottom: 24,
        gap: 16,
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    section: {
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    suggestionsContainer: {
        marginTop: 4,
        borderWidth: 1,
        borderRadius: 8,
        maxHeight: 150,
        overflow: 'hidden',
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
    suggestionName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    suggestionAddress: {
        fontSize: 12,
        marginTop: 2,
    },
});
