import { MockMatchProvider } from '@/context/MockMatchContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';

function RootLayoutNav() {
  const { activeTheme } = useTheme();
  // Init Session
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null); // New state
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if first launch
    AsyncStorage.getItem('hasLaunched').then(value => {
      setIsFirstLaunch(value === null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        prefetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const prefetchUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('people')
        .select('photo_url')
        .eq('user_id', userId)
        .single();

      if (data?.photo_url) {
        await Image.prefetch(data.photo_url);
        console.log('Profile image prefetched:', data.photo_url);
      }
    } catch (e) {
      console.log('Error prefetching profile image:', e);
    }
  };

  useEffect(() => {
    if (isLoading || isFirstLaunch === null) return; // Wait for both

    checkOnboarding();
  }, [session, isLoading, isFirstLaunch]);

  const checkOnboarding = async () => {
    try {
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === 'onboarding';

      if (!session) {
        // Not logged in
        if (isFirstLaunch && !inOnboardingGroup) {
          // First time ever -> Go to Onboarding
          router.replace('/onboarding');
        } else if (!isFirstLaunch && !inAuthGroup && !inOnboardingGroup) {
          // Not first time, but not authenticated -> Go to Login (skip onboarding)
          router.replace('/(auth)/login');
        }
      } else if (session && inAuthGroup) {
        // Logged in but in auth group: Go to tabs
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#020403',
      card: '#020403',
    },
  };

  return (
    <NavigationThemeProvider value={activeTheme === 'dark' ? customDarkTheme : DefaultTheme}>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: activeTheme === 'dark' ? '#020403' : '#FFFFFF' }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <SettingsProvider>
        <MockMatchProvider>
          <RootLayoutNav />
        </MockMatchProvider>
      </SettingsProvider>
    </CustomThemeProvider>
  );
}
