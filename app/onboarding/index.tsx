import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    ImageBackground,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Asset mapping
const SLIDES = [
    {
        id: '1',
        title: 'Basta caos nelle chat',
        subtitle: 'Gestisci convocazioni e presenze in un unico posto.',
        image: require('@/assets/images/speakWithCoach.jpeg'),
    },
    {
        id: '2',
        title: 'Esperienza Serie A',
        subtitle: 'Lineup ufficiali, voti e statistiche da vero Pro.',
        image: require('@/assets/images/coachWithPlayer.png'),
    },
    {
        id: '3',
        title: 'Meteo e Tacchetti',
        subtitle: 'Analisi meteo sul campo prima del match.',
        image: require('@/assets/images/playerInStadium.png'), // Using a field/stadium background
    },
];

export default function WelcomeCarousel() {
    const router = useRouter();

    // Custom Splash State
    const [showSplash, setShowSplash] = useState(true);
    const splashOpacity = useRef(new Animated.Value(1)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    // Carousel State
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Splash Animation Sequence
        Animated.sequence([
            Animated.spring(logoScale, {
                toValue: 1.2,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.delay(1000),
            Animated.timing(splashOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowSplash(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        });
    }, []);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setActiveIndex(index);
    };

    const handleNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
        } else {
            router.push('/onboarding/auth-role');
        }
    };

    if (showSplash) {
        return (
            <View style={styles.splashContainer}>
                <StatusBar barStyle="light-content" />
                <Animated.View style={[styles.splashIconContainer, { opacity: splashOpacity, transform: [{ scale: logoScale }] }]}>
                    <Ionicons name="football" size={120} color="#22c55e" />
                    <Text style={styles.splashText}>MyFootballZone</Text>
                </Animated.View>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <StatusBar barStyle="light-content" />

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <ImageBackground
                            source={item.image}
                            style={styles.imageBackground}
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)', '#020403']}
                                style={styles.gradient}
                            >
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                )}
            />

            {/* Footer: Indicators & Button */}
            <View style={styles.footer}>
                {/* Indicators */}
                <View style={styles.indicatorContainer}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === activeIndex && styles.activeIndicator,
                            ]}
                        />
                    ))}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {activeIndex === SLIDES.length - 1 ? 'Inizia' : 'Avanti'}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#020403',
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashIconContainer: {
        alignItems: 'center',
        gap: 20,
    },
    splashText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -1,
    },
    container: {
        flex: 1,
        backgroundColor: '#020403',
    },
    slide: {
        width: width,
        height: height,
    },
    imageBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    gradient: {
        height: '100%', // Full screen gradient for consistent opacity
        justifyContent: 'flex-end',
        paddingBottom: 180, // Raised text
        paddingHorizontal: 24,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#e2e8f0',
        textAlign: 'center',
        lineHeight: 24,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        maxWidth: '90%',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 50,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    activeIndicator: {
        width: 32,
        backgroundColor: '#22c55e',
    },
    button: {
        backgroundColor: '#22c55e',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
