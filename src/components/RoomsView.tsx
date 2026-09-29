import React, { useEffect, useState } from 'react';
import { useHotel } from '../HotelContext';
import { Suite } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Users, SlidersHorizontal, Eye, CalendarCheck, X, Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import IllustrativeBadge from './IllustrativeBadge';

// Suite photos are placeholders (stock images reused across suites); replace each suite's `images` array in
// HotelContext.tsx with real photography.

// Photo with a shimmer skeleton until it has loaded.
function SuitePhoto({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`w-full h-full ${loaded ? '' : 'skeleton'}`} style={{ borderRadius: 0 }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        ref={(el) => { if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true); }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function RoomsView() {
  const { suites, setView, setSelectedSuite, openSuiteLightbox, setOpenSuiteLightbox, updateReservation, t, language } = useHotel();
  
  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Suites' | 'Penthouses'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [activeLightboxImageIdx, setActiveLightboxImageIdx] = useState<number>(0);

  // Filter logic
  const filteredSuites = suites.filter((suite) => {
    const categoryMatch = selectedCategory === 'All' || suite.category === selectedCategory;
    const priceMatch = suite.price <= maxPrice;
    return categoryMatch && priceMatch;
  });

  // Action: Select suite & proceed to booking
  const handleSelectSuiteForBooking = (suite: Suite) => {
    setSelectedSuite(suite);
    updateReservation({ selectedSuiteId: suite.id });
    setOpenSuiteLightbox(null); // close if open
    setView('booking');
  };

  // Lightbox Image Navigator
  const handleNextLightboxImage = (imagesLength: number) => {
    setActiveLightboxImageIdx((prev) => (prev + 1) % imagesLength);
  };

  const handlePrevLightboxImage = (imagesLength: number) => {
    setActiveLightboxImageIdx((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  const openGallery = (suite: Suite, index = 0) => {
    setOpenSuiteLightbox(suite);
    setActiveLightboxImageIdx(index);
  };

  // Keyboard support for the gallery: Escape closes, arrow keys change photo
  useEffect(() => {
    if (!openSuiteLightbox) return;
    const count = openSuiteLightbox.images.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSuiteLightbox(null);
      if (e.key === 'ArrowRight') setActiveLightboxImageIdx((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setActiveLightboxImageIdx((i) => (i - 1 + count) % count);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openSuiteLightbox, setOpenSuiteLightbox]);

  return (
    <div className="bg-obsidian min-h-screen text-cream pt-28 pb-20" id="rooms-view">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header Introduction */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
            {t('nav.rooms')}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-cream">
            {language === 'en' ? 'Sovereign Suites & Private Penthouses' : 'Suites Souveraines & Penthouses Privés'}
          </h1>
          <p className="text-xs md:text-sm text-cream/60 leading-relaxed font-sans font-light">
            {language === 'en' 
              ? 'Immerse yourself in unrivaled contemporary coastal opulence, styled with precision engineering and majestic luxury accents.' 
              : 'Immergez-vous dans une opulence côtière contemporaine inégalée, conçue avec une ingénierie de précision et des accents royaux.'}
          </p>
        </div>

        {/* Dynamic Filter Controls Panel */}
        <div className="bg-charcoal/80 border border-gold-400/10 p-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6" id="filter-panel">
          {/* Category Switcher Tabs */}
          <div className="flex flex-wrap gap-2.5" id="category-tabs">
            {(['All', 'Suites', 'Penthouses'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gold-400 text-obsidian font-bold'
                    : 'bg-obsidian/50 border border-gold-400/15 text-cream/70 hover:border-gold-400/50 hover:text-cream'
                }`}
              >
                {cat === 'All' ? t('filters.all') : cat === 'Suites' ? t('filters.suites') : t('filters.penthouses')}
              </button>
            ))}
          </div>

          {/* Interactive Price Range Slider */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:shrink-0" id="price-slider-box">
            <div className="flex items-center space-x-2 text-gold-400/80">
              <SlidersHorizontal className="w-4 h-4 text-gold-400" />
              <span className="text-[10px] font-sans uppercase tracking-[0.15em] font-semibold">{t('filters.price_limit')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={750}
                max={3500}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label={t('filters.price_limit')}
                className="w-32 md:w-48 accent-gold-400 bg-obsidian cursor-pointer h-1"
              />
              <span className="font-mono text-xs font-semibold text-cream bg-obsidian border border-gold-400/15 px-3 py-1.5 min-w-[90px] text-center">
                ${maxPrice} / n
              </span>
            </div>
          </div>
        </div>

        {/* Rooms Listing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" id="rooms-grid">
          <AnimatePresence mode="popLayout">
            {filteredSuites.map((suite) => (
              <motion.div
                key={suite.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-charcoal border border-gold-400/10 hover:border-gold-400/30 transition-all duration-500 flex flex-col overflow-hidden group"
                id={`room-card-${suite.id}`}
              >
                {/* Showcase Image container with hover scaling */}
                <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                  <SuitePhoto src={suite.image} alt={suite.name[language]} className="transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60 pointer-events-none" />
                  
                  {/* Category floating badge */}
                  <div className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-sm border border-gold-400/20 px-3 py-1.5 text-[9px] font-mono tracking-widest text-gold-400 uppercase font-bold">
                    {suite.category}
                  </div>

                  {/* Micro eye tool on image hover */}
                  <button
                    onClick={() => openGallery(suite)}
                    aria-label={`${t('filters.view_details')}: ${suite.name[language]}`}
                    className="absolute bottom-4 right-4 bg-obsidian/90 backdrop-blur-md border border-gold-400/20 p-2.5 text-gold-400 hover:bg-gold-400 hover:text-obsidian transition-all duration-300 shadow-xl"
                    title={t('filters.view_details')}
                    id={`open-lightbox-trigger-${suite.id}`}
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Small photo gallery: each thumbnail opens the gallery at that photo */}
                <div className="grid grid-cols-3 gap-1 bg-obsidian p-1" role="group" aria-label={language === 'en' ? `${suite.name.en} photos` : `Photos ${suite.name.fr}`}>
                  {suite.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => openGallery(suite, idx)}
                      className="aspect-[4/3] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
                      aria-label={language === 'en' ? `Open photo ${idx + 1} of ${suite.images.length}` : `Ouvrir la photo ${idx + 1} sur ${suite.images.length}`}
                    >
                      <SuitePhoto src={img.replace('w=1200', 'w=400')} alt="" className="hover:scale-105 transition-transform duration-500" />
                    </button>
                  ))}
                </div>

                {/* Info and action panel */}
                <div className="p-8 flex-1 flex flex-col justify-between text-left space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-2xl md:text-3xl font-light text-cream tracking-wide group-hover:text-gold-400 transition-colors duration-300">
                        {suite.name[language]}
                      </h3>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-cream/60 uppercase tracking-widest font-sans block">{language === 'en' ? 'Nightly Rate' : 'Prix par nuit'}</span>
                        <span className="font-serif text-xl md:text-2xl font-light text-gold-400">${suite.price}</span>
                      </div>
                    </div>

                    <p className="text-xs text-cream/65 leading-relaxed font-sans font-light">
                      {suite.description[language]}
                    </p>

                    {/* Room Metadata (Area & Occupancy) */}
                    <div className="flex items-center space-x-6 border-t border-b border-gold-400/5 py-3.5">
                      <div className="flex items-center space-x-2 text-xs text-cream/50">
                        <Maximize2 className="w-4 h-4 text-gold-400/70" />
                        <span className="font-sans font-light">{t('filters.size_label')}: <strong className="text-cream font-mono">{suite.size} m²</strong></span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-cream/50">
                        <Users className="w-4 h-4 text-gold-400/70" />
                        <span className="font-sans font-light">{t('filters.guests_label')}: <strong className="text-cream font-mono">{suite.maxOccupancy}</strong></span>
                      </div>
                    </div>

                    {/* Amenities checklist */}
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold font-sans mb-3">{t('filters.amenities_label')}</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-cream/80 font-sans font-light">
                        {suite.amenities[language].map((amenity) => (
                          <li key={amenity} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Highlights bullet array */}
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs text-cream/70 font-sans font-light">
                      {suite.highlights[language].slice(0, 4).map((highlight, index) => (
                        <li key={index} className="flex items-center space-x-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                          <span className="truncate">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-4 pt-4">
                    {/* View Blueprint button */}
                    <button
                      onClick={() => openGallery(suite)}
                      className="press flex-1 py-3 border border-gold-400/20 text-cream text-xs uppercase tracking-widest font-semibold hover:border-gold-400 hover:bg-gold-400/5 transition-all duration-300"
                    >
                      {t('filters.view_details')}
                    </button>

                    {/* Book directly button */}
                    <button
                      onClick={() => handleSelectSuiteForBooking(suite)}
                      className="press flex-1 py-3 bg-gold-400 text-obsidian text-xs uppercase tracking-widest font-bold hover:bg-gold-500 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg"
                      id={`book-suite-action-${suite.id}`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>{t('filters.book_now')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <p className="mt-10 text-center text-gold-400">
          <IllustrativeBadge label={language === 'en' ? 'Placeholder photos' : 'Photos d\'illustration'} />
        </p>

        {/* Empty Search Fallback */}
        {filteredSuites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-charcoal border border-gold-400/10 p-12 max-w-md mx-auto space-y-4"
            id="empty-search"
          >
            <Info className="w-10 h-10 text-gold-400 mx-auto" />
            <h3 className="font-serif text-xl font-light text-cream">{language === 'en' ? 'No Sanctuary Found' : 'Aucune suite correspondante'}</h3>
            <p className="text-xs text-cream/60 leading-relaxed font-sans font-light">
              {language === 'en' 
                ? 'There are no luxury rooms fitting your specific budget parameters. Please expand your price limits.' 
                : 'Aucune de nos suites prestigieuses ne correspond à vos paramètres budgétaires. Veuillez étendre vos limites de prix.'}
            </p>
            <button
              onClick={() => {
                setMaxPrice(3500);
                setSelectedCategory('All');
              }}
              className="px-6 py-2 border border-gold-400 text-gold-400 text-[10px] uppercase tracking-widest font-bold hover:bg-gold-400 hover:text-obsidian transition-all duration-300"
            >
              Reset Rate Limit
            </button>
          </motion.div>
        )}
      </div>

      {/* 8. LIGHTBOX FEATURE EXPLORER MODAL OVERLAY */}
      <AnimatePresence>
        {openSuiteLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto"
            id="lightbox-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={openSuiteLightbox.name[language]}
              className="bg-charcoal border border-gold-400/20 max-w-6xl w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl rounded-none relative"
              id="lightbox-modal"
            >
              {/* Abs Close Button */}
              <button
                onClick={() => setOpenSuiteLightbox(null)}
                aria-label={language === 'en' ? 'Close' : 'Fermer'}
                autoFocus
                className="absolute top-4 right-4 z-50 bg-obsidian/80 border border-gold-400/25 p-2.5 text-cream hover:text-gold-400 hover:border-gold-400 transition-all rounded-full"
                id="lightbox-close-btn"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Left Side: Dynamic Photo Slideshow */}
              <div className="w-full md:w-1/2 bg-black flex flex-col justify-between relative" id="lightbox-slideshow">
                <div className="relative aspect-[4/3] w-full flex-1 min-h-[300px] md:min-h-0 bg-neutral-900">
                  <img
                    src={openSuiteLightbox.images[activeLightboxImageIdx]}
                    alt={`${openSuiteLightbox.name[language]} (${activeLightboxImageIdx + 1}/${openSuiteLightbox.images.length})`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Manual Carousel Arrows */}
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                    <button
                      onClick={() => handlePrevLightboxImage(openSuiteLightbox.images.length)}
                      aria-label={language === 'en' ? 'Previous photo' : 'Photo précédente'}
                      className="w-9 h-9 rounded-full bg-obsidian/85 border border-gold-400/15 text-cream hover:text-gold-400 hover:border-gold-400 transition-all flex items-center justify-center pointer-events-auto"
                      id="lightbox-image-prev"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleNextLightboxImage(openSuiteLightbox.images.length)}
                      aria-label={language === 'en' ? 'Next photo' : 'Photo suivante'}
                      className="w-9 h-9 rounded-full bg-obsidian/85 border border-gold-400/15 text-cream hover:text-gold-400 hover:border-gold-400 transition-all flex items-center justify-center pointer-events-auto"
                      id="lightbox-image-next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid Thumbnails Navigator */}
                <div className="p-4 bg-obsidian/90 border-t border-gold-400/10 flex gap-2.5 items-center justify-center">
                  {openSuiteLightbox.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveLightboxImageIdx(idx)}
                      aria-label={language === 'en' ? `Photo ${idx + 1}` : `Photo ${idx + 1}`}
                      aria-current={idx === activeLightboxImageIdx ? 'true' : undefined}
                      className={`w-14 h-11 border overflow-hidden transition-all duration-300 ${
                        idx === activeLightboxImageIdx ? 'border-gold-400' : 'border-gold-400/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.replace('w=1200', 'w=200')} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Architectural Blueprint Features */}
              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between space-y-8 text-left" id="lightbox-blueprint">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-[0.2em] text-gold-400 uppercase font-sans font-semibold">
                      {openSuiteLightbox.category} Sanctuary
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-cream">
                      {openSuiteLightbox.name[language]}
                    </h2>
                    <p className="font-serif text-2xl text-gold-400/90 font-light pt-1">
                      ${openSuiteLightbox.price} <span className="text-xs text-cream/60 font-sans">/ {t('filters.night')}</span>
                    </p>
                  </div>

                  <p className="text-xs text-cream/70 leading-relaxed font-sans font-light">
                    {openSuiteLightbox.description[language]}
                  </p>

                  <div className="h-[1px] w-full bg-gold-400/10" />

                  {/* Amenities List */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold font-sans">
                      {t('filters.amenities_label')}
                    </h4>
                    <ul className="grid grid-cols-2 gap-3 text-xs text-cream/80 font-sans font-light">
                      {openSuiteLightbox.amenities[language].map((amenity, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <Check className="w-3 h-3 text-gold-400 shrink-0" aria-hidden="true" />
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-[1px] w-full bg-gold-400/10" />

                  {/* Resort Policy brief */}
                  <div className="space-y-2 bg-obsidian/40 border border-gold-400/5 p-4">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold font-sans flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-gold-400" />
                      <span>{t('lightbox.policies')}</span>
                    </h4>
                    <p className="text-[11px] text-cream/50 leading-relaxed font-sans font-light">
                      {t('lightbox.policy_desc')}
                    </p>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <div className="pt-4">
                  <button
                    onClick={() => handleSelectSuiteForBooking(openSuiteLightbox)}
                    className="w-full py-4 bg-gold-400 hover:bg-gold-500 text-obsidian text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-xl flex items-center justify-center space-x-3"
                    id="lightbox-reserve-direct"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{t('filters.book_now')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
