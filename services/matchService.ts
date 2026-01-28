
import { supabase } from '@/lib/supabase';

export interface MatchData {
    id?: string;
    event_type: 'match' | 'training' | 'event' | 'trial';
    home?: string;
    away?: string;
    date: string;
    isoDate: string;
    time: string;
    location?: {
        name: string;
        address: string;
        lat: number;
        lng: number;
        city?: string; // Added city for display
        pitchType?: 'grass' | 'synthetic';
    };
    home_team_logo?: string | null | number;
    away_team_logo?: string | null | number;
    description?: string; // Added for generic events

    weather: {
        temp: string;
        condition: string;
        cleats: string;
        cleatsDesc: string;
    };
    callups: { confirmed: number; total: number };
}

const SAN_MAURIZIO_ID = '2e1ca46e-6849-4a39-b2e5-d7e8a2374dab';

export const fetchEvents = async (startDate?: Date, endDate?: Date): Promise<MatchData[]> => {
    try {
        let query = supabase
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(id, name, logo_url),
                away_team:teams!away_team_id(id, name, logo_url)
            `)
            .order('match_date', { ascending: true });

        if (startDate) {
            query = query.gte('match_date', startDate.toISOString());
        } else {
            // Default to future events if no range
            query = query.gte('match_date', new Date().toISOString());
        }

        if (endDate) {
            query = query.lte('match_date', endDate.toISOString());
        }

        const { data: matches, error } = await query;

        if (error) throw error;
        if (!matches) return [];

        const transformedMatches = matches.map(match => transformMatchData(match));
        return transformedMatches;
    } catch (e) {
        console.error("Error fetching events:", e);
        return [];
    }
};

// Open-Meteo Integration
const getWeatherForecast = async (lat: number, lng: number, date: string, pitchType?: 'grass' | 'synthetic') => {
    try {
        const dateObj = new Date(date);
        const isoDate = date.split('T')[0]; // YYYY-MM-DD
        const hour = dateObj.getHours();

        // Check if date is too far in future (Open-Meteo free is 7 days, but let's try standard)
        // If > 7 days, maybe just show historical or generic? For now, try fetching.
        // Actually Open-Meteo Forecast is up to 14 days usually.

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,weather_code&start_date=${isoDate}&end_date=${isoDate}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.hourly) {
            const index = hour; // approximate index by hour (0-23)
            const temp = data.hourly.temperature_2m[index];
            const code = data.hourly.weather_code[index];

            const weather = getWeatherFromCode(code);

            // Override Cleats based on Pitch Type
            if (pitchType === 'synthetic') {
                weather.cleats = 'AG';
                weather.cleatsDesc = 'Sintetico';
            } else if (pitchType === 'grass') {
                // Keep default logic for grass (Weather dependent)
            }

            return {
                temp: `${Math.round(temp)}°C`,
                ...weather
            };
        }
    } catch (e) {
        console.log("Weather fetch error:", e);
    }
    return null; // Fallback
};

const getWeatherFromCode = (code: number) => {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return { condition: 'Soleggiato', cleats: 'FG', cleatsDesc: 'Terreno asciutto' };
    if (code >= 1 && code <= 3) return { condition: 'Nuvoloso', cleats: 'FG', cleatsDesc: 'Terreno buono' };
    if (code >= 45 && code <= 48) return { condition: 'Nebbia', cleats: 'SG', cleatsDesc: 'Terreno umido' };
    if (code >= 51 && code <= 67) return { condition: 'Pioggia', cleats: 'SG', cleatsDesc: 'Terreno pesante' };
    if (code >= 71 && code <= 77) return { condition: 'Neve', cleats: 'SG', cleatsDesc: 'Terreno ghiacciato' };
    if (code >= 80 && code <= 82) return { condition: 'Rovesci', cleats: 'SG', cleatsDesc: 'Terreno scivoloso' };
    if (code >= 95) return { condition: 'Temporale', cleats: 'SG', cleatsDesc: 'Terreno bagnato' };
    return { condition: 'Variabile', cleats: 'FG', cleatsDesc: 'Terreno standard' };
};

const transformMatchData = (nextMatch: any): MatchData => {
    const eventType = nextMatch.event_type || 'match';

    let homeTeamName = 'San Maurizio';
    let awayTeamName = '';
    let homeLogo = null;
    let awayLogo = null;

    if (eventType === 'match') {
        homeTeamName = nextMatch.home_team?.name || '';
        awayTeamName = nextMatch.away_team?.name || '';
        homeLogo = nextMatch.home_team?.logo_url;
        awayLogo = nextMatch.away_team?.logo_url;
    } else {
        // For other events, we might use home/away columns if they store titles?
        // Or generic Logic. For now, defaulting.
        homeTeamName = ''; // Not relevant for generic events usually
    }

    // Format Date
    const mDate = new Date(nextMatch.match_date);
    let dayName = 'DATA INVALIDA';
    let time = '00:00';

    if (!isNaN(mDate.getTime())) {
        dayName = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(mDate).toUpperCase();
        time = mDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }


    // Handle Location
    let locName = nextMatch.location_text || 'Luogo non definito';
    let locAddr = 'Indirizzo non disponibile';
    let locCity = '';
    let pitchType: 'grass' | 'synthetic' | undefined = undefined;

    try {
        if (nextMatch.location_text && (nextMatch.location_text.startsWith('{') || nextMatch.location_text.startsWith('['))) {
            const parsed = JSON.parse(nextMatch.location_text);
            if (parsed.name) locName = parsed.name;
            if (parsed.address) locAddr = parsed.address;
            if (parsed.city) locCity = parsed.city;
            if (parsed.pitchType) pitchType = parsed.pitchType;
        } else {
            locName = nextMatch.location_text;
        }
    } catch (e) {
        locName = nextMatch.location_text || 'Luogo non definito';
    }

    // Determine if we have a valid location
    let locationData: MatchData['location'] | undefined = undefined;

    // Check if we have minimal requirements for a location (at least a name or coordinates)
    const hasLocationData = nextMatch.location_text || (nextMatch.location_lat && nextMatch.location_lng);

    if (hasLocationData) {
        locationData = {
            name: locName,
            address: locAddr,
            lat: nextMatch.location_lat || 45.21,
            lng: nextMatch.location_lng || 7.63,
            city: locCity,
            pitchType: pitchType
        };
    }

    return {
        id: nextMatch.id,
        event_type: eventType,
        home: homeTeamName,
        away: awayTeamName,
        home_team_logo: homeLogo,
        away_team_logo: awayLogo,
        date: dayName,
        isoDate: nextMatch.match_date,
        time: time,
        location: locationData,
        description: nextMatch.description || '', // Assuming description column might exist or we add it? If not, ignored.
        weather: {
            temp: '6°C',
            condition: 'Soleggiato',
            cleats: 'FG',
            cleatsDesc: 'Terreno buono'
        },
        callups: { confirmed: 0, total: 20 }
    };
};



export const fetchLastCreatedEvent = async (): Promise<MatchData | null> => {
    try {
        // Get Last Created Event (Sort by created_at DESC)
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(id, name, logo_url),
                away_team:teams!away_team_id(id, name, logo_url)
            `)
            .order('created_at', { ascending: false })
            .limit(1);

        if (matchError) throw matchError;
        if (!matches || matches.length === 0) return null;

        return transformMatchData(matches[0]);
    } catch (e) {
        console.error("Error fetching last created match data:", e);
        return null;
    }
};

