'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Smartphone, 
    ArrowLeft,
    ShieldCheck,
    Globe,
    Lock,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewSurveyPage() {
    const params = useParams();
    const router = useRouter();
    const parkId = params?.parkId as string;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-900 mb-8 border border-slate-100 shadow-inner">
                        <Smartphone size={48} className="text-emerald-600" />
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <Lock size={14} className="text-emerald-600" />
                        <h1 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Security Protocol Alpha</h1>
                    </div>

                    <h2 className="text-4xl font-display font-black tracking-tight uppercase leading-none mb-6">
                        Field Data Collection <br /> 
                        <span className="text-emerald-600">Mobile-Only Access</span>
                    </h2>

                    <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10">
                        To maintain data integrity and strictly enforce field-verified telemetry, all survey inputs are now managed exclusively via the <span className="text-slate-900">WEZ Mobile Surveillance App</span>. This terminal is restricted to read-only analytical intelligence.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                            <ShieldCheck className="text-emerald-600 mb-3" size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Authenticated Sync</h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">Encrypted SQLite-to-Cloud Transmission Protocol active.</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                            <Globe className="text-indigo-600 mb-3" size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Geo-Fenced Entry</h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">Field verification requires active GPS coordinate locking.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Button 
                            onClick={() => router.back()}
                            className="flex-1 h-16 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl transition-all active:scale-95"
                        >
                            <ArrowLeft size={16} /> Return to Intel Hub
                        </Button>
                        <Button 
                            variant="outline"
                            className="flex-1 h-16 rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] gap-3 transition-all active:scale-95"
                        >
                            <ExternalLink size={16} /> Get Mobile App
                        </Button>
                    </div>
                </div>
            </motion.div>

            <div className="mt-12 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    Terminal: WEZ-RECON-V12 • Digital Perimeter Locked
                </p>
            </div>
        </div>
    );
}
