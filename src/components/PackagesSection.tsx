import React from 'react';
import { motion } from 'motion/react';
import { Check, Heart, Leaf, Sailboat } from 'lucide-react';
import { useHotel } from '../HotelContext';
import IllustrativeBadge from './IllustrativeBadge';

// Stay packages with example pricing (labelled on the page). Each one suggests a suite and a length of stay;
// "Plan this stay" takes the visitor to booking with that suite selected.
const PACKAGES = [
  {
    id: 'romance',
    icon: Heart,
    suiteId: 'lhorizon-ocean-suite',
    nights: 3,
    price: 5400,
    en: { name: 'Riviera Romance', perks: ['3 nights in the Ocean Suite', 'Champagne and roses on arrival', 'Couples massage (60 min)', 'Sunset dinner on the terrace'] },
    fr: { name: 'Romance Riviera', perks: ['3 nuits en Suite Océan', 'Champagne et roses à l\'arrivée', 'Massage en duo (60 min)', 'Dîner au coucher du soleil en terrasse'] },
  },
  {
    id: 'wellness',
    icon: Leaf,
    suiteId: 'lhorizon-ocean-suite',
    nights: 4,
    price: 7200,
    en: { name: 'Wellness Retreat', perks: ['4 nights in the Ocean Suite', 'Daily spa treatment', 'Private yoga at sunrise', 'Nutritionist-designed menu'] },
    fr: { name: 'Retraite Bien-être', perks: ['4 nuits en Suite Océan', 'Un soin spa par jour', 'Yoga privé au lever du soleil', 'Menu conçu par un nutritionniste'] },
  },
  {
    id: 'yacht',
    icon: Sailboat,
    suiteId: 'royal-horizon-penthouse',
    nights: 3,
    price: 9800,
    en: { name: 'Penthouse & Yacht', perks: ['3 nights in the Royal Horizon Penthouse', 'Half-day private yacht charter', 'Chauffeured airport transfers', 'Butler service throughout'] },
    fr: { name: 'Penthouse & Yacht', perks: ['3 nuits au Penthouse Royal Horizon', 'Demi-journée de yacht privé', 'Transferts aéroport avec chauffeur', 'Service de majordome'] },
  },
] as const;

export default function PackagesSection() {
  const { language, suites, setSelectedSuite, setView } = useHotel();

  const choose = (suiteId: string) => {
    const suite = suites.find((s) => s.id === suiteId);
    if (suite) setSelectedSuite(suite);
    setView('booking');
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-12" id="packages-section" aria-labelledby="packages-heading">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
          {language === 'en' ? 'Curated stays' : 'Séjours signature'}
        </span>
        <h2 id="packages-heading" className="font-serif text-3xl md:text-5xl font-light tracking-wide text-cream">
          {language === 'en' ? 'Packages' : 'Forfaits'}
        </h2>
        <p className="text-sm text-cream/70 font-sans font-light">
          {language === 'en' ? 'Everything arranged, from arrival to farewell.' : 'Tout est organisé, de l\'arrivée au départ.'}
        </p>
        <p className="text-gold-400">
          <IllustrativeBadge label={language === 'en' ? 'Example pricing' : 'Tarifs indicatifs'} />
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {PACKAGES.map((pkg, i) => {
          const Icon = pkg.icon;
          const copy = pkg[language];
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-charcoal border border-gold-400/15 hover:border-gold-400/40 transition-colors p-8 flex flex-col"
            >
              <Icon className="w-7 h-7 text-gold-400 mb-6" aria-hidden="true" />
              <h3 className="font-serif text-2xl font-light text-cream mb-2">{copy.name}</h3>
              <p className="mb-6">
                <span className="text-sm text-cream/60 font-sans">{language === 'en' ? 'from' : 'à partir de'} </span>
                <span className="font-serif text-3xl text-gold-400">${pkg.price.toLocaleString('en-US')}</span>
                <span className="text-sm text-cream/60 font-sans"> / {pkg.nights} {language === 'en' ? 'nights' : 'nuits'}</span>
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {copy.perks.map((perk) => (
                  <li key={perk} className="flex gap-3 text-sm text-cream/80 font-sans font-light">
                    <Check className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" aria-hidden="true" />
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => choose(pkg.suiteId)}
                className="press w-full py-3 border border-gold-400/40 text-cream text-xs uppercase tracking-widest font-semibold hover:bg-gold-400 hover:text-obsidian transition-colors"
                aria-label={`${language === 'en' ? 'Plan this stay' : 'Préparer ce séjour'}: ${copy.name}`}
              >
                {language === 'en' ? 'Plan this stay' : 'Préparer ce séjour'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
