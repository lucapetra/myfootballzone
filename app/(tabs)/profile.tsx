import EditProfileModal from '@/components/EditProfileModal';
import Skeleton from '@/components/Skeleton';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker'; // Removed
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color Palette (kept as is)
const Colors = {
    light: {
        background: '#f8faf9',
        safeArea: 'rgba(248, 250, 249, 0.8)',
        card: '#FFFFFF',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: '#22c55e', // Was #1E6B3E
        iconHeader: '#1e293b',
        border: '#f1f5f9',
        dot: '#94a3b8',
        iconContainer: '#22c55e', // Was #1E6B3E
        modalOverlay: 'rgba(0,0,0,0.5)'
    },
    dark: {
        background: '#020403',
        safeArea: 'rgba(2, 4, 3, 0.8)',
        card: '#121212',
        text: '#F8faf9',
        textSecondary: '#94a3b8',
        primary: '#22c55e', // Was #4ADE80
        iconHeader: '#F8faf9',
        border: '#333333',
        dot: '#64748b',
        iconContainer: '#22c55e', // Was #2D6A4F
        modalOverlay: 'rgba(0,0,0,0.8)'
    }
};

export default function ProfileScreen() {
    const router = useRouter();
    const { activeTheme } = useTheme();
    const theme = Colors[activeTheme];

    const [profile, setProfile] = useState<any>(null);
    const [userEmail, setUserEmail] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    // const [uploading, setUploading] = useState(false); // Removed
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserEmail(user.email || '');

            let { data, error } = await supabase
                .from('people')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!data) {
                const { data: mockData } = await supabase.from('people').select('*').limit(1).single();
                data = mockData;
            }

            if (data) setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (updates: { firstName: string; lastName: string; phone: string; roleSpecific: string; preferredFoot: string }) => {
        if (!profile) return;

        try {
            const { error } = await supabase
                .from('people')
                .update({
                    first_name: updates.firstName,
                    last_name: updates.lastName,
                    phone: updates.phone,
                    role_specific: updates.roleSpecific,
                    preferred_foot: updates.preferredFoot
                })
                .eq('figc_id', profile.figc_id);

            if (error) throw error;

            setProfile({
                ...profile,
                first_name: updates.firstName,
                last_name: updates.lastName,
                phone: updates.phone,
                role_specific: updates.roleSpecific,
                preferred_foot: updates.preferredFoot
            });
            Alert.alert("Successo", "Profilo aggiornato con successo.");
        } catch (error) {
            Alert.alert("Errore", "Impossibile aggiornare il profilo.");
            console.error(error);
        }
    };

    // pickImage and uploadAvatar removed

    const handleLogout = () => {
        Alert.alert("Logout", "Sei sicuro di voler uscire?", [
            { text: "Annulla", style: "cancel" },
            {
                text: "Esci",
                style: "destructive",
                onPress: async () => {
                    setIsLoggingOut(true);
                    await supabase.auth.signOut();
                }
            }
        ]);
    };

    const renderInfoRow = (icon: keyof typeof MaterialIcons.glyphMap, label: string, value: string) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: theme.iconContainer, shadowColor: theme.primary }]}>
                <MaterialIcons name={icon} size={22} color="#FFF" />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{value || '-'}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.safeArea }]}>
                    {/* Header Skeleton */}
                    <View style={styles.header}>
                        <Skeleton width={100} height={28} borderRadius={8} />
                        <Skeleton width={40} height={40} borderRadius={20} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Profile Header Skeleton */}
                        <View style={styles.profileHeader}>
                            <View style={{ marginBottom: 16 }}>
                                <Skeleton width={128} height={128} borderRadius={64} style={{ borderRadius: 64 }} />
                            </View>

                            <View style={{ alignItems: 'center', gap: 6 }}>
                                <Skeleton width={200} height={32} borderRadius={8} />
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <Skeleton width={80} height={16} borderRadius={4} />
                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.dot }} />
                                    <Skeleton width={80} height={16} borderRadius={4} />
                                </View>
                                <Skeleton width={150} height={16} borderRadius={4} style={{ marginTop: 4 }} />
                            </View>
                        </View>

                        {/* Personal Info Card Skeleton */}
                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Skeleton width={180} height={16} borderRadius={4} style={{ marginBottom: 24 }} />
                            <View style={styles.infoList}>
                                {[1, 2, 3].map((i) => (
                                    <View key={i} style={styles.infoRow}>
                                        <Skeleton width={44} height={44} borderRadius={14} />
                                        <View style={{ flex: 1, gap: 6 }}>
                                            <Skeleton width={80} height={12} borderRadius={4} />
                                            <Skeleton width={150} height={20} borderRadius={4} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Actions Skeleton */}
                        <View style={styles.actionSection}>
                            <Skeleton width="100%" height={56} borderRadius={18} />
                            <View style={{ alignItems: 'center', marginTop: 12 }}>
                                <Skeleton width={150} height={20} borderRadius={4} />
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.safeArea }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Profilo</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')}>
                        <MaterialIcons name="settings" size={24} color={theme.iconHeader} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarWrapper}>
                            <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
                                {profile?.photo_url ? (
                                    <Image
                                        source={{ uri: profile.photo_url }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatar, { backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center' }]}>
                                        <MaterialIcons name="person" size={64} color={theme.textSecondary} />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: theme.text }]}>
                                {profile ? `${profile.first_name} ${profile.last_name}` : 'Utente'}
                            </Text>

                            <View style={styles.roleRow}>
                                <Text style={[styles.roleText, { color: theme.primary }]}>
                                    {profile?.role_primary || 'GIOCATORE'}
                                </Text>
                                <Text style={[styles.dot, { color: theme.dot }]}>•</Text>
                                <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                                    {profile?.role_specific || 'Membro'}
                                </Text>
                            </View>

                            <View style={styles.verifiedRow}>
                                <MaterialIcons name="verified" size={16} color={theme.primary} />
                                <Text style={[styles.verifiedText, { color: theme.primary }]}>MyFootballZone Verified Player</Text>
                            </View>
                        </View>
                    </View>

                    {/* Personal Info Card */}
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.primary }]}>INFORMAZIONI PERSONALI</Text>
                        <View style={styles.infoList}>
                            {renderInfoRow('call', 'Telefono', profile?.phone || 'Non inserito')}
                            {renderInfoRow('mail', 'Email', userEmail || 'ID non disp.')}
                            {renderInfoRow('sports-soccer', 'Piede', profile?.preferred_foot?.toUpperCase() || '-')}
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                            onPress={() => setModalVisible(true)}
                        >
                            <MaterialIcons name="edit" size={22} color={activeTheme === 'dark' ? '#000' : '#FFF'} />
                            <Text style={[styles.editButtonText, { color: activeTheme === 'dark' ? '#000' : '#FFF' }]}>Modifica Profilo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.logoutButton, isLoggingOut && { opacity: 0.7 }]}
                            onPress={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? (
                                <ActivityIndicator size="small" color="#dc2626" />
                            ) : (
                                <>
                                    <MaterialIcons name="logout" size={20} color="#dc2626" />
                                    <Text style={styles.logoutText}>Logout dall'account</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Spacer for Tab Bar */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>

            {profile && (
                <EditProfileModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    initialData={{
                        firstName: profile.first_name,
                        lastName: profile.last_name,
                        phone: profile.phone || '',
                        roleSpecific: profile.role_specific || '',
                        preferredFoot: profile.preferred_foot || 'dx'
                    }}
                    onSave={handleUpdateProfile}
                    theme={theme}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    headerButton: { padding: 8, borderRadius: 20 },

    // Scroll Content
    scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },

    // Profile Header
    profileHeader: { alignItems: 'center', marginVertical: 24 },
    avatarWrapper: { marginBottom: 16, position: 'relative' },
    avatarContainer: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, padding: 4, overflow: 'hidden' },
    avatar: { width: '100%', height: '100%', borderRadius: 60 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 60 }, // Unused but kept for safety or remove? I'll remove it.

    profileInfo: { alignItems: 'center', gap: 6 },
    profileName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    roleText: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    dot: { fontSize: 13 },
    statusText: { fontSize: 14, fontWeight: '500' },

    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    verifiedText: { fontSize: 12, fontWeight: '600' },

    // Card
    card: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: 1, marginBottom: 32 },
    cardTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 24 },
    infoList: { gap: 24 },

    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    infoValue: { fontSize: 16, fontWeight: '700' },

    // Actions
    actionSection: { gap: 16, marginBottom: 24 },
    editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 18, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    editButtonText: { fontSize: 16, fontWeight: '700' },

    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 },
    logoutText: { color: '#dc2626', fontSize: 15, fontWeight: '700' },
});
