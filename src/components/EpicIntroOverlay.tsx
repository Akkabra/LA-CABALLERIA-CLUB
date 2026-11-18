import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CLUB_INFO } from '../data/clubData';

interface EpicIntroOverlayProps {
  onComplete?: () => void;
}

export const EpicIntroOverlay: React.FC<EpicIntroOverlayProps> = ({ onComplete }) => {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<'active' | 'exiting' | 'done'>('active');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    let raf1 = 0;
    let raf2 = 0;

    // Wait for first actual painted frame so hydration lag never swallows the intro
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        const exitDelay = prefersReduced ? 500 : 1350;
        const unmountDelay = prefersReduced ? 850 : 1920;

        const exitTimer = window.setTimeout(() => {
          setPhase('exiting');
        }, exitDelay);

        const doneTimer = window.setTimeout(() => {
          document.body.style.overflow = '';
          setPhase('done');
          onComplete?.();
        }, unmountDelay);

        timersRef.current = [exitTimer, doneTimer];
      });
    });

    return () => {
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
    }, 450);
    timersRef.current = [skipTimer];
  };

  if (phase === 'done') return null;

  const isExiting = phase === 'exiting';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a La Caballería"
      className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden select-none pointer-events-auto"
    >
      {/* Left Gate Panel */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isExiting ? '-100%' : '0%' }}
        transition={{
          duration: prefersReduced ? 0.3 : 0.54,
          ease: [0.77, 0, 0.175, 1],
        }}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#09090B] overflow-hidden"
      >
        <div
          className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#D21923] to-transparent shadow-[0_0_22px_rgba(210,25,35,0.95)]"
          aria-hidden="true"
        />
      </motion.div>

      {/* Right Gate Panel */}
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: isExiting ? '100%' : '0%' }}
        transition={{
          duration: prefersReduced ? 0.3 : 0.54,
          ease: [0.77, 0, 0.175, 1],
        }}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#09090B] overflow-hidden"
      >
        <div
          className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#D21923] to-transparent shadow-[0_0_22px_rgba(210,25,35,0.95)]"
          aria-hidden="true"
        />
      </motion.div>

      {/* Center Crimson Vertical Laser Seam before Gates Open */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0.9 }}
        animate={
          isExiting
            ? { scaleY: 1, opacity: 0 }
            : { scaleY: 1, opacity: [0.95, 0.45] }
        }
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#D21923] to-transparent shadow-[0_0_28px_#D21923] pointer-events-none z-10 origin-center"
        aria-hidden="true"
      />

      {/* Ambient Crimson Radial Spotlight */}
      <motion.div
        initial={{ opacity: 0.45, scale: 0.85 }}
        animate={
          isExiting
            ? { opacity: 0, scale: 1.25 }
            : { opacity: 0.85, scale: 1 }
        }
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[460px] h-[280px] sm:h-[460px] rounded-full bg-[#D21923]/22 blur-[110px] pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Centered Minimalist Kinetic Crest & Wordmark */}
      <motion.div
        initial={{ opacity: 1, scale: 0.92 }}
        animate={
          isExiting
            ? { opacity: 0, scale: 1.12 }
            : { opacity: 1, scale: 1 }
        }
        transition={{
          duration: isExiting ? 0.28 : 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-20 h-full w-full flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Kinetic Orbit Ring + Official Crest Medallion */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-5 sm:mb-6 rounded-full bg-[#09090B] flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.9)]">
          {/* Static subtle border ring */}
          <div className="absolute inset-0 rounded-full border border-white/15" />

          {/* Spinning high-contrast crimson arc */}
          {!prefersReduced && (
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], repeat: Infinity }}
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="#D21923"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="95 210"
              />
            </motion.svg>
          )}

          {/* Crest Image */}
          <motion.img
            src={CLUB_INFO.logoUrl}
            alt="Emblema La Caballería"
            initial={{ scale: 0.82, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_20px_rgba(210,25,35,0.55)]"
          />
        </div>

        {/* Crisp Minimalist Title with Kinetic Light Sweep */}
        <div className="relative overflow-hidden bg-[#09090B] py-1.5 px-5">
          <motion.h2
            initial={{ letterSpacing: '0.38em', y: 8, opacity: 0.6 }}
            animate={{ letterSpacing: '0.2em', y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans font-black uppercase text-white text-[clamp(1.4rem,6vw,3rem)] leading-none"
          >
            {CLUB_INFO.name}
          </motion.h2>

          {!prefersReduced && (
            <motion.span
              initial={{ x: '-130%' }}
              animate={{ x: '230%' }}
              transition={{ duration: 0.75, delay: 0.28, ease: [0.25, 1, 0.5, 1] }}
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
            />
          )}
        </div>

        {/* Sleek Crimson Progress Accent Line */}
        <div className="mt-4 w-36 sm:w-48 h-[2px] bg-white/15 overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: prefersReduced ? 0.35 : 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full bg-[#D21923] origin-left shadow-[0_0_12px_#D21923]"
          />
        </div>
      </motion.div>

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
