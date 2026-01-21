import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { fetchNextMatch, MatchData } from '@/services/matchService';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeLoader from '../../components/HomeLoader';
import MatchMap from '../../components/MatchMap';
import NextMatchCard from '../../components/NextMatchCard';
import { supabase } from '../../lib/supabase';

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

export default function HomeScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const theme = Colors[activeTheme];

  const { mockDataEnabled } = useSettings();

  // Mock Data
  const mockMatch: MatchData = {
    event_type: 'match',
    home: 'A.C. MILANESE',
    away: 'ASD SAN SIRO',
    date: 'Domenica 22 Ottobre',
    isoDate: '2026-10-22T15:00:00',
    time: '20:45',
    location: {
      name: 'Stadio San Siro',
      address: 'Piazzale Angelo Moratti, Milano',
      lat: 45.4781,
      lng: 9.1240
    },
    home_team_logo: null,
    away_team_logo: null,
    weather: {
      temp: '18°C',
      condition: 'Pioggia leggera',
      cleats: 'SG',
      cleatsDesc: 'Terreno morbido'
    },
    callups: {
      confirmed: 14,
      total: 18
    }
  };

  // Real Next Match Fallback
  const realNextMatch: MatchData = {
    event_type: 'match',
    home: 'San Maurizio',
    away: 'Mathi',
    date: '25 GEN',
    isoDate: '2026-01-25T15:00:00',
    time: '15:00',
    location: {
      name: 'Campo Sportivo San Maurizio',
      address: 'Via Ceretta Inferiore, San Maurizio Canavese',
      lat: 45.21,
      lng: 7.63
    },
    home_team_logo: null,
    away_team_logo: null,
    weather: {
      temp: '6°C',
      condition: 'Soleggiato',
      cleats: 'FG',
      cleatsDesc: 'Terreno buono'
    },
    callups: { confirmed: 0, total: 20 }
  };

  // State for dynamic match data
  const [nextMatch, setNextMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      /*
       * Reload data every time the screen is focused.
       * This ensures changes from "Manage Match" are reflected immediately.
       */
      const loadData = async () => {
        if (loading) {
          // Initial Brand Load (Min 1.5s)
          const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));
          try {
            const results = await Promise.all([
              mockDataEnabled ? Promise.resolve(mockMatch) : fetchNextMatch(),
              minLoadTime
            ]);
            const match = results[0];

            if (match) {
              setNextMatch(match);
            } else {
              setNextMatch(realNextMatch);
            }
          } catch (e) {
            console.log("Error fetching next match:", e);
            setNextMatch(realNextMatch);
          } finally {
            setLoading(false);
          }
        } else {
          // Silent Refresh (Background)
          if (!mockDataEnabled) {
            try {
              const match = await fetchNextMatch();
              if (match) setNextMatch(match);
            } catch (e) {
              console.log("Silent refresh error:", e);
            }
          } else {
            setNextMatch(mockMatch);
          }
        }
      };

      loadData();
    }, [mockDataEnabled, loading])
  );

  const calculateTimeLeft = () => {
    if (!nextMatch?.isoDate) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' };
    }

    const difference = +new Date(nextMatch.isoDate) - +new Date();
    let timeLeft = { days: '00', hours: '00', minutes: '00', seconds: '00' };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
        seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  React.useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [nextMatch?.isoDate]);

  // Pre-fetch team images
  React.useEffect(() => {
    const prefetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('people')
          .select('photo_url')
          .not('photo_url', 'is', null);

        if (error) throw error;

        if (data && data.length > 0) {
          const urls = data.map(item => item.photo_url).filter((url): url is string => !!url);
          await Image.prefetch(urls);
        }
      } catch (err) {
        console.error('Error prefetching team images:', err);
      }
    };
    prefetchImages();
  }, []);

  const openNavigation = () => {
    if (!nextMatch) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${nextMatch.location.lat},${nextMatch.location.lng}`;
    const label = nextMatch.location.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    if (url) Linking.openURL(url);
  };

  const addToCalendar = async () => {
    if (!nextMatch) return;
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso negato', 'Abilita i permessi del calendario nelle impostazioni per salvare l\'evento.');
        return;
      }

      const defaultCalendarSource = Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: 'MyFootballZone', type: Calendar.CalendarType.LOCAL, id: undefined };

      const newCalendarID = await createCalendar(defaultCalendarSource, theme.primary);

      const startDate = new Date(nextMatch.isoDate);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours

      await Calendar.createEventAsync(newCalendarID, {
        title: `${nextMatch.home} vs ${nextMatch.away}`,
        startDate,
        endDate,
        timeZone: 'Europe/Rome',
        location: `${nextMatch.location.name}, ${nextMatch.location.address}`,
        notes: 'Partita di campionato - MyFootballZone',
      });

      Alert.alert('Successo', 'Partita aggiunta al calendario!');
    } catch (e) {
      console.log(e);
      Alert.alert('Errore', 'Impossibile salvare l\'evento nel calendario.');
    }
  };

  if (loading) {
    return <HomeLoader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconContainer, { backgroundColor: theme.iconBox }]}>
              <Ionicons name="football" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>MyFootballZone</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerIconContainer, { backgroundColor: theme.secondaryButton }]}
            onPress={() => router.push('/matches/manage?mode=edit')}
          >
            <Ionicons name="pencil" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {nextMatch ? (
            <>
              {/* Match Card */}
              <NextMatchCard
                homeTeam={nextMatch.home || ''}
                awayTeam={nextMatch.away || ''}
                homeLogo={nextMatch.home_team_logo}
                awayLogo={nextMatch.away_team_logo}
                eventType={nextMatch.event_type}
                theme={theme}
              />

              {/* Date Card */}
              <TouchableOpacity onPress={addToCalendar} activeOpacity={0.7}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconBox, { backgroundColor: theme.iconBox }]}>
                      <Ionicons name="calendar" size={24} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{nextMatch.date}</Text>
                      <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Inizio alle {nextMatch.time}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: theme.iconBox, borderColor: theme.primary }]}>
                      <Text style={[styles.badgeText, { color: theme.primary }]}>SALVA</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Map Section */}
              <MatchMap
                location={nextMatch.location}
                theme={theme}
                openNavigation={openNavigation}
              />

              {/* Weather & Cleats Grid */}
              <View style={styles.gridRow}>
                <View style={[styles.card, styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={styles.statLabel}>METEO PREVISTO</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
                    <Ionicons name="rainy" size={36} color={theme.primary} />
                    <View>
                      <Text style={[styles.weatherTemp, { color: theme.text }]}>{nextMatch.weather.temp}</Text>
                      <Text style={styles.weatherDesc}>{nextMatch.weather.condition}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.card, styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.statLabel, { color: theme.primary }]}>TACCHETTI CONSIGLIATI</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
                    <Ionicons name="footsteps" size={36} color={theme.primary} />
                    <View>
                      <Text style={[styles.weatherTemp, { color: theme.primary }]}>{nextMatch.weather.cleats}</Text>
                      <Text style={styles.weatherDesc}>{nextMatch.weather.cleatsDesc}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Callups */}
              <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 100, backgroundColor: theme.card, borderColor: theme.border }]}>
                <View>
                  <Text style={[styles.statLabel, { color: theme.primary, marginBottom: 4 }]}>CONVOCAZIONI</Text>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    <Text style={{ color: theme.primary }}>{nextMatch.callups.confirmed}</Text> / {nextMatch.callups.total} <Text style={{ color: theme.textSecondary, fontWeight: '500' }}>Giocatori</Text>
                  </Text>
                </View>

                <View style={styles.avatarStack}>
                  {[1, 2, 3].map((_, i) => (
                    <View key={i} style={[styles.avatar, { marginLeft: i > 0 ? -8 : 0, backgroundColor: `rgba(34, 197, 94, ${0.4 + i * 0.2})` }]} />
                  ))}
                  <View style={[styles.avatar, { marginLeft: -8, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={styles.avatarMore}>+11</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, alignItems: 'center', paddingVertical: 40 }]}>
              <View style={[styles.iconBox, { backgroundColor: theme.secondaryButton, width: 64, height: 64, borderRadius: 32, marginBottom: 16 }]}>
                <Ionicons name="calendar-outline" size={32} color={theme.textSecondary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.text, fontSize: 18, marginBottom: 8 }]}>Nessuna partita in programma</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary, textAlign: 'center', paddingHorizontal: 40 }]}>
                Non hai ancora una squadra o non ci sono partite pianificate per i prossimi giorni.
              </Text>
              <TouchableOpacity
                style={{ marginTop: 24, backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
                onPress={() => router.push('/team')}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Cerca squadra</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </SafeAreaView >
    </View >
  );
}

async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

async function createCalendar(defaultCalendarSource: any, primaryColor: string) {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existingCalendar = calendars.find(c => c.title === 'MyFootballZone');
  if (existingCalendar) return existingCalendar.id;

  const newCalendarID = await Calendar.createCalendarAsync({
    title: 'MyFootballZone',
    color: primaryColor,
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: 'internal_event_calendar',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return newCalendarID;
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },


  scrollContent: { padding: 16, gap: 16 },

  card: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, borderWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },

  matchCard: { borderRadius: 24, padding: 24, shadowColor: '#22c55e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  matchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  teamContainer: { alignItems: 'center', gap: 8, width: '30%' },
  teamLogo: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  teamName: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.5 },
  vsContainer: { alignItems: 'center' },
  vsText: { color: '#FFF', fontSize: 16, fontWeight: '900', fontStyle: 'italic', opacity: 0.8 },

  countdownRow: { flexDirection: 'row', gap: 8 },
  countdownItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 12, alignItems: 'center' },
  countdownValue: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  countdownLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '700', marginTop: 2 },

  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: -0.5 },
  leagueBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  leagueBadgeText: { fontSize: 10, fontWeight: '700' },

  gridRow: { flexDirection: 'row', gap: 16 },
  gridItem: { flex: 1 },
  statBox: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  statValuePrimary: { fontSize: 24, fontWeight: '900' },
  statValue: { fontSize: 24, fontWeight: '900' },

  subLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 },
  formRow: { flexDirection: 'row', gap: 8 },
  formCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  formText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  bgGreen: { backgroundColor: '#22c55e' },
  bgPrimary: { backgroundColor: '#16a34a' },
  bgGrey: { backgroundColor: '#64748b' },
  bgRed: { backgroundColor: '#ef4444' },

  divider: { height: 1, marginVertical: 16 },
  h2hRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h2hLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  h2hValue: { fontSize: 12, fontWeight: '700' },

  weatherTemp: { fontSize: 20, fontWeight: '900' },
  weatherDesc: { fontSize: 10, color: '#64748b' },

  avatarStack: { flexDirection: 'row' },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#FFF' },
  avatarMore: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});
