import { MatchData } from '@/services/matchService';
import React, { createContext, useContext, useState } from 'react';

// Mock Data Logic (Moved from HomeScreen)
const getNextSunday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()) % 7);
    if (d.getDay() === new Date().getDay() && d.getHours() > 20) {
        d.setDate(d.getDate() + 7);
    }
    d.setHours(20, 45, 0, 0);
    return d;
};

const nextSunday = getNextSunday();
const dateString = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(nextSunday);
const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);

const defaultMockMatch: MatchData = {
    event_type: 'match',
    home: 'A.C. MILANESE',
    away: 'ASD SAN SIRO',
    date: formattedDate,
    isoDate: nextSunday.toISOString(),
    time: '20:45',
    location: {
        name: 'Stadio San Siro',
        address: 'Piazzale Angelo Moratti, Milano',
        lat: 45.4781,
        lng: 9.1240
    },
    home_team_logo: require('../assets/images/ac_milanese_logo.png'),
    away_team_logo: require('../assets/images/asd_san_siro_logo.png'),
    weather: {
        temp: '18°C',
        condition: 'Pioggia leggera',
        cleats: 'SG',
        cleatsDesc: 'Terreno morbido'
    },
    callups: {
        confirmed: 14,
        total: 18
    }
};

interface MockMatchContextType {
    mockMatch: MatchData | null;
    updateMockMatch: (match: MatchData) => void;
    resetMockMatch: () => void;
}

const MockMatchContext = createContext<MockMatchContextType>({
    mockMatch: defaultMockMatch,
    updateMockMatch: () => { },
    resetMockMatch: () => { },
});

export const useMockMatch = () => useContext(MockMatchContext);

export const MockMatchProvider = ({ children }: { children: React.ReactNode }) => {
    const [mockMatch, setMockMatch] = useState<MatchData | null>(defaultMockMatch);

    const updateMockMatch = (match: MatchData) => {
        setMockMatch(match);
    };

    const resetMockMatch = () => {
        setMockMatch(defaultMockMatch);
    }

    const value = React.useMemo(() => ({
        mockMatch,
        updateMockMatch,
        resetMockMatch
    }), [mockMatch]);

    return (
        <MockMatchContext.Provider value={value}>
            {children}
        </MockMatchContext.Provider>
    );
};
