-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMS
create type competition_tier as enum (
  'serie_d', 'eccellenza', 'promozione', 'prima_categoria', 
  'seconda_categoria', 'terza_categoria', 
  'juniores_nazionale', 'juniores_regionale', 'juniores_provinciale',
  'allievi', 'giovanissimi', 'esordienti', 'pulcini'
);

create type surface_type as enum ('erba_naturale', 'sintetico', 'terra_battuta');

create type player_role as enum ('portiere', 'difensore', 'centrocampista', 'attaccante');

create type contract_type as enum ('volontario', 'lavoratore_sportivo_cococo', 'professionista');

create type match_event_type as enum (
  'goal', 'assist', 'yellow_card', 'red_card', 
  'sub_in', 'sub_out', 'missed_penalty', 'save'
);

create type event_type as enum ('match', 'training');

-- 1. COMPETITIONS (Campionati)
create table competitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null, -- e.g. "Eccellenza Girone A"
  season_code text not null, -- e.g. "2025-26"
  tier competition_tier not null,
  organizer text not null, -- e.g. "CRL Lombardia"
  roster_constraints jsonb default '{}'::jsonb, -- Rules for "fuoriquota"
  created_at timestamptz default now()
);

-- 2. CLUBS (Società Sportive)
create table clubs (
  matricola text primary key, -- 6 digit FIGC code
  legal_name text not null, -- "A.S.D. Virtus..."
  commercial_name text, -- "Virtus Lanciano"
  founding_year int,
  tax_code text, -- Codice Fiscale / P.IVA
  president_name text,
  address_legal text,
  address_field text,
  field_surface surface_type,
  has_lights boolean default false,
  lighting_lux int, -- Power of lights
  tribune_capacity int,
  logo_url text,
  website text,
  created_at timestamptz default now()
);

-- 3. TEAMS (Squadre - Emanazioni della società)
create table teams (
  id uuid primary key default uuid_generate_v4(),
  club_matricola text references clubs(matricola) on delete cascade not null,
  name text not null, -- e.g. "Prima Squadra", "Juniores"
  category competition_tier, -- Category of this specific team
  primary_color text, -- Hex code
  secondary_color text, -- Hex code
  created_at timestamptz default now()
);

-- 4. PEOPLE (Anagrafica Persone - Giocatori/Staff)
create table people (
  figc_id text primary key, -- Unique FIGC code
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  birth_place text,
  nationality text default 'ITA',
  height_cm int,
  weight_kg int,
  preferred_foot text check (preferred_foot in ('dx', 'sx', 'ambidestro')),
  role_primary player_role,
  role_specific text, -- e.g. "Trequartista"
  photo_url text,
  created_at timestamptz default now()
);

-- 5. MEMBERSHIPS (Tesseramenti)
create table memberships (
  id uuid primary key default uuid_generate_v4(),
  person_figc_id text references people(figc_id) not null,
  team_id uuid references teams(id) not null,
  season_code text not null,
  role text not null default 'player', -- 'player', 'coach', 'manager'
  shirt_number int,
  contract_type contract_type default 'volontario',
  contract_start date,
  contract_end date,
  medical_expiry date,
  is_disqualified boolean default false,
  created_at timestamptz default now(),
  unique(person_figc_id, team_id, season_code) -- No double registration in same team/season
);

-- 6. MATCHES (Partite)
create table matches (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references competitions(id),
  event_type event_type default 'match',
  home_team_id uuid references teams(id) not null,
  away_team_id uuid references teams(id) not null,
  match_date timestamptz not null,
  location_text text, -- e.g. "Campo Comunale X"
  location_lat float,
  location_lng float,
  status text default 'scheduled', -- 'scheduled', 'live', 'finished', 'postponed'
  home_score int default 0,
  away_score int default 0,
  weather_snapshot jsonb, -- Store weather info at match time
  referee_name text,
  created_at timestamptz default now()
);

-- 7. MATCH LINEUPS (Distinte)
create table match_lineups (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade not null,
  team_id uuid references teams(id) not null,
  person_figc_id text references people(figc_id) not null,
  is_starter boolean default false,
  is_captain boolean default false,
  shirt_number int,
  created_at timestamptz default now(),
  unique(match_id, person_figc_id)
);

-- 8. MATCH EVENTS (Tabellino & Video Analisi)
create table match_events (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade not null,
  minute int not null,
  additional_time int default 0,
  event_type match_event_type not null,
  main_player_id text references people(figc_id), -- Scorer, Card receiver, Player IN
  secondary_player_id text references people(figc_id), -- Assist provider, Player OUT
  video_timestamp_seconds float, -- Link to specific second in video
  meta_json jsonb default '{}'::jsonb, -- coords: {x, y}, description: "Tiro a giro"
  created_at timestamptz default now()
);

-- RLS POLICIES (Basic Public Access for LND App Context)
alter table competitions enable row level security;
alter table clubs enable row level security;
alter table teams enable row level security;
alter table people enable row level security;
alter table memberships enable row level security;
alter table matches enable row level security;
alter table match_lineups enable row level security;
alter table match_events enable row level security;

-- Allow read access to everything for authenticated users (or public for now)
create policy "Public read access" on competitions for select using (true);
create policy "Public read access" on clubs for select using (true);
create policy "Public read access" on teams for select using (true);
create policy "Public read access" on people for select using (true);
create policy "Public read access" on memberships for select using (true);
create policy "Public read access" on matches for select using (true);
create policy "Public read access" on match_lineups for select using (true);
create policy "Public read access" on match_events for select using (true);

-- Insert Mock Data
insert into clubs (matricola, legal_name, commercial_name, field_surface) values 
('100001', 'A.S.D. Real Vattelapesca', 'Real Vattelapesca', 'erba_naturale'),
('100002', 'F.C. MyTeam 2025', 'MyTeam', 'sintetico');

insert into teams (club_matricola, name, category, primary_color) values
('100001', 'Prima Squadra', 'eccellenza', '#FF0000'), -- Home Team Placeholder (Real)
('100002', 'Prima Squadra', 'eccellenza', '#2E7D32'), -- Away Team Placeholder (MyTeam)
('100001', 'System_Placeholder_Team', 'terza_categoria', '#CCCCCC'); -- WORKAROUND for Training

-- Mock Person
insert into people (figc_id, first_name, last_name, birth_date, role_primary) values
('MR1990', 'Mario', 'Rossi', '1990-01-01', 'attaccante');

-- Mock Match (Next Event)
-- Single Event Architecture: We insert ONE event (Match)
insert into matches (
  event_type,
  home_team_id, 
  away_team_id, 
  match_date, 
  location_text
) values (
  'match',
  (select id from teams where name = 'Prima Squadra' and club_matricola = '100001' limit 1),
  (select id from teams where name = 'Prima Squadra' and club_matricola = '100002' limit 1),
  now() + interval '2 days',
  'Campo Sportivo Comunale'
);

