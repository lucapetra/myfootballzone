import Avatar from '@/components/Avatar';
import Skeleton from '@/components/Skeleton';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// Helper Types
type Person = {
    id: string;
    name: string;
    role: string;
    image: string;
    label?: string;
    category?: string;
    number?: number;
    isCaptain?: boolean;
    status?: 'active' | 'inactive';
};

type TabType = 'staff' | 'players';

// Color Palette
const Colors = {
    light: {
        background: '#f8fafc',
        headerBackground: 'rgba(248,250,252,0.8)',
        card: '#FFFFFF',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: '#22c55e',
        searchBackground: '#E9F5EF',
        tabBackground: 'rgba(226, 232, 240, 0.5)',
        tabActive: '#FFFFFF',
        border: '#e2e8f0',
        iconBox: 'rgba(34, 197, 94, 0.1)'
    },
    dark: {
        background: '#020403',
        headerBackground: 'rgba(2, 4, 3, 0.8)',
        card: '#121212',
        text: '#F8faf9',
        textSecondary: '#94a3b8',
        primary: '#4ADE80',
        searchBackground: '#1E1E1E',
        tabBackground: 'rgba(255, 255, 255, 0.1)',
        tabActive: '#2C2C2C',
        border: '#333333',
        iconBox: 'rgba(74, 222, 128, 0.1)'
    }
};

