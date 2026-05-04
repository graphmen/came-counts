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
    Users,
    ArrowLeft,
    CheckCircle2,
    RefreshCcw,
    AlertCircle,
    Radar,
    Globe,
    Zap,
    Info
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
            <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-10 relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl" />
                    <CheckCircle2 className="w-24 h-24 text-emerald-400 relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.5)]" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl font-display font-black text-white mb-6 uppercase tracking-tight">Telemetry Synced!</motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-slate-500 font-black text-sm uppercase tracking-[0.2em] max-w-md leading-relaxed">The observation has been verified and recorded in the {park?.name} digital archives.</motion.p>
            </div>
        );
    }

    const currentObs = formData.observations[0];

    return (
        <div className="min-h-screen bg-slate-950 text-white relative pb-32">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="bg-slate-900/50 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        <button 
                            className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-2xl backdrop-blur-md active:scale-95 group"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Radar size={14} className="text-emerald-500 animate-pulse" />
                                <h1 className="text-[11px] font-black text-white uppercase tracking-[0.4em] leading-none">Game Counts Surveillance</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={10} className="text-slate-600" />
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{park?.name || 'INITIALIZING SECTOR...'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                        {[
                            { id: 1, label: 'Taxa Selection', icon: Camera },
                            { id: 2, label: 'Herd Dynamics', icon: Users },
                            { id: 3, label: 'Geospatial Fix', icon: MapPin }
                        ].map((s) => (
                            <div key={s.id} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border ${step === s.id ? 'bg-emerald-600 text-white border-white/10 shadow-2xl shadow-emerald-600/30' : 'text-slate-600 border-transparent'}`}>
                                <s.icon size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:inline">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-8 pt-10 space-y-12">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"><Cat size={24} /></div>
                                    <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Classification Node</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {categories.map(cat => (
                                        <Card 
                                            key={cat.id}
                                            onClick={() => handleUpdateObservation(0, { classification: cat.id })}
                                            className={`cursor-pointer group transition-all duration-500 p-8 text-center space-y-6 rounded-[2.5rem] ${currentObs.classification === cat.id ? 'bg-emerald-600 border-white/20 shadow-2xl shadow-emerald-600/40 ring-1 ring-white/10' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/10 shadow-xl backdrop-blur-md'}`}
                                        >
                                            <div className={`mx-auto w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${currentObs.classification === cat.id ? 'bg-white text-emerald-600 shadow-2xl' : 'bg-white/5 text-slate-600 group-hover:bg-white/10 group-hover:text-slate-400'}`}>
                                                <cat.icon size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className={`text-[12px] font-black uppercase tracking-[0.3em] leading-none transition-colors ${currentObs.classification === cat.id ? 'text-white' : 'text-slate-400'}`}>{cat.id}</h4>
                                                <p className={`text-[9px] font-black uppercase tracking-widest transition-colors ${currentObs.classification === cat.id ? 'text-white/60' : 'text-slate-600'}`}>Aesthetic Protocol</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-2 ml-2">
                                    <Info size={12} className="text-slate-600" />
                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Species Precision Target</Label>
                                </div>
                                <div className="relative group">
                                    <select 
                                        className="w-full h-16 pl-8 pr-12 bg-slate-900/40 border border-white/5 rounded-3xl font-black text-[12px] text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none uppercase tracking-[0.2em] hover:bg-slate-900/60 cursor-pointer backdrop-blur-md shadow-2xl group-hover:border-white/10"
                                        value={currentObs.species}
                                        onChange={(e) => handleUpdateObservation(0, { species: e.target.value })}
                                    >
                                        <option value="" className="bg-slate-950">SELECT TARGET SPECIES...</option>
                                        {speciesList.filter(s => s.class === currentObs.classification.toLowerCase()).map(s => (
                                            <option key={s.id} value={s.common_name} className="bg-slate-950">{s.common_name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-emerald-500 transition-colors">
                                        <ChevronRight className="rotate-90" size={18} />
                                    </div>
                                </div>
                                {errors?.observations && <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20 inline-flex items-center gap-2 mt-2"><AlertCircle size={12} /> Precision Error: Target Species Selection Required</p>}
                            </section>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10"><Users size={24} /></div>
                                    <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Herd Dynamics Matrix</h2>
                                </div>

                                <Card className="overflow-hidden border-white/5 bg-slate-900/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-[3rem]">
                                    <div className="grid grid-cols-3 bg-white/[0.02] border-b border-white/5">
                                        <div className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Adult Population</div>
                                        <div className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center border-l border-r border-white/5">Sub-Adult Flux</div>
                                        <div className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Juvenile Nodes</div>
                                    </div>
                                    <div className="grid grid-cols-3 h-32">
                                        <input 
                                            type="number" min="0" className="w-full h-full text-center text-4xl font-display font-black text-white bg-transparent outline-none focus:bg-white/5 transition-all hover:bg-white/[0.01]"
                                            value={currentObs.count}
                                            onChange={(e) => handleUpdateObservation(0, { count: parseInt(e.target.value) || 0 })}
                                        />
                                        <input 
                                            type="number" min="0" className="w-full h-full text-center text-4xl font-display font-black text-white bg-transparent border-l border-r border-white/5 outline-none focus:bg-white/5 transition-all hover:bg-white/[0.01]"
                                            value={currentObs.adults}
                                            onChange={(e) => handleUpdateObservation(0, { adults: parseInt(e.target.value) || 0 })}
                                        />
                                        <input 
                                            type="number" min="0" className="w-full h-full text-center text-4xl font-display font-black text-white bg-transparent outline-none focus:bg-white/5 transition-all hover:bg-white/[0.01]"
                                            value={currentObs.juveniles}
                                            onChange={(e) => handleUpdateObservation(0, { juveniles: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="bg-emerald-600 px-12 py-8 flex justify-between items-center text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Zap size={14} className="text-white animate-pulse" />
                                                <h4 className="text-[12px] font-black uppercase tracking-[0.3em]">Tactical Composite</h4>
                                            </div>
                                            <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">Aggregated census telemetry verified.</p>
                                        </div>
                                        <div className="text-7xl font-display font-black drop-shadow-2xl relative z-10">{currentObs.count + currentObs.adults + currentObs.juveniles}</div>
                                    </div>
                                </Card>
                            </section>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                           <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10"><MapPin size={24} /></div>
                                    <h2 className="text-3xl font-display font-black text-white tracking-tight uppercase">Geospatial Fix</h2>
                                </div>

                                <Card className="p-10 space-y-10 bg-slate-900/40 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.4)] rounded-[3rem] backdrop-blur-xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                               <MapPin size={10} /> Survey Area Block
                                            </Label>
                                            <Input 
                                                value={formData.area_block} 
                                                onChange={(e) => setFormData({ ...formData, area_block: e.target.value })}
                                                className="h-16 bg-black/20 border-white/5 text-[12px] font-black text-white focus:ring-2 focus:ring-emerald-500 rounded-2xl uppercase tracking-[0.2em] shadow-inner placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                               <Calendar size={10} /> Log Timestamp
                                            </Label>
                                            <Input 
                                                type="date"
                                                value={formData.survey_date} 
                                                onChange={(e) => setFormData({ ...formData, survey_date: e.target.value })}
                                                className="h-16 bg-black/20 border-white/5 text-[12px] font-black text-white focus:ring-2 focus:ring-emerald-500 rounded-2xl uppercase tracking-[0.2em] shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                           <Info size={10} /> Technician Recon Notes
                                        </Label>
                                        <textarea 
                                            className="w-full min-h-[180px] p-8 bg-black/20 border border-white/5 rounded-[2rem] font-black text-[12px] text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-800 uppercase tracking-[0.2em] shadow-inner resize-none"
                                            placeholder="ENVIRONMENTAL CONDITIONS, HERD HEALTH, ANOMALIES..."
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
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-slate-900/80 backdrop-blur-3xl border-t border-white/5 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-8">
                    {step > 1 ? (
                        <Button 
                            variant="outline" 
                            className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] gap-4 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all shadow-xl" 
                            onClick={handleBack}
                        >
                            <ChevronLeft size={20} /> Back
                        </Button>
                    ) : <div className="w-32 hidden sm:block" />}

                    <div className="flex gap-4 w-full sm:w-auto">
                        {step < 3 ? (
                            <Button 
                                className="w-full sm:w-auto h-16 px-16 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] gap-4 bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all border border-white/10" 
                                onClick={handleNext}
                            >
                                Next Module <ChevronRight size={20} />
                            </Button>
                        ) : (
                            <Button 
                                disabled={isSubmitting} 
                                className="w-full sm:w-auto h-16 px-20 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] gap-4 bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all" 
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? <RefreshCcw className="animate-spin" size={20} /> : <><Save size={20} /> Deploy Telemetry</>}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