export const fetchNextMatch = async (): Promise<MatchData | null> => {
    try {
        // Get Closest Future Event
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(id, name, logo_url),
                away_team:teams!away_team_id(id, name, logo_url)
            `)
            // Include matches that started up to 3 hours ago (to show ongoing events)
            .gte('match_date', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())
            .order('match_date', { ascending: true })
            .limit(1);

        if (matchError) throw matchError;
        if (!matches || matches.length === 0) return null;

        const match = transformMatchData(matches[0]);

        // Enrich with real weather
        if (match.location && match.location.lat && match.location.lng) {
            const weather = await getWeatherForecast(
                match.location.lat,
                match.location.lng,
                match.isoDate,
                match.location.pitchType
            );
        }

        return match;
        return match;
    } catch (e: any) {
        console.error("Error fetching match data (RAW):", e);
        if (e === null) console.error("Error is literally NULL");
        if (e === undefined) console.error("Error is literally UNDEFINED");

        try {
            console.error("Error details (JSON):", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
        } catch (jsonErr) {
            console.error("Could not stringify error:", jsonErr);
        }

        if (e instanceof Error) {
            console.error("Error message:", e.message);
            console.error("Error stack:", e.stack);
        }
        return null;
    }
};

export const fetchMatchById = async (id: string): Promise<MatchData | null> => {
    try {
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(id, name, logo_url),
                away_team:teams!away_team_id(id, name, logo_url)
            `)
            .eq('id', id)
            .limit(1);

        if (matchError) throw matchError;
        if (!matches || matches.length === 0) return null;

        return transformMatchData(matches[0]);
    } catch (e) {
        console.error("Error fetching match by id:", e);
        return null;
    }
};

