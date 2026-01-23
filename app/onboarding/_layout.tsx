import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="intro" />
            <Stack.Screen name="coach" />
            <Stack.Screen name="role" />
            <Stack.Screen name="action" />
            <Stack.Screen name="team" />
        </Stack>
    );
}
