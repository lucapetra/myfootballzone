import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export default function HomeLoader() {
    const { activeTheme } = useTheme();
    const isDark = activeTheme === 'dark';
    const scaleValue = new Animated.Value(1);

    const theme = {
        background: isDark ? '#020403' : '#f8fafc',
        text: isDark ? '#F8faf9' : '#0f172a',
        primary: isDark ? '#4ADE80' : '#22c55e',
        iconBox: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)',
    };

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.2,
                    duration: 750,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 750,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.View style={{
                transform: [{ scale: scaleValue }],
                backgroundColor: theme.iconBox,
                padding: 30,
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Ionicons name="football" size={80} color={theme.primary} />
            </Animated.View>
            <Text style={[styles.text, { color: theme.text }]}>
                MyFootballZone
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    text: {
        marginTop: 24,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});
