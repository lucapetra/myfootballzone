import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    activeTheme: 'light' | 'dark';
    setTheme: (theme: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    activeTheme: 'light',
    setTheme: async () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeMode>('dark');

    // activeTheme is either the forced theme OR the system theme
    const activeTheme = theme === 'system' ? (systemColorScheme ?? 'light') : theme;

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('userThemePreference');
            if (savedTheme) {
                setThemeState(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const setTheme = async (newTheme: ThemeMode) => {
        try {
            await AsyncStorage.setItem('userThemePreference', newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, activeTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
