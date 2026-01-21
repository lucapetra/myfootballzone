import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    const activeColor = colorScheme === 'dark' ? '#4ADE80' : '#2E7D32';
    const inactiveColor = colorScheme === 'dark' ? '#94a3b8' : '#64748b';
    const backgroundColor = colorScheme === 'dark' ? '#121212' : '#FFFFFF';
    const borderColor = colorScheme === 'dark' ? '#333333' : '#e2e8f0';

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: activeColor,
            tabBarInactiveTintColor: inactiveColor,
            tabBarStyle: {
                backgroundColor: backgroundColor,
                borderTopColor: borderColor,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="team"
                options={{
                    title: 'Squadra',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "shirt" : "shirt-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profilo',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
