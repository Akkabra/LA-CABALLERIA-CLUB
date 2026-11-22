import React, { useEffect, useRef, useState } from 'react';
import { CLUB_INFO } from '../data/clubData';

interface EpicIntroOverlayProps {
  onComplete?: () => void;
}

export const EpicIntroOverlay: React.FC<EpicIntroOverlayProps> = ({ onComplete }) => {
  const [prefersReduced] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [phase, setPhase] = useState<'ready' | 'playing' | 'exiting' | 'done'>('ready');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;

    document.body.style.overflow = 'hidden';

    const startTimeline = () => {
      if (cancelled) return;
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          if (cancelled) return;
          setPhase('playing');

          const exitDelay = prefersReduced ? 650 : 2350;
          const unmountDelay = prefersReduced ? 1050 : 3250;

          const exitTimer = window.setTimeout(() => {
            if (!cancelled) setPhase('exiting');
          }, exitDelay);

          const doneTimer = window.setTimeout(() => {
            if (cancelled) return;
            document.body.style.overflow = '';
            setPhase('done');
            onComplete?.();
          }, unmountDelay);

          timersRef.current = [exitTimer, doneTimer];
        });
      });
    };

    // Pre-decode the crest PNG (capped at 180ms) so animation starts smoothly without a stutter
    const img = new Image();
    img.src = CLUB_INFO.logoUrl;
    const decodePromise =
      typeof img.decode === 'function'
        ? img.decode().catch(() => {})
        : Promise.resolve();

    let started = false;
    const kickOff = () => {
      if (started || cancelled) return;
      started = true;
      startTimeline();
    };

    const fallbackCap = window.setTimeout(kickOff, 180);
    void decodePromise.then(() => {
      window.clearTimeout(fallbackCap);
      // Slight 50ms yield lets initial React/Firestore hydration settle before frame 1
      const settle = window.setTimeout(kickOff, 50);
      timersRef.current.push(settle);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackCap);
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      timersRef.current.forEach((id) => window.clearTimeout(id));
      document.body.style.overflow = '';
    };
  }, [onComplete, prefersReduced]);

  const handleSkip = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    setPhase('exiting');
    const skipTimer = window.setTimeout(() => {
      document.body.style.overflow = '';
      setPhase('done');
      onComplete?.();
    }, 620);
    timersRef.current = [skipTimer];
  };

  if (phase === 'done') return null;

  const isPlaying = phase === 'playing';
  const isExiting = phase === 'exiting';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a La Caballería"
      className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden select-none overscroll-none pointer-events-auto"
    >
      {/* Left Sliding Gate Panel (GPU transform only) */}
      <div
        style={{
          transform: isExiting ? 'translate3d(-100%, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: prefersReduced
            ? 'transform 380ms ease-out'
            : 'transform 850ms cubic-bezier(0.76, 0, 0.24, 1)',
          willChange: 'transform',
        }}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#09090B]"
      >
        <div
          className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#D21923] to-transparent opacity-80"
          aria-hidden="true"
        />
      </div>

      {/* Right Sliding Gate Panel (GPU transform only) */}
      <div
        style={{
          transform: isExiting ? 'translate3d(100%, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: prefersReduced
            ? 'transform 380ms ease-out'
            : 'transform 850ms cubic-bezier(0.76, 0, 0.24, 1)',
          willChange: 'transform',
        }}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#09090B]"
      >
        <div
          className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#D21923] to-transparent opacity-80"
          aria-hidden="true"
        />
      </div>

      {/* Center Crimson Vertical Seam */}
      <div
        aria-hidden="true"
        style={{
          transition: 'opacity 320ms ease-out',
          opacity: isExiting ? 0 : undefined,
        }}
        className={`absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#D21923]/70 to-transparent pointer-events-none z-10 origin-center ${
          isPlaying ? 'intro-seam-in' : isExiting ? '' : 'opacity-0'
        }`}
      />

      {/* Lightweight Radial Crimson Ambient Glow (Zero GPU blur filter!) */}
      <div
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle, rgba(210, 25, 35, 0.22) 0%, rgba(210, 25, 35, 0.07) 42%, transparent 72%)',
          transition: 'opacity 420ms ease-out, transform 600ms ease-out',
          ...(isExiting
            ? { opacity: 0, transform: 'translate3d(-50%, -50%, 0) scale(1.18)' }
            : {}),
        }}
        className={`absolute top-1/2 left-1/2 w-[320px] sm:w-[540px] h-[320px] sm:h-[540px] rounded-full pointer-events-none z-10 ${
          isPlaying ? 'intro-glow-in' : !isExiting ? 'opacity-0' : ''
        }`}
      />

      {/* Centered Minimalist Kinetic Crest & Typography */}
      <div
        style={{
          transform: isExiting
            ? 'translate3d(0, -10px, 0) scale(0.96)'
            : 'translate3d(0, 0, 0) scale(1)',
          opacity: isExiting ? 0 : 1,
          transition:
            'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 520ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
        }}
        className="relative z-20 h-full w-full flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Crest Medallion with Smooth Orbit Ring */}
        <div
          className={`relative w-24 h-24 sm:w-28 sm:h-28 mb-6 rounded-full bg-[#09090B] flex items-center justify-center shadow-[0_12px_36px_rgba(0,0,0,0.85)] ${
            isPlaying || isExiting ? 'intro-crest-in' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 rounded-full border border-white/15" />

          {!prefersReduced && (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full intro-spin"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="48.5"
                fill="none"
                stroke="#D21923"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="90 215"
              />
            </svg>
          )}

          <img
            src={CLUB_INFO.logoUrl}
            alt="Emblema La Caballería"
            decoding="sync"
            className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 object-contain"
          />
        </div>

        {/* Wordmark with Composited Light Sweep (No letter-spacing reflow!) */}
        <div
          className={`relative overflow-hidden bg-[#09090B] py-1.5 px-4 sm:px-6 ${
            isPlaying || isExiting ? 'intro-title-in' : 'opacity-0'
          }`}
        >
          <h2 className="font-brand-display font-bold uppercase tracking-[0.14em] text-white text-[clamp(1.35rem,5.2vw,2.75rem)] leading-none pl-[0.14em]">
            {CLUB_INFO.name}
          </h2>

          {!prefersReduced && isPlaying && (
            <span
              aria-hidden="true"
              className="intro-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
            />
          )}
        </div>

        {/* Unhurried Descriptor + Slogan */}
        <p
          className={`mt-2.5 text-[11px] sm:text-xs font-serif italic tracking-[0.18em] text-zinc-300 ${
            isPlaying || isExiting ? 'intro-subtitle-in' : 'opacity-0'
          }`}
        >
          {CLUB_INFO.descriptor}
        </p>

        {/* Smooth Progress Line */}
        <div className="mt-5 w-40 sm:w-52 h-[2px] bg-white/15 overflow-hidden">
          <div
            className={`h-full w-full bg-[#D21923] origin-left ${
              isPlaying || isExiting ? 'intro-bar-fill' : 'scale-x-0'
            }`}
          />
        </div>
      </div>

      {/* Touch-friendly Skip Control */}
      <button
        type="button"
        onClick={handleSkip}
        className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 sm:bottom-8 sm:right-8 z-30 min-h-[44px] px-4 py-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300 hover:text-white transition-opacity duration-200 cursor-pointer ${
          isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        Saltar
      </button>
    </div>
  );
};
