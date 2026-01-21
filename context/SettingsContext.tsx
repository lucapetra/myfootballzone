import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
    mockDataEnabled: boolean;
    setMockDataEnabled: (enabled: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    mockDataEnabled: false,
    setMockDataEnabled: async () => { },
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [mockDataEnabled, setMockData] = useState<boolean>(true); // Default to true for demo/dev

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedMockPreference = await AsyncStorage.getItem('mockDataEnabled');
            // If local storage has a value, use it. Otherwise default to true.
            if (savedMockPreference !== null) {
                setMockData(savedMockPreference === 'true');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const setMockDataEnabled = async (enabled: boolean) => {
        try {
            setMockData(enabled);
            await AsyncStorage.setItem('mockDataEnabled', String(enabled));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    return (
        <SettingsContext.Provider value={{ mockDataEnabled, setMockDataEnabled }}>
            {children}
        </SettingsContext.Provider>
    );
};
