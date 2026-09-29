import React from 'react';
import { useHotel } from '../HotelContext';
import { Mail, Phone, MapPin } from 'lucide-react';
import IllustrativeBadge from './IllustrativeBadge';
import { VIEW_PATHS } from '../HotelContext';

// Fictional contact details for this demo hotel: +33 1 99 00 xx xx is a range reserved in France for fiction,
// and .example domains can never be registered.
const PHONE = '+33 (0)1 99 00 45 50';
const EMAIL = 'reservations@lhorizon-royal.example';

export default function LuxuryFooter() {
  const { setView, t, language } = useHotel();

  const handleNav = (view: 'home' | 'rooms' | 'booking') => {
    setView(view);
  };

  return (
    <footer className="bg-charcoal border-t border-gold-400/10 text-cream/70 pt-20 pb-12 overflow-hidden relative" id="luxury-footer">
      {/* Absolute decorative backdrops */}
      <div className="absolute right-0 bottom-0 text-[16vw] font-serif text-obsidian pointer-events-none select-none tracking-tighter opacity-[0.03] translate-y-12 translate-x-12">
        Horizon
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Editorial Stats Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-white/5 pb-12 mb-16 gap-8">
          <div className="flex flex-wrap gap-x-16 gap-y-6">
            <div className="flex flex-col">
              <span className="font-serif text-3xl text-gold-400 mb-1">01.</span>
              <span className="text-[11px] uppercase tracking-widest text-cream/70 font-sans font-semibold">Michelin Dining</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-3xl text-gold-400 mb-1">14k</span>
              <span className="text-[11px] uppercase tracking-widest text-cream/70 font-sans font-semibold">Sq. Ft Wellness</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-3xl text-gold-400 mb-1">24/7</span>
              <span className="text-[11px] uppercase tracking-widest text-cream/70 font-sans font-semibold">Personal Butler</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="w-12 h-[1px] bg-white/20 hidden sm:block"></div>
            <p className="max-w-xs text-[11px] leading-relaxed text-cream/70 font-light text-left lg:text-right font-sans">
              Named 'Palace of the Year' by the Elite Travel Guild for five consecutive seasons of uncompromising excellence.
              <span className="block mt-2 text-gold-400"><IllustrativeBadge label={language === 'en' ? 'Illustrative example' : 'Exemple illustratif'} /></span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Profile Column */}
          <div className="md:col-span-1 space-y-6" id="footer-col-brand">
            <div className="flex flex-col text-left">
              <span className="font-serif text-2xl font-light tracking-[0.2em] text-cream">
                L'HORIZON
              </span>
              <span className="text-[9px] font-sans tracking-[0.3em] text-gold-400 font-semibold">
                {t('brand.sub')}
              </span>
            </div>
            <p className="text-xs text-cream/50 leading-relaxed font-sans font-light">
              {t('footer.desc')}
            </p>
          </div>

          {/* Quick Navigation Column */}
          <div className="space-y-6" id="footer-col-nav">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans">
              {t('footer.pages')}
            </h4>
            <ul className="space-y-3.5 text-xs font-sans font-light">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-gold-400 transition-colors duration-200 text-left cursor-pointer"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('rooms')}
                  className="hover:text-gold-400 transition-colors duration-200 text-left cursor-pointer"
                >
                  {t('nav.rooms')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('booking')}
                  className="hover:text-gold-400 transition-colors duration-200 text-left cursor-pointer"
                >
                  {t('nav.booking')}
                </button>
              </li>
            </ul>
          </div>

          {/* Corporate Legal Column */}
          <div className="space-y-6" id="footer-col-legal">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-3.5 text-xs font-sans font-light">
              <li>
                <a
                  href={VIEW_PATHS.terms}
                  onClick={(e) => { e.preventDefault(); setView('terms'); }}
                  className="hover:text-gold-400 transition-colors duration-200"
                >
                  {t('footer.legal1')}
                </a>
              </li>
              <li>
                <a
                  href={VIEW_PATHS.privacy}
                  onClick={(e) => { e.preventDefault(); setView('privacy'); }}
                  className="hover:text-gold-400 transition-colors duration-200"
                >
                  {t('footer.legal2')}
                </a>
              </li>
              <li>
                <a
                  href={VIEW_PATHS.cookies}
                  onClick={(e) => { e.preventDefault(); setView('cookies'); }}
                  className="hover:text-gold-400 transition-colors duration-200"
                >
                  {t('footer.legal3')}
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Contacts Column */}
          <div className="space-y-6" id="footer-col-contact">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3.5 text-xs font-sans font-light">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-cream/50">{t('footer.address')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-cream/80 font-medium">{PHONE}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a href={`mailto:${EMAIL}`} className="hover:text-gold-400 transition-colors break-all">
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="border-t border-gold-400/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" id="footer-bottom">
          <p className="text-[10px] font-mono tracking-wider text-cream/60 text-center md:text-left">
            {t('footer.rights')} {t('footer.sampleReviews')}
            <span className="block mt-1">
              {t('footer.builtBy')} ·{' '}
              <a href="mailto:abdulwahababdullahi3619@gmail.com" className="text-gold-400 underline hover:text-gold-400 transition-colors">{t('footer.contactDev')}</a>
            </span>
          </p>
          <div className="flex items-center space-x-6 text-[10px] font-mono text-gold-400/70">
            <span>SOVEREIGN PRIVATE CLASS</span>
            <span>SECURED SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
