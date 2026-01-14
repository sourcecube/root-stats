// Root board game data

export const factions = [
    // Base game
    'Marquise de Cat',
    'Eyrie Dynasties',
    'Woodland Alliance',
    'Vagabond',
    // Riverfolk Expansion
    'Riverfolk Company',
    'Lizard Cult',
    'Second Vagabond',
    // Underworld Expansion
    'Underground Duchy',
    'Corvid Conspiracy',
    // Marauder Expansion
    'Lord of the Hundreds',
    'Keepers in Iron'
] as const;

export const maps = [
    'Autumn (Fall)',
    'Winter',
    'Lake',
    'Mountain'
] as const;

export const landmarks = [
    'Tower',
    'Ferry',
    'Treetop',
    'City',
    'Forge',
    'Market',
    'Elder Treetop',
    'Lost City',
    'Black Market'
] as const;

export const hirelings = [
    // Base Hirelings
    'Riverfolk Flotilla',
    'Warm Sun Prophets',
    'The Exiled',
    'Street Band',
    'Flame Bearers',
    'Bandit Gangs',
    // Marauder Hirelings
    'Rat Smugglers',
    'Badger Bodyguards',
    'Corvid Spies',
    'Mole Artisans',
    'Rabbit Scouts',
    'Last Dynasty',
    'Forest Patrol',
    'Furious Protector',
    'Highway Bandits',
    'Popular Band',
    'Spring Uprising',
    'Sunward Expedition',
    'Vault Keepers'
] as const;

export type Faction = typeof factions[number];
export type Map = typeof maps[number];
export type Landmark = typeof landmarks[number];
export type Hireling = typeof hirelings[number];
