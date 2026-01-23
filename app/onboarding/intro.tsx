import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IntroScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            <Image
                source={require('../../assets/images/coachWithPlayer.png')}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}
                resizeMode="cover"
            />

            {/* Overlay Gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)', '#000000']}
                style={styles.gradient}
            />

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        Tutto il <Text style={styles.highlight}>Team</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Gestisci ruoli, staff societario e contatti. Tieni numeri di telefono e info dei giocatori sempre a portata di mano.
                    </Text>
                </View>

                {/* Progress Indicators */}
                <View style={styles.indicatorContainer}>
                    <View style={styles.indicator} />
                    <View style={[styles.indicator, styles.activeIndicator]} />
                    <View style={styles.indicator} />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/onboarding/coach')}
                    activeOpacity={0.9}
                >
                    <Text style={styles.buttonText}>D'accordo!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        top: '15%',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 50,
    },
    indicatorContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    activeIndicator: {
        width: 24,
        backgroundColor: '#4ADE80', // Primary Green
    },
    textContainer: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 16,
        lineHeight: 38,
        letterSpacing: -0.5,
    },
    highlight: {
        color: '#4ADE80',
    },
    subtitle: {
        fontSize: 16,
        color: '#cbd5e1',
        lineHeight: 24,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#31b261ff',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        marginBottom: 24,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
