'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import KuduWatermark from '@/components/KuduWatermark';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPublicLegal =
    pathname === '/privacy' ||
    pathname?.startsWith('/privacy/') ||
    pathname === '/download' ||
    pathname?.startsWith('/download/');

  // Close drawer on navigation (path or query)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (isPublicLegal) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Suspense
        fallback={
          <aside className="sidebar">
            <div className="px-4 pt-5 pb-4 border-b border-[var(--wez-border)] bg-gradient-to-br from-wez-mint to-wez-sunset-soft">
              <div className="font-display font-extrabold text-xl text-wez-green tracking-tight">WEZ</div>
              <div className="text-xs font-semibold text-wez-green-mid mt-1.5">Game Counts</div>
            </div>
          </aside>
        }
      >
        <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      </Suspense>

      <KuduWatermark />

      <main className="main-content min-h-screen relative z-[1]">
        {children}
      </main>
    </>
  );
}