export default function TeamScreen() {
    const { activeTheme } = useTheme();
    const { mockDataEnabled } = useSettings();
    const theme = Colors[activeTheme];
    const [searchQuery, setSearchQuery] = useState('');
    const [staffList, setStaffList] = useState<Person[]>([]);
    const [playerList, setPlayerList] = useState<Person[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('players');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamData();
    }, [mockDataEnabled]);

    const fetchTeamData = async () => {
        try {
            setLoading(true);

            if (mockDataEnabled) {
                // MOCK DATA - Simplified: Only Coach and Players
                const mockStaff = [
                    { id: '3', name: 'Carlo Bianchi', role: 'Allenatore', label: 'MISTER', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7' }
                ];
                const mockPlayers: Person[] = [
                    { id: '11', name: 'Mattia Perin', role: 'Portiere', category: 'Portieri', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', number: 1, isCaptain: false, status: 'active' },
                    { id: '12', name: 'Leonardo Bonucci', role: 'Difensore Centrale', category: 'Difensori', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', number: 19, isCaptain: true, status: 'active' },
                    { id: '13', name: 'Sandro Tonali', role: 'Centrocampista', category: 'Centrocampisti', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', number: 8, isCaptain: false, status: 'active' },
                    { id: '14', name: 'Rafael Leao', role: 'Attaccante', category: 'Attaccanti', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', number: 10, isCaptain: false, status: 'active' }
                ];
                // Sort players alphabetically
                mockPlayers.sort((a, b) => a.name.localeCompare(b.name));

                setStaffList(mockStaff);
                setPlayerList(mockPlayers);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('memberships')
                .select(`
          id,
          role,
          shirt_number,
          people (
            first_name,
            last_name,
            role_primary,
            photo_url
          )
        `);

            if (error) {
                console.error('Error fetching team data:', error);
                // In case of error, just show empty or handle UI
                return;
            }

            const staff: Person[] = [];
            const players: Person[] = [];

            data?.forEach((membership: any) => {
                const person = membership.people;
                if (!person) return;

                const fullName = `${person.first_name} ${person.last_name}`;
                const photo = person.photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop';

                if (membership.role === 'player') {
                    players.push({
                        id: membership.id,
                        name: fullName,
                        role: person.role_primary || 'Giocatore',
                        category: mapRoleToCategory(person.role_primary), // Keep for now if used elsewhere, but not for grouping
                        image: photo,
                        number: membership.shirt_number,
                        isCaptain: false,
                        status: 'active'
                    });
                } else {
                    // Filter Staff: ONLY Allenatore
                    const roleLower = membership.role?.toLowerCase() || '';
                    if (roleLower.includes('allenatore') || roleLower.includes('coach') || roleLower.includes('mister')) {
                        staff.push({
                            id: membership.id,
                            name: fullName,
                            role: 'Allenatore', // Normalize role name
                            label: 'MISTER',
                            image: photo
                        });
                    }
                }
            });

            // Sort Players Alphabetically
            players.sort((a, b) => a.name.localeCompare(b.name));

            setPlayerList(players);
            setStaffList(staff);
        } catch (e) {
            console.log('Exception fetching team:', e);
        } finally {
            setLoading(false);
        }
    };

    const mapRoleToCategory = (role: string) => {
        if (!role) return 'Non definito';
        const r = role.toLowerCase();
        if (r.includes('portiere')) return 'Portieri';
        if (r.includes('difenso') || r.includes('terzino')) return 'Difensori';
        if (r.includes('centrocampist') || r.includes('mediano') || r.includes('regista') || r.includes('mezzala')) return 'Centrocampisti';
        if (r.includes('attaccante') || r.includes('punta') || r.includes('ala')) return 'Attaccanti';
        return 'Altri';
    };

    const getStaffLabel = (role: string) => {
        if (!role) return 'STAFF';
        const r = role.toLowerCase();
        if (r.includes('president')) return 'PRES';
        if (r.includes('direttore')) return 'DS';
        if (r.includes('allenatore')) return 'MISTER';
        if (r.includes('preparatore_portieri')) return 'GK COACH';
        if (r.includes('massaggiatore')) return 'MASSAGGIATORE';
        if (r.includes('dirigente')) return 'DIRIGENTE';
        return 'STAFF';
    };

    const getStaffDisplayRole = (role: string) => {
        if (!role) return 'Collaboratore';
        const r = role.toLowerCase();
        if (r.includes('president')) return 'Presidente';
        if (r.includes('direttore')) return 'Direttore Sportivo';
        if (r.includes('allenatore')) return 'Allenatore';
        if (r.includes('preparatore_portieri')) return 'Allenatore dei Portieri';
        if (r.includes('massaggiatore')) return 'Massaggiatore';
        if (r.includes('dirigente')) return 'Dirigente';
        return role;
    }

    const filteredStaff = useMemo(() =>
        staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [staffList, searchQuery]);

    const filteredPlayers = useMemo(() =>
        playerList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [playerList, searchQuery]);

    // const groupedPlayers = useMemo(() => ({ ... }), ...); // Removed for Simplification

    const renderSectionHeader = (title: string, icon: keyof typeof MaterialIcons.glyphMap) => (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>{title}</Text>
            <MaterialIcons name={icon} size={20} color={theme.primary} />
        </View>
    );

    const renderStaffCard = useCallback((staff: Person) => (
        <View key={staff.id} style={[styles.card, { backgroundColor: theme.card }, staff.label === 'PRES' && styles.presidentCard]}>
            <View style={styles.avatarContainer}>
                <Avatar name={staff.name} size={64} style={styles.avatar} />
                {staff.label && (
                    <View style={[styles.badgeContainer, { backgroundColor: staff.label === 'PRES' ? '#facc15' : theme.searchBackground }]}>
                        <Text style={[
                            styles.badgeText,
                            {
                                color: staff.label === 'PRES' ? '#0f172a' : theme.textSecondary,
                                fontSize: (staff.label?.length || 0) > 8 ? 7 : 9
                            }
                        ]}>
                            {staff.label}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardName, { color: theme.text, fontSize: 16 }]}>{staff.name}</Text>
                <Text style={[styles.cardRole, { color: theme.textSecondary, fontSize: 10 }]}>{staff.role}</Text>
            </View>
            <TouchableOpacity style={[styles.phoneButton, { backgroundColor: theme.searchBackground }]}>
                <MaterialIcons name="phone" size={20} color={theme.primary} />
            </TouchableOpacity>
        </View>
    ), [theme]);

    const renderPlayerCard = useCallback((player: Person) => (
        <View key={player.id} style={[styles.card, { backgroundColor: theme.card }, player.isCaptain && styles.captainCard]}>
            <View style={styles.avatarContainer}>
                <Avatar name={player.name} size={64} style={styles.avatar} />
                {/* Jersey Number Removed */}
            </View>
            <View style={styles.cardContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.cardName, { color: theme.text }]}>{player.name}</Text>
                    {/* Active Dot Removed */}
                    {player.isCaptain && (
                        <View style={styles.captainBadge}>
                            <Text style={styles.captainText}>CAPITANO</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.cardRole, { color: theme.textSecondary }]}>{player.role}</Text>
            </View>
            <TouchableOpacity style={[styles.phoneButton, { backgroundColor: theme.searchBackground }]}>
                <MaterialIcons name="phone" size={20} color={theme.primary} />
            </TouchableOpacity>
        </View>
    ), [theme]);

    const staffContent = useMemo(() => (
        <View style={styles.cardList}>
            {filteredStaff.length > 0 ? filteredStaff.map(renderStaffCard) : <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nessun risultato trovato.</Text>}
        </View>
    ), [filteredStaff, renderStaffCard, theme.textSecondary]);

    const playersContent = useMemo(() => (
        <View style={styles.section}>
            {/* Optional Header for Players if desired, or just list them */}
            {filteredPlayers.length > 0 && renderSectionHeader('Giocatori', 'groups')}
            <View style={styles.cardList}>
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(renderPlayerCard)
                ) : (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nessun giocatore trovato.</Text>
                )}
            </View>
        </View>
    ), [filteredPlayers, renderPlayerCard, theme.textSecondary]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background }}>
                {/* Header Code omitted for brevity, logic remains same */}
                <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
                    <View style={styles.headerTop}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[styles.logoContainer, { backgroundColor: theme.iconBox }]}>
                                <Ionicons name="football" size={24} color={theme.primary} />
                            </View>
                            <Text style={[styles.appTitle, { color: theme.text }]}>MyFootballZone</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: theme.searchBackground }]}>
                        <MaterialIcons name="search" size={22} color={theme.primary} style={{ marginRight: 12 }} />
                        <TextInput
                            placeholder="Cerca nella squadra..."
                            placeholderTextColor={theme.textSecondary}
                            style={[styles.searchInput, { color: theme.text }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Tab Switcher */}
                    <View style={[styles.tabContainer, { backgroundColor: theme.tabBackground }]}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'staff' && styles.tabActive, activeTab === 'staff' && { backgroundColor: theme.tabActive }]}
                            onPress={() => setActiveTab('staff')}
                        >
                            <MaterialIcons name="record-voice-over" size={18} color={activeTab === 'staff' ? theme.primary : theme.textSecondary} />
                            <Text style={[styles.tabText, { color: activeTab === 'staff' ? theme.primary : theme.textSecondary }]}>Staff</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'players' && styles.tabActive, activeTab === 'players' && { backgroundColor: theme.tabActive }]}
                            onPress={() => setActiveTab('players')}
                        >
                            <MaterialIcons name="groups" size={18} color={activeTab === 'players' ? theme.primary : theme.textSecondary} />
                            <Text style={[styles.tabText, { color: activeTab === 'players' ? theme.primary : theme.textSecondary }]}>Rosa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {loading ? (
                <View style={styles.scrollContent}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Skeleton width={64} height={64} borderRadius={32} />
                            <View style={{ flex: 1, gap: 8 }}>
                                <Skeleton width={120} height={20} borderRadius={4} />
                                <Skeleton width={80} height={14} borderRadius={4} />
                            </View>
                            <Skeleton width={48} height={48} borderRadius={16} />
                        </View>
                    ))}
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={true}>

                    {/* Content based on Active Tab */}
                    {activeTab === 'staff' ? (
                        filteredStaff.length > 0 ? (
                            <View style={styles.section}>
                                {renderSectionHeader('Staff Societario', 'record-voice-over')}
                                {staffContent}
                            </View>
                        ) : (
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nessun membro dello staff trovato.</Text>
                        )
                    ) : (
                        playersContent
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 16, fontWeight: '500' },
    header: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12, borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    logoContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    appTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1
    },
    searchInput: { flex: 1, fontSize: 15 },

    tabContainer: { flexDirection: 'row', padding: 6, borderRadius: 16 },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
    tabActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    tabText: { fontWeight: '700', fontSize: 15 },

    scrollContent: { padding: 24, gap: 32 },
    section: {},
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', opacity: 0.8, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: 1 },

    cardList: { gap: 12 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    presidentCard: { borderLeftWidth: 4, borderLeftColor: '#facc15' },
    captainCard: { borderLeftWidth: 4, borderLeftColor: '#facc15' },

    avatarContainer: { position: 'relative' },
    avatar: { width: 64, height: 64, borderRadius: 32 },
    badgeContainer: { position: 'absolute', bottom: -4, right: -4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: '900' },

    numberBadge: { position: 'absolute', top: -4, left: -4, width: 20, height: 20, backgroundColor: '#2D6A4F', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    numberText: { color: '#FFF', fontSize: 10, fontWeight: '900' },

    cardContent: { flex: 1 },
    cardName: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
    cardRole: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34d399' },
    captainBadge: { backgroundColor: '#facc15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    captainText: { fontSize: 8, fontWeight: '900', color: '#0f172a' },

    phoneButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    emptyText: { textAlign: 'center', fontStyle: 'italic', marginTop: 20 },
});
