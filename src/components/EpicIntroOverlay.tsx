import React, { useEffect, useState } from 'react';
import { CLUB_INFO } from '../data/clubData';

interface EpicIntroOverlayProps {
  onComplete?: () => void;
}

export const EpicIntroOverlay: React.FC<EpicIntroOverlayProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'active' | 'exiting' | 'done'>('active');

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const exitDelay = prefersReduced ? 550 : 1750;
    const unmountDelay = prefersReduced ? 950 : 2350;

    document.body.style.overflow = 'hidden';

    const exitTimer = window.setTimeout(() => {
      setPhase('exiting');
    }, exitDelay);

    const doneTimer = window.setTimeout(() => {
      document.body.style.overflow = '';
      setPhase('done');
      onComplete?.();
    }, unmountDelay);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('exiting');
    window.setTimeout(() => {
      document.body.style.overflow = '';
      setPhase('done');
      onComplete?.();
    }, 350);
  };

  if (phase === 'done') return null;

  const isExiting = phase === 'exiting';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a La Caballería Club de Equitación"
      className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden select-none pointer-events-auto"
    >
      {/* Split Architectural Curtains (Top & Bottom panels part smoothly on exit) */}
      <div
        className={`absolute inset-x-0 top-0 h-1/2 bg-[#0C0C0E] transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isExiting ? '-translate-y-full' : 'translate-y-0'
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#0C0C0E] transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isExiting ? 'translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* Crimson Seam Flash across center horizon */}
      <div
        className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#D21923] to-transparent transition-opacity duration-500 ${
          isExiting ? 'opacity-90' : 'opacity-25'
        }`}
        aria-hidden="true"
      />

      {/* Radial Ambient Spotlight */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[540px] lg:w-[760px] h-[220px] sm:h-[320px] bg-[#D21923]/20 rounded-full blur-[110px] pointer-events-none transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {/* Centered Emblem & Brand Reveal */}
      <div
        className={`relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-center transition-all duration-400 ease-out ${
          isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
      >
        {/* Crest Emblem */}
        <div className="intro-emblem-rise mb-5 sm:mb-6 flex items-center justify-center">
          <img
            src={CLUB_INFO.logoUrl}
            alt="Emblema de La Caballería"
            className="h-14 sm:h-20 lg:h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(210,25,35,0.45)]"
          />
        </div>

        {/* Expanding Ornamental Rule */}
        <div
          className="intro-line-expand flex items-center justify-center gap-3 w-full max-w-[220px] sm:max-w-xs mb-4 sm:mb-5"
          aria-hidden="true"
        >
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D21923]" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#D21923]" />
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D21923]" />
        </div>

        {/* Monumental Brand Title */}
        <h2 className="intro-title-reveal font-sans font-black uppercase text-white tracking-[0.14em] sm:tracking-[0.22em] text-[clamp(1.75rem,7.5vw,4.5rem)] leading-none">
          {CLUB_INFO.name}
        </h2>

        {/* Descriptor & Slogan */}
        <div className="intro-fade-up mt-3 sm:mt-4 space-y-2">
          <p className="font-serif italic text-[#D21923] text-lg sm:text-2xl md:text-3xl">
            {CLUB_INFO.descriptor}
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 tracking-wide max-w-md mx-auto">
            {CLUB_INFO.slogan}
          </p>
        </div>
      </div>

      {/* Skip Intro Button (bottom-right, touch friendly >= 44px & iOS safe-area) */}
      <button
        type="button"
        onClick={handleSkip}
        className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 sm:bottom-8 sm:right-8 z-20 min-h-[44px] px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-[11px] font-semibold uppercase tracking-widest text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer ${
          isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        Saltar intro
      </button>
    </div>
  );
};
