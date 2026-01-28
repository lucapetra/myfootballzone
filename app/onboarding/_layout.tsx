import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth-role" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="setup-mister" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="setup-player" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="email-register" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="permissions" options={{ animation: 'slide_from_right' }} />
        </Stack>
    );
}
