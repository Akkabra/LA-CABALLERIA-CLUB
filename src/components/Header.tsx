import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, CalendarCheck, ShieldCheck } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface HeaderProps {
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Agendar Cita', href: '#agendar-cita', highlight: true },
    { label: 'Experiencia', href: '#experiencia' },
    { label: 'Caballos & Equipo', href: '#equipo' },
    { label: 'Beneficios', href: '#beneficios' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Blog', href: '#blog' },
    { label: 'Preguntas', href: '#preguntas' },
    { label: 'Contacto', href: '#contacto' },
  ];

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
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-2.5 xl:px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors relative group whitespace-nowrap shrink-0 ${
                    link.highlight
                      ? 'text-[#D21923] hover:text-white font-bold'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] transition-transform duration-200 origin-left ${
                    link.highlight ? 'bg-[#D21923] scale-x-100' : 'bg-[#D21923] scale-x-0 group-hover:scale-x-100'
                  }`} />
                </a>
              ))}
            </nav>

            {/* Right Actions: Compact Mobile CTA (< sm) + Full CTA (sm+) + Mobile/Tablet Menu Trigger (< lg) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenBooking}
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-full bg-[#D21923] hover:bg-[#b8141d] text-white text-[11px] font-bold uppercase tracking-wider shadow-md shadow-[#D21923]/30 whitespace-nowrap shrink-0"
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

              {/* Mobile & Tablet Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex lg:hidden items-center justify-center min-w-[44px] min-h-[44px] p-2 text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg border border-white/10 lg:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-[#141416] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <img
                  src={CLUB_INFO.logoUrl}
                  alt="La Caballería"
                  className="h-8 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded-md"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-5 flex flex-col space-y-1" aria-label="Navegación móvil y tablet">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`px-4 py-3 min-h-[44px] text-sm font-medium border-l-2 transition-all flex items-center justify-between ${
                      link.highlight
                        ? 'text-[#D21923] bg-[#D21923]/10 border-[#D21923] font-bold'
                        : 'text-zinc-200 hover:text-white hover:bg-white/5 border-transparent hover:border-[#D21923]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors shadow-lg"
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
      )}
    </>
  );
};
