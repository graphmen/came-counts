export const WILDLIFE_METADATA: Record<string, { emoji: string; color: string; bgLight: string }> = {
    'Impala': { emoji: '🦌', color: '#f59e0b', bgLight: '#fffbeb' },
    'Elephant': { emoji: '🐘', color: '#7c3aed', bgLight: '#f5f3ff' },
    'Cape Buffalo': { emoji: '🐃', color: '#059669', bgLight: '#ecfdf5' },
    'Zebra': { emoji: '🦓', color: '#2563eb', bgLight: '#eff6ff' },
    'Waterbuck': { emoji: '🦬', color: '#0891b2', bgLight: '#ecfeff' },
    'Baboon': { emoji: '🐒', color: '#db2777', bgLight: '#fdf2f8' },
    'Eland': { emoji: '🦣', color: '#b45309', bgLight: '#fef3c7' },
    'Greater Kudu': { emoji: '🦒', color: '#16a34a', bgLight: '#f0fdf4' },
    'Hippopotamus': { emoji: '🦛', color: '#475569', bgLight: '#f8fafc' },
    'Warthog': { emoji: '🐗', color: '#92400e', bgLight: '#fffbeb' },
    'Lion': { emoji: '🦁', color: '#ea580c', bgLight: '#fff7ed' },
    'Leopard': { emoji: '🐆', color: '#ca8a04', bgLight: '#fefce8' },
    'Spotted Hyena': { emoji: '🐺', color: '#57534e', bgLight: '#fafaf9' },
    'Wild Dog': { emoji: '🐕', color: '#9a3412', bgLight: '#fff7ed' },
    'Sable': { emoji: '🐂', color: '#1e293b', bgLight: '#f8fafc' },
};

export const DEFAULT_WILDLIFE = { emoji: '🐾', color: '#1a7a4a', bgLight: '#f0fdf4' };

export const getWildlifeMetadata = (name: string) => {
    // Try exact match first
    if (WILDLIFE_METADATA[name]) return WILDLIFE_METADATA[name];

    // Try partial match (e.g. "Baboon (Chacma)" -> "Baboon")
    for (const key in WILDLIFE_METADATA) {
        if (name.includes(key)) return WILDLIFE_METADATA[key];
    }

    return DEFAULT_WILDLIFE;
};
