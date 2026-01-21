
import { supabase } from '@/lib/supabase';

export interface MatchData {
    id?: string;
    event_type: 'match' | 'training';
    home?: string;
    away?: string;
    date: string;
    isoDate: string;
    time: string;
    location: {
        name: string;
        address: string;
        lat: number;
        lng: number;
    };
    home_team_logo?: string | null;
    away_team_logo?: string | null;

    weather: {
        temp: string;
        condition: string;
        cleats: string;
        cleatsDesc: string;
    };
    callups: { confirmed: number; total: number };
}

const SAN_MAURIZIO_ID = '2e1ca46e-6849-4a39-b2e5-d7e8a2374dab';

export const fetchNextMatch = async (): Promise<MatchData | null> => {
    try {
        // 1. Get Next Match
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(id, name, logo_url),
                away_team:teams!away_team_id(id, name, logo_url)
            `)
            .limit(1);

        if (matchError) throw matchError;
        if (!matches || matches.length === 0) return null;

        const nextMatch = matches[0];
        const eventType = nextMatch.event_type || 'match';

        let homeTeamName = 'San Maurizio';
        let awayTeamName = '';
        let homeLogo = null;
        let awayLogo = null;

        if (eventType === 'match') {
            const isHome = nextMatch.home_team_id === SAN_MAURIZIO_ID;
            homeTeamName = nextMatch.home_team?.name || '';
            awayTeamName = nextMatch.away_team?.name || '';
            homeLogo = nextMatch.home_team?.logo_url;
            awayLogo = nextMatch.away_team?.logo_url;
        }

        // Format Date
        const mDate = new Date(nextMatch.match_date);
        const dayName = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(mDate).toUpperCase(); // 25 GEN
        const time = mDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        // Handle Location JSON or Text
        let locName = nextMatch.location_text || 'Luogo non definito';
        let locAddr = 'Indirizzo non disponibile';

        try {
            if (nextMatch.location_text && (nextMatch.location_text.startsWith('{') || nextMatch.location_text.startsWith('['))) {
                const parsed = JSON.parse(nextMatch.location_text);
                if (parsed.name) locName = parsed.name;
                if (parsed.address) locAddr = parsed.address;
            } else {
                locName = nextMatch.location_text;
            }
        } catch (e) {
            locName = nextMatch.location_text || 'Luogo non definito';
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
            location: {
                name: locName,
                address: locAddr,
                lat: nextMatch.location_lat || 45.21,
                lng: nextMatch.location_lng || 7.63
            },
            weather: {
                temp: '6°C',
                condition: 'Soleggiato',
                cleats: 'FG',
                cleatsDesc: 'Terreno buono'
            },
            callups: { confirmed: 0, total: 20 }
        };

    } catch (e) {
        console.error("Error fetching match data:", e);
        return null;
    }
};

export const uploadTeamLogo = async (uri: string, teamName: string): Promise<string | null> => {
    try {
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileName = `${teamName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;

        const { data, error } = await supabase.storage
            .from('team-logos')
            .upload(fileName, arrayBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('team-logos')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Error uploading team logo:', error);
        return null;
    }
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
    eventType: 'match' | 'training',
    date: Date,
    locationName: string,
    homeTeamName?: string,
    awayTeamName?: string,
    homeLogo?: string | null,
    awayLogo?: string | null,
    locationLat?: number | null,
    locationLng?: number | null,
    locationAddress?: string | null
) => {
    let homeTeamId = null;
    let awayTeamId = null;

    // Single Event Policy: Clear all existing matches first
    const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
        console.error("Error clearing old matches:", deleteError);
        throw deleteError;
    }

    if (eventType === 'match') {
        if (!homeTeamName || !awayTeamName) throw new Error("Teams are required for matches");
        homeTeamId = await upsertTeam(homeTeamName, homeLogo);
        awayTeamId = await upsertTeam(awayTeamName, awayLogo);
    } else {
        const PLACEHOLDER_TEAM_NAME = 'System_Placeholder_Team';
        const placeholderId = await upsertTeam(PLACEHOLDER_TEAM_NAME, null);
        homeTeamId = placeholderId;
        awayTeamId = placeholderId;
    }

    // Store Location Name and Address as JSON in location_text
    const locationData = JSON.stringify({
        name: locationName,
        address: locationAddress || 'Indirizzo non disponibile'
    });

    const { error } = await supabase.from('matches').insert({
        event_type: eventType,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: date.toISOString(),
        location_text: locationData,
        location_lat: locationLat,
        location_lng: locationLng,
        status: 'scheduled',
        competition_id: 'b13a8414-aa34-4cee-a7a3-fb6bb97bbee0'
    });

    if (error) throw error;
};
