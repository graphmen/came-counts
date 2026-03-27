export interface Park {
    id: string;
    name: string;
    region: string;
    description: string;
    area_ha: number;
    latitude: number;
    longitude: number;
    is_active: boolean;
}

export interface Species {
    id: string;
    common_name: string;
    scientific_name: string;
    class: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'other';
    category: 'herbivore' | 'carnivore' | 'omnivore' | 'primate' | 'bird' | 'reptile' | 'other';
}

export interface Survey {
    id: string;
    park_id: string;
    year: number;
    season: string;
    start_date: string;
    end_date: string;
    total_volunteers: number;
    num_transects_covered: number;
    num_static_sites: number;
    notes: string;
    status: 'draft' | 'submitted' | 'approved';
}

export interface SpeciesSummaryRow {
    species: string;
    class: string;
    category: string;
    total_count: number;
    male_count: number;
    female_count: number;
    unknown_sex_count: number;
}

export interface HistoricalCount {
    species_id: string;
    year: number;
    total_count: number;
}

export interface StaticSite {
    id: string;
    name: string;
    site_type: string;
    latitude: number;
    longitude: number;
}
