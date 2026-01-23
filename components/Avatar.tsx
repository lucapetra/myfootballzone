import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { getAvatarColor, getInitials } from '../utils/avatarGenerator';

interface AvatarProps {
    name: string;
    size?: number;
    style?: ViewStyle;
    fontSize?: number;
}

export default function Avatar({ name, size = 64, style, fontSize }: AvatarProps) {
    const initials = getInitials(name);
    const backgroundColor = getAvatarColor();
    const calculatedFontSize = fontSize || size * 0.4;

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                },
                style,
            ]}
        >
            <Text style={[styles.text, { fontSize: calculatedFontSize }]}>
                {initials}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '700',
        textAlign: 'center',
    },
});