// Simple centralized signal state
export const refreshSignal = {
    shouldReloadHome: false
};

export const deleteMatch = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('matches')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Signal that home should reload cleanly
        refreshSignal.shouldReloadHome = true;
    } catch (e) {
        console.error("Error deleting match:", e);
        throw e;
    }
};

export const uploadTeamLogo = async (uri: string, teamName: string): Promise<string | null> => {
    // Legacy / Removed logic placeholder if needed, but we removed bucket.
    return null;
};

export const upsertTeam = async (name: string, logoUrl?: string | null) => {
    const { data: existing } = await supabase.from('teams').select('id').ilike('name', name).single();

    if (existing) {
        const updates: any = { name };
        if (logoUrl) updates.logo_url = logoUrl;
        await supabase.from('teams').update(updates).eq('id', existing.id);
        return existing.id;
    } else {
        const { data, error } = await supabase.from('teams').insert({
            name,
            logo_url: logoUrl,
            category: 'terza_categoria',
            club_matricola: '100001'
        }).select('id').single();

        if (error) throw error;
        return data.id;
    }
};

export const upsertMatch = async (
    eventType: 'match' | 'training' | 'event' | 'trial',
    date: Date,
    locationName?: string,
    homeTeamName?: string,
    awayTeamName?: string,
    homeLogo?: string | null,
    awayLogo?: string | null,
    locationLat?: number | null,
    locationLng?: number | null,
    locationAddress?: string | null,
    locationCity?: string, // Added argument
    matchId?: string, // Added ID for update support
    pitchType?: 'grass' | 'synthetic' // Added argument
) => {
    let homeTeamId = null;
    let awayTeamId = null;

    // Single Event Policy REMOVED. We now support multiple events.

    if (eventType === 'match') {
        if (!homeTeamName || !awayTeamName) throw new Error("Teams are required for matches");
        homeTeamId = await upsertTeam(homeTeamName, homeLogo);
        awayTeamId = await upsertTeam(awayTeamName, awayLogo);
    } else {
        // For non-matches, we might need a placeholder or just null if DB allows.
        // Assuming current DB requires team IDs or we use a placeholder.
        const PLACEHOLDER_TEAM_NAME = 'System_Placeholder_Team';
        const placeholderId = await upsertTeam(PLACEHOLDER_TEAM_NAME, null);
        homeTeamId = placeholderId;
        awayTeamId = placeholderId;
    }

    // Store Location Name, Address, City and Pitch Type as JSON in location_text
    let locationDataStr = null;

    if (locationName) {
        locationDataStr = JSON.stringify({
            name: locationName,
            address: locationAddress || 'Indirizzo non disponibile',
            city: locationCity || '',
            pitchType: pitchType || 'grass'
        });
    }

    const matchData = {
        event_type: eventType,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: date.toISOString(),
        location_text: locationDataStr,
        location_lat: locationLat,
        location_lng: locationLng,
        status: 'scheduled',
        competition_id: 'b13a8414-aa34-4cee-a7a3-fb6bb97bbee0'
    };

    if (matchId) {
        // UPDATE
        const { error } = await supabase
            .from('matches')
            .update(matchData)
            .eq('id', matchId);
        if (error) throw error;
    } else {
        // INSERT
        const { error } = await supabase.from('matches').insert(matchData);
        if (error) throw error;
    }

    // Signal Home to Reload
    refreshSignal.shouldReloadHome = true;
};
