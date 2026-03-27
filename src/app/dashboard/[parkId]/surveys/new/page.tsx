'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, 
    MapPin, 
    ChevronRight, 
    ChevronLeft, 
    Save, 
    Bird, 
    Cat, 
    Bug, 
    Activity, 
    Trees,
    Compass,
    Users,
    ArrowLeft,
    CheckCircle2,
    Database,
    RefreshCcw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const categories = [
    { id: 'Mammal', icon: Cat, color: 'from-emerald-600 to-teal-700', bg: 'bg-emerald-50', text: 'text-emerald-700', shadow: 'shadow-emerald-200' },
    { id: 'Bird', icon: Bird, color: 'from-sky-600 to-indigo-700', bg: 'bg-sky-50', text: 'text-sky-700', shadow: 'shadow-sky-200' },
    { id: 'Reptile', icon: Bug, color: 'from-amber-600 to-orange-700', bg: 'bg-amber-50', text: 'text-amber-700', shadow: 'shadow-amber-200' },
];

const fadeUp: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const stagger: any = {
    show: { transition: { staggerChildren: 0.1 } }
};

export default function NewSurveyPage() {
    const { parkId } = useParams();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [parkName, setParkName] = useState('');
    const [speciesList, setSpeciesList] = useState<any[]>([]);

    const [form, setForm] = useState({
        classification: 'Mammal',
        speciesId: '',
        otherSpecies: '',
        photo: null as any,
        adult_m: 0, adult_f: 0, adult_u: 0,
        sub_adult_m: 0, sub_adult_f: 0, sub_adult_u: 0,
        juv_m: 0, juv_f: 0, juv_u: 0,
        lat: '', long: '', accuracy: '',
        distance: '', bearing: '',
        activity: '', habitat: ''
    });

    useEffect(() => {
        const fetchContext = async () => {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parkId as string);
            const { data: park } = await supabase
                .from('parks')
                .select('name')
                .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? parkId : `%${(parkId as string).replace(/-/g, ' ')}%`)
                .single();
            if (park) setParkName(park.name);

            const { data: species } = await supabase.from('species').select('*').order('common_name');
            if (species) setSpeciesList(species);
        };
        fetchContext();
    }, [parkId]);

    const totalGroupSize = 
        Number(form.adult_m) + Number(form.adult_f) + Number(form.adult_u) +
        Number(form.sub_adult_m) + Number(form.sub_adult_f) + Number(form.sub_adult_u) +
        Number(form.juv_m) + Number(form.juv_f) + Number(form.juv_u);

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => router.push(`/dashboard/${parkId}`), 2500);
        }, 1800);
    };

    if (isSuccess) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: '#f8fafc', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ marginBottom: 24, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: '#dcfce7', borderRadius: '50%', filter: 'blur(30px)', opacity: 0.5 }} />
                    <CheckCircle2 style={{ width: 96, height: 96, color: 'var(--wez-green)', position: 'relative', zIndex: 10 }} />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>Observation Synced!</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ color: '#64748b', fontWeight: 700, maxWidth: 400 }}>Data has been successfully recorded in the central database for {parkName}.</motion.p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', position: 'relative' }}>
            {/* Elite Background Decor */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.3, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(26,101,52,0.1) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(2,132,199,0.1) 0%, transparent 70%)' }} />
            </div>

            {/* Header Module */}
            <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => router.back()} className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 8 }}>
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Field Data Entry</h1>
                            <p style={{ fontSize: 10, color: 'var(--wez-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{parkName || 'Loading Area...'}</p>
                        </div>
                    </div>

                    {/* Elite Stepper Fallback */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', padding: 6, borderRadius: 12, border: '1px solid #e2e8f0', marginLeft: 'auto' }}>
                        {[
                            { id: 1, label: 'Sighting', icon: Camera },
                            { id: 2, label: 'Population', icon: Users },
                            { id: 3, label: 'Geodata', icon: MapPin }
                        ].map((s) => (
                            <div key={s.id} className={`stepper-item ${step === s.id ? 'active' : ''}`} style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                                <s.icon size={14} />
                                <span style={{ fontSize: 10, fontWeight: 800 }}>{s.label.toUpperCase()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 100px', position: 'relative', zIndex: 10 }}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <motion.section variants={fadeUp}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <div style={{ padding: 8, background: 'var(--wez-green)', borderRadius: 8, color: 'white' }}><Cat size={18} /></div>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>What did you see?</h3>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setForm({ ...form, classification: cat.id })}
                                            className="category-card"
                                            style={{ 
                                                background: form.classification === cat.id ? 'white' : 'rgba(255,255,255,0.6)',
                                                borderColor: form.classification === cat.id ? 'var(--wez-green)' : '#e2e8f0',
                                                borderWidth: 2,
                                                borderStyle: 'solid',
                                                boxShadow: form.classification === cat.id ? '0 10px 30px rgba(26,122,74,0.1)' : 'none',
                                                transform: form.classification === cat.id ? 'translateY(-4px)' : 'none'
                                            }}
                                        >
                                            <div style={{ 
                                                padding: 16, 
                                                borderRadius: 12, 
                                                background: form.classification === cat.id ? 'var(--wez-green)' : '#f1f5f9',
                                                color: form.classification === cat.id ? 'white' : '#94a3b8',
                                                marginBottom: 16,
                                                transition: 'all 0.3s'
                                            }}>
                                                <cat.icon size={32} />
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{cat.id}</div>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginTop: 4 }}>Field Records</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4 }}>Species from Database</label>
                                            <select 
                                                className="form-input"
                                                value={form.speciesId}
                                                onChange={(e) => setForm({ ...form, speciesId: e.target.value })}
                                                style={{ height: 56, fontWeight: 700 }}
                                            >
                                                <option value="">Choose Recorded Taxon...</option>
                                                {speciesList.filter(s => s.class === form.classification.toLowerCase()).map(s => (
                                                    <option key={s.id} value={s.id}>{s.common_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4 }}>Other / Specific Variety</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Rare sighting note..."
                                                className="form-input"
                                                value={form.otherSpecies}
                                                onChange={(e) => setForm({ ...form, otherSpecies: e.target.value })}
                                                style={{ height: 56, fontWeight: 700 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            <motion.section variants={fadeUp}>
                                <div className="glass-card" style={{ padding: 60, borderStyle: 'dashed', borderWidth: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.4)' }}>
                                    <div style={{ padding: 16, background: 'white', borderRadius: 24, boxShadow: '0 10px 20px rgba(0,0,0,0.05)', color: 'var(--wez-green)' }}>
                                        <Camera size={32} />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Capture Visual Evidence</div>
                                        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Standard ZEWC protocol photo for AI validation</p>
                                    </div>
                                </div>
                            </motion.section>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ padding: 8, background: 'var(--wez-green)', borderRadius: 8, color: 'white' }}><Users size={18} /></div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Population & Activity</h3>
                            </div>

                            <div className="glass-card" style={{ overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th style={{ padding: 24 }}>Stage</th>
                                            <th style={{ padding: 24, textAlign: 'center', background: 'rgba(26,122,74,0.03)' }}>Male</th>
                                            <th style={{ padding: 24, textAlign: 'center', background: 'rgba(2,132,199,0.03)' }}>Female</th>
                                            <th style={{ padding: 24, textAlign: 'center' }}>Unclassified</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderTop: '1px solid #f1f5f9' }}>
                                        {[
                                            { label: 'Adult', keys: ['adult_m', 'adult_f', 'adult_u'] },
                                            { label: 'Sub-Adult', keys: ['sub_adult_m', 'sub_adult_f', 'sub_adult_u'] },
                                            { label: 'Juvenile', keys: ['juv_m', 'juv_f', 'juv_u'] }
                                        ].map((row) => (
                                            <tr key={row.label}>
                                                <td style={{ padding: 24 }}>
                                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{row.label}</div>
                                                    <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Verified Phase</div>
                                                </td>
                                                {row.keys.map((key) => (
                                                    <td key={key} style={{ padding: 16 }}>
                                                        <input 
                                                            type="number" min="0"
                                                            className="form-input"
                                                            style={{ textAlign: 'center', fontWeight: 900, fontSize: 18, height: 48, background: '#f8fafc' }}
                                                            value={(form as any)[key]}
                                                            onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <div style={{ background: '#0f172a', padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--wez-green-light)', letterSpacing: 2 }}>Total Herd Dynamics</div>
                                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Aggregate sighting size across all age sets.</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 40, fontWeight: 900 }}>{totalGroupSize}</div>
                                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Individuals</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div className="glass-card" style={{ padding: 32 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <Activity size={18} style={{ color: 'var(--wez-green)' }} />
                                        <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>Primary Activity</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {['Eating/Foraging', 'Standing/Resting', 'Movement', 'Drinking'].map(act => (
                                            <button
                                                key={act}
                                                onClick={() => setForm({ ...form, activity: act })}
                                                className="btn-secondary"
                                                style={{ 
                                                    padding: '8px 16px', 
                                                    fontSize: 11, 
                                                    fontWeight: 800, 
                                                    background: form.activity === act ? '#0f172a' : 'white',
                                                    color: form.activity === act ? 'white' : '#64748b',
                                                    borderColor: form.activity === act ? '#0f172a' : '#e2e8f0'
                                                }}
                                            >
                                                {act.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: 32 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <Trees size={18} style={{ color: 'var(--wez-green)' }} />
                                        <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>Habitat Profile</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {['Open Grassland', 'Sparse Woodland', 'Dense Thicket', 'Riverine'].map(hab => (
                                            <button
                                                key={hab}
                                                onClick={() => setForm({ ...form, habitat: hab })}
                                                className="btn-secondary"
                                                style={{ 
                                                    padding: '8px 16px', 
                                                    fontSize: 11, 
                                                    fontWeight: 800, 
                                                    background: form.habitat === hab ? 'var(--wez-green)' : 'white',
                                                    color: form.habitat === hab ? 'white' : '#64748b',
                                                    borderColor: form.habitat === hab ? 'var(--wez-green)' : '#e2e8f0'
                                                }}
                                            >
                                                {hab.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ padding: 8, background: 'var(--wez-green)', borderRadius: 8, color: 'white' }}><MapPin size={18} /></div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Spatial Intelligence</h3>
                            </div>

                            <div className="glass-card" style={{ padding: 40, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Latitude Fix</label>
                                                <input 
                                                    className="form-input"
                                                    value={form.lat}
                                                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                                                    placeholder="-15.7585"
                                                    style={{ height: 64, fontSize: 18, fontWeight: 800, background: 'white' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Longitude Fix</label>
                                                <input 
                                                    className="form-input"
                                                    value={form.long}
                                                    onChange={(e) => setForm({ ...form, long: e.target.value })}
                                                    placeholder="29.2927"
                                                    style={{ height: 64, fontSize: 18, fontWeight: 800, background: 'white' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Accuracy Buffer (M)</label>
                                                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--wez-green)' }}>{form.accuracy || 0}m</span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="50"
                                                style={{ width: '100%', accentColor: 'var(--wez-green)' }}
                                                value={form.accuracy}
                                                onChange={(e) => setForm({ ...form, accuracy: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, background: 'rgba(255,255,255,0.4)', borderRadius: 24, border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Observed Distance (Meters)</label>
                                            <input 
                                                type="number"
                                                className="form-input"
                                                value={form.distance}
                                                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                                                style={{ height: 64, fontSize: 24, fontWeight: 900, color: 'var(--wez-green)' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Sight Bearing (Degrees)</label>
                                            <input 
                                                type="number"
                                                className="form-input"
                                                value={form.bearing}
                                                onChange={(e) => setForm({ ...form, bearing: e.target.value })}
                                                style={{ height: 64, fontSize: 24, fontWeight: 900, color: '#3b82f6' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Float Action Bar Fallback */}
            <div className="float-action-bar" style={{ maxWidth: 600, margin: '0 auto' }}>
                {step > 1 ? (
                    <button onClick={handleBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}>
                        <ChevronLeft size={18} /> Prev Step
                    </button>
                ) : <div style={{ width: 100 }} />}

                <div style={{ display: 'flex', gap: 12 }}>
                    {step < 3 ? (
                        <button onClick={handleNext} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 32px' }}>
                            Next Module <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 40px', background: 'linear-gradient(90deg, #166534, #1a7a4a)' }}>
                            {isSubmitting ? <RefreshCcw className="animate-spin" size={20} /> : <><Save size={20} /> Sync Observation</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

