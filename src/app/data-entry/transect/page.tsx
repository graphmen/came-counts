'use client';

import React, { useEffect, useState } from 'react';
import { gc } from '@/lib/supabase';
import { Species, Park, Survey } from '@/types';
import { MapPin, Plus, Save, Trash2, ArrowRight } from 'lucide-react';

export default function TransectEntryPage() {
    const [species, setSpecies] = useState<Species[]>([]);
    const [parks, setParks] = useState<Park[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [transects, setTransects] = useState<any[]>([]);

    const [selectedPark, setSelectedPark] = useState('');
    const [selectedSurvey, setSelectedSurvey] = useState('');
    const [selectedTransect, setSelectedTransect] = useState('');

    const [observations, setObservations] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function init() {
            const { data: pData } = await gc.from('parks').select('*');
            setParks(pData || []);
            const { data: sList } = await gc.from('species').select('*').order('common_name');
            setSpecies(sList || []);
        }
        init();
    }, []);

    useEffect(() => {
        if (selectedPark) {
            gc.from('surveys').select('*').eq('park_id', selectedPark).then(({ data }) => setSurveys(data || []));
            gc.from('transects').select('*').eq('park_id', selectedPark).then(({ data }) => setTransects(data || []));
        }
    }, [selectedPark]);

    const addObservation = () => {
        setObservations([...observations, {
            species_id: '',
            count: 1,
            sex: 'unknown',
            age_class: 'adult',
            activity: 'resting',
            time_of_day: 'morning',
            observation_day: 'saturday'
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
        if (!selectedSurvey || !selectedTransect || observations.length === 0) return;

        setSubmitting(true);
        try {
            const toInsert = observations.map(obs => ({
                survey_id: selectedSurvey,
                transect_id: selectedTransect,
                ...obs
            }));

            const { error } = await gc.from('transect_observations').insert(toInsert);
            if (error) throw error;

            alert('Data submitted successfully!');
            setObservations([]);
        } catch (err) {
            console.error(err);
            alert('Error submitting data');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fade-in max-w-5xl">
            <div className="mb-10 pb-6 border-b border-slate-100">
                <h1 className="text-3xl font-extrabold font-outfit text-slate-900 flex items-center gap-3">
                    <span className="p-2.5 bg-green-50 rounded-xl border border-green-100"><MapPin className="text-green-700" size={28} /></span>
                    Transect Data Entry
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Submit field observations for active game count transects</p>
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
                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block font-outfit">Active Survey Session</label>
                        <select className="form-input bg-slate-50 border-slate-200 focus:bg-white font-semibold text-slate-700" value={selectedSurvey} onChange={(e) => setSelectedSurvey(e.target.value)} required disabled={!selectedPark}>
                            <option value="">Select Survey</option>
                            {surveys.map(s => <option key={s.id} value={s.id}>{s.year} {s.season}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 block font-outfit">Transect Number</label>
                        <select className="form-input bg-slate-50 border-slate-200 focus:bg-white font-semibold text-slate-700" value={selectedTransect} onChange={(e) => setSelectedTransect(e.target.value)} required disabled={!selectedPark}>
                            <option value="">Select Transect</option>
                            {transects.map(t => <option key={t.id} value={t.id}>{t.name} ({t.number})</option>)}
                        </select>
                    </div>
                </div>

                {/* Observations List */}
                <div className="glass-card overflow-hidden">
                    <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold font-outfit text-slate-900">Observations Log</h3>
                        <button type="button" onClick={addObservation} className="btn-primary flex items-center gap-2 py-2 px-6 text-sm">
                            <Plus size={18} /> Add Sighting
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {observations.length === 0 && (
                            <div className="text-center py-16 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 font-outfit">
                                No sightings logged yet. Click "Add Sighting" to start recording observation data.
                            </div>
                        )}

                        {observations.map((obs, index) => (
                            <div key={index} className="p-6 bg-slate-50 rounded-2xl flex flex-wrap gap-4 items-end border border-slate-100 shadow-sm shadow-slate-200/50">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase mb-2 block tracking-widest">Species</label>
                                    <select className="form-input bg-white font-bold text-slate-800" value={obs.species_id} onChange={(e) => updateObservation(index, 'species_id', e.target.value)} required>
                                        <option value="">Select Species</option>
                                        {species.map(s => <option key={s.id} value={s.id}>{s.common_name}</option>)}
                                    </select>
                                </div>
                                <div className="w-24">
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
                                <div className="w-32">
                                    <label className="text-[11px] font-extrabold text-slate-400 uppercase mb-2 block tracking-widest">Age</label>
                                    <select className="form-input bg-white font-bold text-slate-800" value={obs.age_class} onChange={(e) => updateObservation(index, 'age_class', e.target.value)}>
                                        <option value="adult">Adult</option>
                                        <option value="sub_adult">Sub-Adult</option>
                                        <option value="juvenile">Juvenile</option>
                                        <option value="unknown">Unknown</option>
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
                    <button type="button" className="btn-secondary">Save Draft</button>
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={submitting || observations.length === 0}>
                        {submitting ? 'Submitting...' : <><Save size={18} /> Submit To Database</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
