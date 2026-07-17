export const WILDLIFE_METADATA: Record<string, { emoji: string; color: string; bgLight: string }> = {
    'Impala': { emoji: '🦌', color: '#f59e0b', bgLight: 'bg-amber-50' },
    'Elephant': { emoji: '🐘', color: '#7c3aed', bgLight: 'bg-violet-50' },
    'Cape Buffalo': { emoji: '🐃', color: '#059669', bgLight: 'bg-emerald-50' },
    'Zebra': { emoji: '🦓', color: '#2563eb', bgLight: 'bg-blue-50' },
    'Waterbuck': { emoji: '🦌', color: '#0891b2', bgLight: 'bg-cyan-50' }, // Antelope family
    'Baboon': { emoji: '🐒', color: '#db2777', bgLight: 'bg-pink-50' },
    'Eland': { emoji: '🐂', color: '#c46a14', bgLight: 'bg-orange-50' }, // Large bovine-like antelope
    'Greater Kudu': { emoji: '🦌', color: '#16a34a', bgLight: 'bg-green-50' }, // Antelope family
    'Hippopotamus': { emoji: '🦛', color: '#475569', bgLight: 'bg-slate-50' },
    'Warthog': { emoji: '🐗', color: '#92400e', bgLight: 'bg-amber-50' },
    'Lion': { emoji: '🦁', color: '#ea580c', bgLight: 'bg-orange-50' },
    'Leopard': { emoji: '🐆', color: '#ca8a04', bgLight: 'bg-yellow-50' },
    'Spotted Hyena': { emoji: '🐺', color: '#57534e', bgLight: 'bg-stone-50' }, // Closest predator
    'Wild Dog': { emoji: '🐕', color: '#9a3412', bgLight: 'bg-orange-50' },
    'Sable': { emoji: '🦌', color: '#1e293b', bgLight: 'bg-slate-50' },
    'Nile Crocodile': { emoji: '🐊', color: '#047857', bgLight: 'bg-emerald-50' },
};

export const DEFAULT_WILDLIFE = { emoji: '🐾', color: '#1a7a4a', bgLight: 'bg-green-50' };

export const getWildlifeMetadata = (name: string) => {
    // Try exact match first
    if (WILDLIFE_METADATA[name]) return WILDLIFE_METADATA[name];

    // Try partial match (e.g. "Baboon (Chacma)" -> "Baboon")
    for (const key in WILDLIFE_METADATA) {
        if (name.includes(key)) return WILDLIFE_METADATA[key];
    }

    return DEFAULT_WILDLIFE;
};
