import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface MatchResult {
    result: 'W' | 'D' | 'L';
    match_date: string;
    opponent: string;
    score: string;
}

interface NextMatchCardProps {
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string | null | number;
    awayLogo?: string | null | number;
    eventType?: 'match' | 'training';
    timeLeft?: {
        days: string;
        hours: string;
        minutes: string;
        seconds: string;
    };

    theme: any;
    style?: ViewStyle;
}

export default function NextMatchCard({
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
    eventType = 'match',
    timeLeft,
    style
}: NextMatchCardProps) {
    const isTraining = eventType === 'training';

    return (
        <LinearGradient
            colors={['#22c55e', '#16a34a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.matchCard, isTraining && { paddingVertical: 16 }, style]}
        >
            <View style={[styles.headerRow, isTraining && { marginBottom: 10 }]}>
                <Text style={styles.headerBadge}>{isTraining ? 'PROSSIMO EVENTO' : 'PROSSIMO MATCH'}</Text>
            </View>

            <View style={[styles.matchCardHeader, isTraining && { marginBottom: 0 }]}>
                {isTraining ? (
                    <View style={styles.trainingContainer}>
                        <View style={styles.trainingIconContainer}>
                            <Text style={{ fontSize: 24 }}>⚽️</Text>
                        </View>
                        <Text style={styles.trainingTitle}>ALLENAMENTO</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.teamContainer}>
                            <BlurView intensity={30} tint="light" style={styles.teamLogoContainer}>
                                {homeLogo ? (
                                    <Image source={typeof homeLogo === 'string' ? { uri: homeLogo } : homeLogo} style={styles.teamLogo} contentFit="contain" />
                                ) : (
                                    <Text style={styles.teamInitial}>{homeTeam.charAt(0)}</Text>
                                )}
                            </BlurView>
                            <Text style={styles.teamName} numberOfLines={2}>{homeTeam}</Text>
                        </View>

                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>

                        <View style={styles.teamContainer}>
                            <BlurView intensity={30} tint="light" style={styles.teamLogoContainer}>
                                {awayLogo ? (
                                    <Image source={typeof awayLogo === 'string' ? { uri: awayLogo } : awayLogo} style={styles.teamLogo} contentFit="contain" />
                                ) : (
                                    <Text style={styles.teamInitial}>{awayTeam.charAt(0)}</Text>
                                )}
                            </BlurView>
                            <Text style={styles.teamName} numberOfLines={2}>{awayTeam}</Text>
                        </View>
                    </>
                )}
            </View>

            {timeLeft && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.countdownRow}>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{timeLeft.days}</Text>
                            <Text style={styles.countdownLabel}>GIORNI</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{timeLeft.hours}</Text>
                            <Text style={styles.countdownLabel}>ORE</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{timeLeft.minutes}</Text>
                            <Text style={styles.countdownLabel}>MIN</Text>
                        </View>
                        {/* <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{timeLeft.seconds}</Text>
                            <Text style={styles.countdownLabel}>SEC</Text>
                        </View> */}
                    </View>
                </>
            )}



        </LinearGradient >
    );
}

const styles = StyleSheet.create({
    matchCard: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerBadge: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFF',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    matchDate: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '600',
    },
    matchCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    teamContainer: {
        alignItems: 'center',
        gap: 8,
        width: '35%',
    },
    teamLogoContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    teamInitial: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
    },
    teamLogo: {
        width: '100%',
        height: '100%',
    },
    trainingContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
    },
    trainingIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    trainingTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
    },
    teamName: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    vsContainer: {
        alignItems: 'center',
        marginBottom: 20, // Adjust alignment
    },
    vsText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        opacity: 0.8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 16,
    },
    formSection: {
        gap: 12,
    },
    formHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    formTitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Spread them out evenly
        paddingHorizontal: 10,
    },
    formItemContainer: {
        alignItems: 'center',
    },
    formCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    formText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },
    formSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 4,
        fontStyle: 'italic',
    },
    countdownRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    countdownItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 8, alignItems: 'center' },
    countdownValue: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    countdownLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: '700', marginTop: 2 },
});
