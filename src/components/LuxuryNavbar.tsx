import React, { useState, useEffect } from 'react';
import { useHotel } from '../HotelContext';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, Sparkles, PhoneCall } from 'lucide-react';

export default function LuxuryNavbar() {
  const { currentView, setView, language, toggleLanguage, t } = useHotel();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view: 'home' | 'rooms' | 'booking' | 'admin') => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full h-20 z-50 transition-all duration-500 flex items-center justify-between ${
          isScrolled
            ? 'bg-charcoal/85 backdrop-blur-[20px] border-b border-gold-400/20 shadow-2xl'
            : 'bg-charcoal/40 backdrop-blur-[10px] border-b border-white/5'
        }`}
        id="luxury-navbar"
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Left: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.25em] font-semibold" id="desktop-nav">
            <button
              onClick={() => handleNav('home')}
              className={`transition-colors duration-300 hover:text-gold-400 ${
                currentView === 'home' ? 'text-gold-400 font-bold' : 'text-cream/80'
              }`}
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => handleNav('rooms')}
              className={`transition-colors duration-300 hover:text-gold-400 ${
                currentView === 'rooms' ? 'text-gold-400 font-bold' : 'text-cream/80'
              }`}
            >
              {t('nav.rooms')}
            </button>
            <button
              onClick={() => {
                setView('home');
                setTimeout(() => {
                  document.getElementById('legacy-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
              className="text-cream/80 transition-colors duration-300 hover:text-gold-400"
            >
              {language === 'en' ? 'Heritage' : 'Héritage'}
            </button>
            <button
              onClick={() => handleNav('admin')}
              className={`transition-colors duration-300 hover:text-gold-400 font-bold text-gold-400/90 border border-gold-400/20 px-2 py-0.5 rounded text-[9px]`}
            >
              Staff Portal
            </button>
          </nav>

          {/* Center: Luxury Editorial Branding */}
          <button
            onClick={() => handleNav('home')}
            className="flex flex-col items-center justify-center text-center group focus:outline-none md:absolute md:left-1/2 md:-translate-x-1/2"
            id="nav-logo"
          >
            <span className="font-serif text-2xl tracking-[0.2em] font-light text-cream group-hover:text-gold-400 transition-colors duration-300">
              L'HORIZON
            </span>
            <span className="text-[9px] uppercase tracking-[0.5em] mt-[-3px] opacity-70 text-gold-400 font-semibold">
              {t('brand.sub')}
            </span>
          </button>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-10" id="desktop-actions">
            {/* EN/FR Language Indicator */}
            <div className="flex items-center space-x-4 text-[11px] font-semibold text-cream" role="group" aria-label="Language">
              <button
                onClick={() => { if (language !== 'en') toggleLanguage(); }}
                aria-pressed={language === 'en'}
                aria-label="English"
                className={`transition-all ${language === 'en' ? 'text-gold-400 font-bold' : 'text-cream/75 hover:text-cream'}`}
              >
                EN
              </button>
              <span className="text-cream/60" aria-hidden="true">|</span>
              <button
                onClick={() => { if (language !== 'fr') toggleLanguage(); }}
                aria-pressed={language === 'fr'}
                aria-label="Français"
                className={`transition-all ${language === 'fr' ? 'text-gold-400 font-bold' : 'text-cream/75 hover:text-cream'}`}
              >
                FR
              </button>
            </div>

            {/* Premium Gold Reserve CTA */}
            <button
              onClick={() => handleNav('booking')}
              className="border border-gold-400/40 hover:border-gold-400 px-8 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-cream hover:bg-gold-400 hover:text-obsidian transition-all duration-500"
              id="desktop-reserve-cta"
            >
              {t('nav.reserve')}
            </button>
          </div>

          {/* Mobile Toggle Triggers */}
          <div className="md:hidden flex items-center space-x-4" id="mobile-toggle-area">
            {/* Language Toggle for mobile */}
            <button
              onClick={toggleLanguage}
              className="p-1.5 text-cream/80 hover:text-gold-400 transition-colors"
              id="mobile-lang-toggle"
            >
              <Globe className="w-4 h-4 text-gold-400" />
            </button>

            {/* Menu burger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              className="p-1.5 text-cream hover:text-gold-400 transition-colors focus:outline-none"
              id="mobile-burger-trigger"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-obsidian z-40 flex flex-col justify-between pt-28 pb-12 px-8"
            id="mobile-menu-drawer"
          >
            {/* Decorative watermark background */}
            <div className="absolute right-0 bottom-0 text-[18vw] font-serif text-charcoal pointer-events-none select-none tracking-tighter opacity-10">
              ROYAL
            </div>

            <nav className="flex flex-col space-y-6 text-left" id="mobile-nav">
              <span className="text-gold-400/40 text-[10px] tracking-[0.3em] font-sans uppercase font-bold">
                {t('brand.sub')}
              </span>
              <button
                onClick={() => handleNav('home')}
                className={`font-serif text-3xl font-light text-left transition-colors ${
                  currentView === 'home' ? 'text-gold-400' : 'text-cream/90'
                }`}
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => handleNav('rooms')}
                className={`font-serif text-3xl font-light text-left transition-colors ${
                  currentView === 'rooms' ? 'text-gold-400' : 'text-cream/90'
                }`}
              >
                {t('nav.rooms')}
              </button>
              <button
                onClick={() => handleNav('booking')}
                className={`font-serif text-3xl font-light text-left transition-colors ${
                  currentView === 'booking' ? 'text-gold-400' : 'text-cream/90'
                }`}
              >
                {t('nav.booking')}
              </button>
              <button
                onClick={() => handleNav('admin')}
                className="font-serif text-3.5xl font-light text-left transition-colors text-gold-400"
              >
                Staff Portal
              </button>
            </nav>

            <div className="flex flex-col space-y-6" id="mobile-footer">
              <div className="h-[1px] w-full bg-gold-400/10" />
              
              <button
                onClick={() => handleNav('booking')}
                className="w-full py-4 bg-gold-400 text-obsidian text-xs uppercase tracking-[0.2em] font-semibold text-center hover:bg-gold-300 transition-colors duration-300 flex items-center justify-center space-x-2"
                id="mobile-reserve-btn"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('nav.reserve')}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-cream/60 font-mono">
                <span>{t('footer.address')}</span>
                <span className="text-gold-400/60 font-sans uppercase tracking-[0.1em]">L'HORIZON ROYAL</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
