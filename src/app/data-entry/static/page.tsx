'use client';

import React, { useEffect, useState } from 'react';
import { gc } from '@/lib/supabase';
import { Species, Park, Survey, StaticSite } from '@/types';
import { Droplets, Plus, Save, Trash2, Clock } from 'lucide-react';

export default function StaticEntryPage() {
    const [species, setSpecies] = useState<Species[]>([]);
    const [parks, setParks] = useState<Park[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [sites, setSites] = useState<StaticSite[]>([]);

    const [selectedPark, setSelectedPark] = useState('');
    const [selectedSurvey, setSelectedSurvey] = useState('');
    const [selectedSite, setSelectedSite] = useState('');

    const [observations, setObservations] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        gc.from('parks').select('*').then(({ data }) => setParks(data || []));
        gc.from('species').select('*').order('common_name').then(({ data }) => setSpecies(data || []));
    }, []);

    useEffect(() => {
        if (selectedPark) {
            gc.from('surveys').select('*').eq('park_id', selectedPark).then(({ data }) => setSurveys(data || []));
            gc.from('static_sites').select('*').eq('park_id', selectedPark).then(({ data }) => setSites(data || []));
        }
    }, [selectedPark]);

    const addObservation = () => {
        setObservations([...observations, {
            species_id: '',
            count: 1,
            sex: 'unknown',
            age_class: 'adult',
            observation_hour: 12,
            observation_date: new Date().toISOString().split('T')[0]
        }]);
    };

    const removeObservation = (index: number) => {
        setObservations(observations.filter((_, i) => i !== index));
    };

    const updateObservation = (index: number, field: string, value: any) => {
        const newObs = [...observations];
        newObs[index][field] = value;
        setObservations(newObs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSurvey || !selectedSite || observations.length === 0) return;

        setSubmitting(true);
        try {
            const toInsert = observations.map(obs => ({
                survey_id: selectedSurvey,
                static_site_id: selectedSite,
                ...obs
            }));

            const { error } = await gc.from('static_observations').insert(toInsert);
            if (error) throw error;

            alert('Static site data submitted successfully!');
            setObservations([]);
        } catch (err) {
            console.error(err);
            alert('Error submitting static site data');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fade-in max-w-5xl">
            <div className="mb-10 pb-6 border-b border-slate-100">
                <h1 className="text-3xl font-extrabold font-outfit text-slate-900 flex items-center gap-3">
                    <span className="p-2.5 bg-amber-50 rounded-xl border border-amber-100"><Droplets className="text-amber-700" size={28} /></span>
                    Static Site Data Entry
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Submit 24-hour static count data for waterholes and pans</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Session Info */}
                <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block font-outfit">Conservation Area</label>
                        <select className="form-input bg-slate-50 border-slate-200 focus:bg-white font-semibold text-slate-700" value={selectedPark} onChange={(e) => setSelectedPark(e.target.value)} required>
                            <option value="">Select Park</option>
                            {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block font-outfit">Survey Session</label>
                        <select className="form-input bg-slate-50 border-slate-200 focus:bg-white font-semibold text-slate-700" value={selectedSurvey} onChange={(e) => setSelectedSurvey(e.target.value)} required disabled={!selectedPark}>
                            <option value="">Select Survey</option>
                            {surveys.map(s => <option key={s.id} value={s.id}>{s.year} {s.season}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block font-outfit">Static Site / Waterhole</label>
                        <select className="form-input bg-slate-50 border-slate-200 focus:bg-white font-semibold text-slate-700" value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} required disabled={!selectedPark}>
                            <option value="">Select Site</option>
                            {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.site_type})</option>)}
                        </select>
                    </div>
                </div>

                {/* Observations List */}
                <div className="glass-card overflow-hidden">
                    <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold font-outfit text-slate-900">Hourly Static Observations</h3>
                        <button type="button" onClick={addObservation} className="btn-primary flex items-center gap-2 py-2 px-6 text-sm">
                            <Plus size={18} /> Log Observation
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {observations.length === 0 && (
                            <div className="text-center py-16 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 font-outfit">
                                No logs recorded yet. Use "Log Observation" to entry hourly census data.
                            </div>
                        )}

                        {observations.map((obs, index) => (
                            <div key={index} className="p-6 bg-slate-50 rounded-2xl flex flex-wrap gap-4 items-end border border-slate-100 shadow-sm shadow-slate-200/50">
                                <div className="w-40">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase mb-2 block tracking-widest">Hour (00-23)</label>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-amber-600 shrink-0" />
                                        <input type="number" className="form-input bg-white font-bold text-slate-800" value={obs.observation_hour} onChange={(e) => updateObservation(index, 'observation_hour', parseInt(e.target.value))} min={0} max={23} required />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase mb-2 block tracking-widest">Species</label>
                                    <select className="form-input bg-white font-bold text-slate-800" value={obs.species_id} onChange={(e) => updateObservation(index, 'species_id', e.target.value)} required>
                                        <option value="">Select Species</option>
                                        {species.map(s => <option key={s.id} value={s.id}>{s.common_name}</option>)}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase mb-2 block tracking-widest">Count</label>
                                    <input type="number" className="form-input bg-white font-bold text-slate-800" value={obs.count} onChange={(e) => updateObservation(index, 'count', parseInt(e.target.value))} min={1} required />
                                </div>
                                <div className="w-32">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase mb-2 block tracking-widest">Sex</label>
                                    <select className="form-input bg-white font-bold text-slate-800" value={obs.sex} onChange={(e) => updateObservation(index, 'sex', e.target.value)}>
                                        <option value="unknown">Unknown</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <button type="button" onClick={() => removeObservation(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4">
                    <button type="button" className="btn-secondary">Batch Upload (CSV)</button>
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={submitting || observations.length === 0}>
                        {submitting ? 'Submitting...' : <><Save size={18} /> Submit Logs</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
