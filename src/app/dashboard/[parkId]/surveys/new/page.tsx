'use client';

export const dynamic = 'force-dynamic';

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
    Users,
    ArrowLeft,
    CheckCircle2,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';
import { gc, supabase } from '@/lib/supabase';
import { submitSurvey } from '@/app/actions';
import { WildlifeSurveySchema } from '@/lib/schemas/survey';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const categories = [
    { id: 'Mammal', icon: Cat, color: 'emerald' },
    { id: 'Bird', icon: Bird, color: 'sky' },
    { id: 'Reptile', icon: Bug, color: 'amber' },
];

export default function NewSurveyPage({ params }: { params: Promise<{ parkId: string }> }) {
    const { parkId } = React.use(params);
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [park, setPark] = useState<any>(null);
    const [speciesList, setSpeciesList] = useState<any[]>([]);
    const [errors, setErrors] = useState<any>(null);

    const [formData, setFormData] = useState<any>({
        park_id: '',
        survey_date: new Date().toISOString().split('T')[0],
        observers: ['Field Agent'],
        area_block: '',
        observations: [{
            species: '',
            count: 0,
            adults: 0,
            juveniles: 0,
            notes: '',
            classification: 'Mammal'
        }]
    });

    useEffect(() => {
        const fetchContext = async () => {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parkId as string);
            const { data: pData } = await supabase
                .from('parks')
                .select('*')
                .filter(isUUID ? 'id' : 'name', isUUID ? 'eq' : 'ilike', isUUID ? parkId : `%${(parkId as string).replace(/-/g, ' ')}%`)
                .single();
            if (pData) {
                setPark(pData);
                setFormData((prev: any) => ({ ...prev, park_id: pData.id, area_block: pData.name + ' Central' }));
            }

            const { data: species } = await supabase.from('species').select('*').order('common_name');
            if (species) setSpeciesList(species);
        };
        fetchContext();
    }, [parkId]);

    const handleUpdateObservation = (index: number, updates: any) => {
        const newObs = [...formData.observations];
        newObs[index] = { ...newObs[index], ...updates };
        setFormData({ ...formData, observations: newObs });
    };

    const handleNext = () => {
        // Simple step-level validation
        if (step === 1 && !formData.observations[0].species) {
            setErrors({ observations: { 0: { species: "Select a species" } } });
            return;
        }
        setErrors(null);
        setStep(s => Math.min(s + 1, 3));
    };

    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors(null);

        const result = await submitSurvey(formData);
        
        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => router.push(`/dashboard/${parkId}`), 2500);
        } else {
            setErrors(result.error);
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8 relative">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-50" />
                    <CheckCircle2 className="w-24 h-24 text-emerald-600 relative z-10" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl font-display font-black text-slate-900 mb-4">Observation Synced!</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-slate-500 font-bold max-w-md">The telemetry has been verified and recorded in the {park?.name} archives.</motion.p>
            </div>
        );
    }

    const currentObs = formData.observations[0];

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 overflow-hidden">
                {/* Decorative Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Field Command Alpha</h1>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{park?.name || 'Loading...'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {[
                            { id: 1, label: 'Taxa', icon: Camera },
                            { id: 2, label: 'Herd', icon: Users },
                            { id: 3, label: 'Geo', icon: MapPin }
                        ].map((s) => (
                            <div key={s.id} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${step === s.id ? 'bg-white shadow-sm text-emerald-600 border border-emerald-100' : 'text-slate-400'}`}>
                                <s.icon size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 pt-6 space-y-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-600 rounded-lg text-white"><Cat size={16} /></div>
                                    <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Classification</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {categories.map(cat => (
                                        <Card 
                                            key={cat.id}
                                            onClick={() => handleUpdateObservation(0, { classification: cat.id })}
                                            className={`cursor-pointer group hover:border-emerald-500 transition-all p-4 text-center space-y-3 ${currentObs.classification === cat.id ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' : 'border-slate-200'}`}
                                        >
                                            <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center transition-all ${currentObs.classification === cat.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                <cat.icon size={24} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-display font-black text-slate-900 uppercase tracking-tight">{cat.id}</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Mode</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Species Precision Target</Label>
                                <div className="relative">
                                    <select 
                                        className="w-full h-12 pl-4 pr-10 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                                        value={currentObs.species}
                                        onChange={(e) => handleUpdateObservation(0, { species: e.target.value })}
                                    >
                                        <option value="">Select Target Species...</option>
                                        {speciesList.filter(s => s.class === currentObs.classification.toLowerCase()).map(s => (
                                            <option key={s.id} value={s.common_name}>{s.common_name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={14} />
                                </div>
                                {errors?.observations && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest px-1 flex items-center gap-1"><AlertCircle size={10} /> Precision Error: Selection required</p>}
                            </section>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-600 rounded-lg text-white"><Users size={16} /></div>
                                    <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Herd Dynamics</h2>
                                </div>

                                <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="grid grid-cols-3 bg-slate-50/50 border-b border-slate-100">
                                        <div className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Adults</div>
                                        <div className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center border-l border-r border-slate-100">Sub-Adults</div>
                                        <div className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Juveniles</div>
                                    </div>
                                    <div className="grid grid-cols-3 h-20">
                                        <input 
                                            type="number" min="0" className="w-full h-full text-center text-xl font-display font-black text-slate-900 outline-none focus:bg-emerald-50 transition-colors"
                                            value={currentObs.count}
                                            onChange={(e) => handleUpdateObservation(0, { count: parseInt(e.target.value) || 0 })}
                                        />
                                        <input 
                                            type="number" min="0" className="w-full h-full text-center text-xl font-display font-black text-slate-900 border-l border-r border-slate-100 outline-none focus:bg-emerald-50 transition-colors"
                                            value={currentObs.adults}
                                            onChange={(e) => handleUpdateObservation(0, { adults: parseInt(e.target.value) || 0 })}
                                        />
                                        <input 
                                            type="number" min="0" className="w-full h-full text-center text-xl font-display font-black text-slate-900 outline-none focus:bg-emerald-50 transition-colors"
                                            value={currentObs.juveniles}
                                            onChange={(e) => handleUpdateObservation(0, { juveniles: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
                                        <div>
                                            <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Tactical Composite</h4>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Aggregated census telemetry.</p>
                                        </div>
                                        <div className="text-3xl font-display font-black text-emerald-400">{currentObs.count + currentObs.adults + currentObs.juveniles}</div>
                                    </div>
                                </Card>
                            </section>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                           <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-600 rounded-lg text-white"><MapPin size={16} /></div>
                                    <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">Geospatial Fix</h2>
                                </div>

                                <Card className="p-6 space-y-6 border-slate-200 shadow-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Survey Area Block</Label>
                                            <Input 
                                                value={formData.area_block} 
                                                onChange={(e) => setFormData({ ...formData, area_block: e.target.value })}
                                                className="h-11 text-sm font-bold border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Log Timestamp</Label>
                                            <Input 
                                                type="date"
                                                value={formData.survey_date} 
                                                onChange={(e) => setFormData({ ...formData, survey_date: e.target.value })}
                                                className="h-11 text-sm font-bold border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Technician Notes</Label>
                                        <textarea 
                                            className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Environmental conditions, herd health, particular sightings..."
                                            value={currentObs.notes}
                                            onChange={(e) => handleUpdateObservation(0, { notes: e.target.value })}
                                        />
                                    </div>
                                </Card>
                           </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* ActionBar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    {step > 1 ? (
                        <Button variant="outline" className="h-11 px-6 rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 border-slate-200" onClick={handleBack}>
                            <ChevronLeft size={14} /> Back
                        </Button>
                    ) : <div className="w-24 hidden sm:block" />}

                    <div className="flex gap-3 w-full sm:w-auto">
                        {step < 3 ? (
                            <Button className="w-full sm:w-auto h-11 px-10 rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100" onClick={handleNext}>
                                Next Module <ChevronRight size={14} />
                            </Button>
                        ) : (
                            <Button 
                                disabled={isSubmitting} 
                                className="w-full sm:w-auto h-11 px-12 rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 bg-slate-900 hover:bg-black shadow-lg" 
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? <RefreshCcw className="animate-spin" size={16} /> : <><Save size={16} /> Deploy Telemetry</>}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

