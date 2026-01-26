import React, { useEffect } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
    value: string;
    style?: TextStyle;
}

export default function AnimatedCounter({ value, style }: AnimatedCounterProps) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Slide up and fade animation
        translateY.value = 0;
        opacity.value = 1;

        translateY.value = withTiming(-10, { duration: 150, easing: Easing.out(Easing.ease) }, () => {
            translateY.value = 10;
            opacity.value = 0;
            translateY.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) });
            opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
        });
    }, [value]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.Text style={[style, animatedStyle]}>
            {value}
        </Animated.Text>
    );
}
