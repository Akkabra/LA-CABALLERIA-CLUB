import React, { useState, useEffect } from 'react';
import { ChevronRight, CalendarCheck, ShieldCheck, X } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface HeaderProps {
  onOpenBooking: () => void;
}

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Agendar Cita', href: '#agendar-cita', highlight: true },
  { label: 'Experiencia', href: '#manifiesto' },
  { label: 'Caballos & Equipo', href: '#equipo' },
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Blog', href: '#blog' },
  { label: 'Preguntas', href: '#preguntas' },
  { label: 'Contacto', href: '#contacto' },
];

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHref, setActiveHref] = useState('#inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const updateScrollState = () => {
      rafId = 0;
      const y = window.scrollY;
      setIsScrolled(y > 30);

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0);

      // Determine active section in viewport
      const offset = y + 140;
      let current = '#inicio';
      for (const item of NAV_LINKS) {
        const el = document.querySelector<HTMLElement>(item.href);
        if (el && el.offsetTop <= offset) {
          current = item.href;
        }
      }
      setActiveHref(current);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScrollState);
      }
    };

    updateScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Lock body scroll and listen for Escape while mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#141416]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
            : 'bg-gradient-to-b from-[#141416]/95 via-[#141416]/70 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#inicio"
              onClick={(e) => handleNavClick(e, '#inicio')}
              className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
              aria-label="La Caballería Club de Equitación - Inicio"
            >
              <div className="relative flex items-center justify-center h-11 w-auto max-w-[150px] sm:max-w-[180px]">
                <img
                  src={CLUB_INFO.logoUrl}
                  alt="La Caballería - Club de Equitación"
                  className="h-10 sm:h-11 w-auto object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-logo')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-logo flex flex-col font-serif';
                      fallback.innerHTML = `<span class="text-white text-lg font-bold tracking-wider">LA CABALLERÍA</span><span class="text-[10px] text-[#D21923] tracking-widest uppercase">Club de Equitación</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" aria-label="Navegación principal">
              {NAV_LINKS.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`px-2.5 xl:px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors relative group whitespace-nowrap shrink-0 ${
                      link.highlight
                        ? 'text-[#D21923] hover:text-white font-bold'
                        : isActive
                        ? 'text-white'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-[#D21923] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${
                        link.highlight || isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </a>
                );
              })}
            </nav>

            {/* Right Actions: Compact Mobile CTA (< sm) + Full CTA (sm+) + Animated 3-line Menu Trigger (< lg) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenBooking}
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-full bg-[#D21923] hover:bg-[#b8141d] text-white text-[11px] font-bold uppercase tracking-wider shadow-md shadow-[#D21923]/30 whitespace-nowrap shrink-0 active:scale-95 transition-transform"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Reservar</span>
              </button>

              <div className="hidden sm:flex items-center">
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="group relative inline-flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 min-h-[40px] rounded-full bg-gradient-to-r from-[#D21923] to-[#A00F17] text-white border border-white/20 hover:border-white/50 transition-all duration-300 shadow-md shadow-[#D21923]/30 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase text-white">
                    AGENDAR CITA
                  </span>
                  <span className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#D21923] transition-colors duration-200">
                    <CalendarCheck className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              {/* Mobile & Tablet Animated Three-Line Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className={`flex lg:hidden items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-lg border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923] active:scale-95 ${
                  mobileMenuOpen
                    ? 'bg-[#D21923]/15 border-[#D21923]/60 text-white'
                    : 'bg-white/[0.03] border-white/15 text-zinc-100 hover:bg-white/10'
                }`}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                <span className="relative w-5 h-4 flex flex-col justify-between items-center pointer-events-none" aria-hidden="true">
                  <span
                    className={`block h-[2px] w-5 rounded-full bg-current origin-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      mobileMenuOpen ? 'translate-y-[7px] rotate-45 bg-[#D21923]' : 'translate-y-0 rotate-0'
                    }`}
                  />
                  <span
                    className={`block h-[2px] w-5 rounded-full bg-current origin-center transition-all duration-200 ease-out ${
                      mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                    }`}
                  />
                  <span
                    className={`block h-[2px] w-5 rounded-full bg-current origin-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      mobileMenuOpen ? '-translate-y-[7px] -rotate-45 bg-[#D21923]' : 'translate-y-0 rotate-0'
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Progress Accent Bar */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06] pointer-events-none overflow-hidden"
        >
          <div
            className="h-full w-full bg-gradient-to-r from-[#D21923] via-[#ef303a] to-[#D21923] origin-left transition-transform duration-75 ease-out"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>
      </header>

      {/* Mobile & Tablet Drawer Navigation (Mounted for smooth open AND close choreography) */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileMenuOpen}
        aria-label="Menú de navegación"
        className={`fixed inset-0 z-50 lg:hidden transition-[visibility] duration-400 ${
          mobileMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Animated Backdrop */}
        <div
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-350 ease-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Animated Sliding Drawer Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-[#141416] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Decorative crimson left edge highlight */}
          <div
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#D21923] to-transparent transition-opacity duration-500 ${
              mobileMenuOpen ? 'opacity-80 delay-150' : 'opacity-0'
            }`}
          />

          <div>
            {/* Drawer Header */}
            <div
              className={`flex items-center justify-between pb-5 border-b border-white/10 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mobileMenuOpen ? 'opacity-100 translate-y-0 delay-75' : 'opacity-0 -translate-y-2'
              }`}
            >
              <img
                src={CLUB_INFO.logoUrl}
                alt="La Caballería"
                className="h-8 w-auto object-contain"
              />
              <button
                type="button"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-90"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Staggered Nav Links Cascade */}
            <nav className="mt-5 flex flex-col space-y-1" aria-label="Navegación móvil y tablet">
              {NAV_LINKS.map((link, index) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    onClick={(e) => handleNavClick(e, link.href)}
                    style={{
                      transitionDelay: mobileMenuOpen ? `${80 + index * 38}ms` : '0ms',
                    }}
                    className={`group px-4 py-3 min-h-[44px] text-sm font-medium border-l-2 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between active:scale-[0.98] ${
                      mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                    } ${
                      link.highlight
                        ? 'text-[#D21923] bg-[#D21923]/10 border-[#D21923] font-bold'
                        : isActive
                        ? 'text-white bg-white/[0.06] border-[#D21923]'
                        : 'text-zinc-200 hover:text-white hover:bg-white/5 border-transparent hover:border-[#D21923]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-mono transition-colors duration-200 ${
                          link.highlight || isActive ? 'text-[#D21923]' : 'text-zinc-600 group-hover:text-[#D21923]'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{link.label}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Drawer Footer CTA Reveal */}
          <div
            style={{
              transitionDelay: mobileMenuOpen ? '360ms' : '0ms',
            }}
            className={`pt-6 border-t border-white/10 space-y-3 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              type="button"
              tabIndex={mobileMenuOpen ? 0 : -1}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 min-h-[46px] text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] active:scale-[0.98] transition-all shadow-lg shadow-[#D21923]/25"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>AGENDAR CITA</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-400 italic font-serif">
                "{CLUB_INFO.slogan}"
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D21923]" />
                <span>Escuela de Equitación Formativa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
