'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { normalizeParkId } from '@/lib/park-routes';

function NewSurveyPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const parkId = normalizeParkId(searchParams.get('parkId'));

    return (
        <div className="max-w-7xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[70vh] py-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="max-w-2xl w-full surface-panel p-8 sm:p-10 text-center"
            >
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-md bg-wez-mint flex items-center justify-center text-wez-green mb-6 border border-[var(--wez-border)]">
                        <Smartphone size={32} strokeWidth={1.75} />
                    </div>

                    <h1 className="page-title">Field data collection</h1>
                    <p className="page-subtitle max-w-md">
                        Survey entry is available on the WEZ mobile app only. This dashboard stays read-only for analysis.
                    </p>
                    <p className="page-meta inline-flex items-center gap-1.5 mt-3">
                        <Lock size={12} className="text-wez-green" strokeWidth={1.75} />
                        Mobile-only access
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-8 mb-8 text-left">
                        <div className="rounded-md border border-[var(--wez-border)] bg-wez-stone/20 p-4">
                            <ShieldCheck className="text-wez-green mb-2" size={18} strokeWidth={1.75} />
                            <h4 className="text-sm font-semibold text-wez-ink mb-1">Authenticated sync</h4>
                            <p className="text-sm text-wez-muted leading-relaxed">Encrypted transfer from the field device to the cloud.</p>
                        </div>
                        <div className="rounded-md border border-[var(--wez-border)] bg-wez-stone/20 p-4">
                            <Globe className="text-wez-green mb-2" size={18} strokeWidth={1.75} />
                            <h4 className="text-sm font-semibold text-wez-ink mb-1">Location-verified entry</h4>
                            <p className="text-sm text-wez-muted leading-relaxed">Field submissions require an active GPS position.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button 
                            onClick={() => router.back()}
                            className="flex-1 h-11 gap-2"
                        >
                            <ArrowLeft size={16} strokeWidth={1.75} /> Back to dashboard
                        </Button>
                        <Button 
                            variant="outline"
                            className="flex-1 h-11 gap-2"
                        >
                            <ExternalLink size={16} strokeWidth={1.75} /> Get mobile app
                        </Button>
                    </div>
                </div>
            </motion.div>

            <p className="label-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-wez-green-light" />
                WEZ field collection
            </p>
        </div>
    );
}

export default function NewSurveyPage(props: any) {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <div className="w-10 h-10 border-wez-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
                <p className="text-wez-muted text-sm font-medium">Loading…</p>
            </div>
        }>
            <NewSurveyPageContent {...props} />
        </Suspense>
    );
}
