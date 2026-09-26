import React, { useState } from 'react';
import { useHotel } from '../HotelContext';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, ArrowRight, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: {
      en: "An absolute masterclass in luxury. The level of bespoke service from our personal butler was beyond anything we have experienced in Tokyo or Paris.",
      fr: "Un chef-d'œuvre absolu de luxe. Le niveau de service sur mesure de notre majordome personnel a dépassé tout ce que nous avons connu à Tokyo ou Paris."
    },
    author: "Lady Eleanor Sterling",
    location: "London, UK",
    rating: 5
  },
  {
    quote: {
      en: "L'Horizon Royal is not just a hotel, it is an architectural dream. The 360-degree views from the Presidential Suite are engraved in our memory forever.",
      fr: "L'Horizon Royal n'est pas seulement un hôtel, c'est un rêve architectural. La vue à 360 degrés depuis la Suite Présidentielle restera gravée à jamais."
    },
    author: "Jean-Laurent Dupond",
    location: "Geneva, Switzerland",
    rating: 5
  },
  {
    quote: {
      en: "The culinary experience at L'Or Rouge was legendary. Every dish is a symphony of flavor paired with rare vintage wines.",
      fr: "L'expérience culinaire à L'Or Rouge fut légendaire. Chaque plat est une symphonie de saveurs accompagnée de vins millésimés d'exception."
    },
    author: "Marcella & Stefano Rossi",
    location: "Milan, Italy",
    rating: 5
  }
];

export default function HomeView() {
  const { setView, suites, reservation, updateReservation, t, language, today } = useHotel();
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Filter 3 top featured suites to display on Homepage
  const featuredSuites = suites.slice(0, 3);

  const handleNextReview = () => {
    setActiveReviewIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrevReview = () => {
    setActiveReviewIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Triggers search of available rooms
  const handleExploreAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    setView('rooms');
  };

  return (
    <div className="bg-obsidian text-cream" id="home-view">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden" id="hero-section">
        {/* Luxury Editorial Split Background */}
        <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
          {/* Left Column with Faint Watermark */}
          <div className="w-full md:w-1/2 h-full bg-charcoal border-r border-white/5 flex items-center justify-center relative overflow-hidden">
            <div className="opacity-[0.04] text-[18rem] md:text-[25rem] lg:text-[32rem] serif italic font-light select-none text-gold-400">
              H
            </div>
          </div>
          {/* Right Column with Curated Coastal Imagery */}
          <div className="w-full md:w-1/2 h-full bg-[#1C1C1E] relative">
            <video
              src="/hotel-hero.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-50 filter brightness-[85%]"
            />
            {/* Ambient Hero Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
            <div className="absolute bottom-28 right-12 text-right hidden lg:block">
              <p className="font-serif italic text-2xl mb-1 text-gold-400 font-light">The Royal Suite</p>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-sans">L'Horizon Royal, France</p>
            </div>
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 text-center max-w-4xl px-6 md:px-12 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11px] tracking-[0.6em] text-gold-400 font-sans font-semibold uppercase mb-6"
          >
            {t('hero.sub')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[42px] sm:text-[70px] lg:text-[100px] leading-[1.05] sm:leading-[0.95] lg:leading-[0.9] font-light text-cream tracking-normal text-center mb-8"
          >
            {language === 'en' ? (
              <>
                Experience <br/>
                <span className="italic font-light px-4 text-gold-400">the</span> Infinite
              </>
            ) : (
              <>
                Découvrez <br/>
                <span className="italic font-light px-4 text-gold-400">l'</span> Infini
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-sm text-cream/70 font-sans font-light max-w-2xl leading-relaxed mb-12 uppercase tracking-[0.15em]"
          >
            {t('hero.desc')}
          </motion.p>

          {/* Animated Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="hidden md:flex flex-col items-center absolute bottom-12 text-cream/40"
            id="scroll-indicator"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] mb-2 font-sans font-medium">
              {t('hero.scroll')}
            </span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-gold-400 to-transparent animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* 2. FLOATING BOOKING CARD WIDGET */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 -mt-16 md:-mt-24 mb-28" id="floating-booking-widget">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-charcoal/85 backdrop-blur-[20px] border border-white/10 shadow-2xl p-6 md:p-8 rounded-none"
        >
          <form onSubmit={handleExploreAvailability} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Check in input */}
            <div className="space-y-2 border-r border-white/5 pr-4 last:border-0">
              <label className="text-[10px] uppercase tracking-widest text-gold-400 font-sans font-semibold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gold-400/80" />
                <span>{t('bookbar.checkin')}</span>
              </label>
              <input
                type="date"
                required
                value={reservation.checkIn}
                min={today || undefined}
                aria-label={t('bookbar.checkin')}
                onChange={(e) => updateReservation({ checkIn: e.target.value })}
                className="w-full bg-transparent border-0 text-cream px-0 py-2 text-xs focus:outline-none focus:ring-0 transition-colors font-mono"
              />
            </div>

            {/* Check out input */}
            <div className="space-y-2 border-r border-white/5 pr-4 last:border-0">
              <label className="text-[10px] uppercase tracking-widest text-gold-400 font-sans font-semibold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gold-400/80" />
                <span>{t('bookbar.checkout')}</span>
              </label>
              <input
                type="date"
                required
                value={reservation.checkOut}
                min={reservation.checkIn || undefined}
                aria-label={t('bookbar.checkout')}
                onChange={(e) => updateReservation({ checkOut: e.target.value })}
                className="w-full bg-transparent border-0 text-cream px-0 py-2 text-xs focus:outline-none focus:ring-0 transition-colors font-mono"
              />
            </div>

            {/* Guests count input */}
            <div className="space-y-2 border-r border-white/5 pr-4 last:border-0">
              <label className="text-[10px] uppercase tracking-widest text-gold-400 font-sans font-semibold flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-gold-400/80" />
                <span>{t('bookbar.guests')}</span>
              </label>
              <select
                value={reservation.guests}
                onChange={(e) => updateReservation({ guests: parseInt(e.target.value) })}
                className="w-full bg-transparent border-0 text-cream px-0 py-2 text-xs focus:outline-none focus:ring-0 transition-colors font-sans cursor-pointer"
              >
                <option value={1} className="bg-charcoal text-cream">1 {language === 'en' ? 'Guest' : 'Voyageur'}</option>
                <option value={2} className="bg-charcoal text-cream">2 {language === 'en' ? 'Guests' : 'Voyageurs'}</option>
                <option value={3} className="bg-charcoal text-cream">3 {language === 'en' ? 'Guests' : 'Voyageurs'}</option>
                <option value={4} className="bg-charcoal text-cream">4 {language === 'en' ? 'Guests' : 'Voyageurs'}</option>
                <option value={6} className="bg-charcoal text-cream">6 {language === 'en' ? 'Guests' : 'Voyageurs'}</option>
              </select>
            </div>

            {/* Explore button */}
            <div>
              <button
                type="submit"
                className="w-full bg-gold-400 hover:bg-gold-500 text-obsidian text-[11px] uppercase tracking-widest font-bold py-4 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>{t('bookbar.search')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* 3. BRAND LEGACY SPOTLIGHT (Split Screen Narrative) */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 border-b border-gold-400/10 overflow-x-clip" id="legacy-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Text blocks */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
                {t('legacy.sub')}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-cream leading-tight">
                {t('legacy.title')}
              </h2>
            </div>
            <p className="text-cream/70 text-sm md:text-base leading-relaxed font-sans font-light">
              {t('legacy.text1')}
            </p>
            <p className="text-cream/50 text-sm leading-relaxed font-sans font-light">
              {t('legacy.text2')}
            </p>
            
            {/* Elegant blockquote */}
            <div className="border-l-2 border-gold-400/60 pl-6 py-2 space-y-2">
              <p className="font-serif italic text-lg text-gold-200/95">
                {t('legacy.quote')}
              </p>
              <p className="text-xs text-gold-400 font-sans tracking-[0.1em]">
                {t('legacy.founder')}
              </p>
            </div>
          </div>

          {/* Right: Immersive image with overlay border */}
          <div className="lg:col-span-5 relative" id="legacy-image-box">
            <div className="absolute -inset-4 border border-gold-400/10 translate-x-3 translate-y-3 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              alt="L'Horizon Royal Palace Noble Heritage"
              className="w-full aspect-[4/5] object-cover relative z-10 grayscale-[15%] brightness-95"
              referrerPolicy="no-referrer"
            />
            {/* Small floating badge */}
            <div className="absolute top-6 right-6 bg-obsidian/90 backdrop-blur-md border border-gold-400/20 px-4 py-3 z-20 text-center">
              <p className="font-serif text-2xl font-light text-gold-400">100</p>
              <p className="text-[7px] font-sans tracking-[0.2em] text-cream/60 uppercase">Years of Luxury</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SUITES GRID */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12" id="featured-suites-section">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 text-left">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
              {t('featured.sub')}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-cream">
              {t('featured.title')}
            </h2>
          </div>
          <button
            onClick={() => setView('rooms')}
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gold-400/90 hover:text-gold-400 font-semibold group border-b border-gold-400/20 pb-1 cursor-pointer"
          >
            <span>{t('featured.explore_all')}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Modular Suite Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="featured-suites-grid">
          {featuredSuites.map((suite, idx) => (
            <motion.div
              key={suite.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="bg-charcoal border border-gold-400/10 group overflow-hidden relative"
              id={`featured-suite-card-${suite.id}`}
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={suite.image}
                  alt={suite.name[language]}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-[0.16, 1, 0.3, 1]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-obsidian/85 backdrop-blur-sm px-3 py-1.5 border border-gold-400/20">
                  <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">
                    {suite.category}
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6 text-left">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-light text-cream group-hover:text-gold-400 transition-colors duration-300">
                    {suite.name[language]}
                  </h3>
                  <p className="text-xs text-cream/50 font-sans font-light line-clamp-2 leading-relaxed">
                    {suite.description[language]}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gold-400/5 pt-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-cream/40 uppercase tracking-widest font-sans">{language === 'en' ? 'From Rate' : 'À partir de'}</span>
                    <span className="font-serif text-xl font-light text-gold-400">
                      ${suite.price} <span className="text-[10px] font-sans text-cream/50">/ {t('filters.night')}</span>
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] text-cream/40 uppercase tracking-widest font-sans">{t('filters.size_label')}</span>
                    <span className="text-xs font-mono font-medium text-cream/80">{suite.size} m²</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    updateReservation({ selectedSuiteId: suite.id });
                    setView('rooms');
                  }}
                  className="w-full py-3 border border-gold-400/20 text-center text-xs uppercase tracking-widest font-semibold text-gold-400 group-hover:bg-gold-400 group-hover:text-obsidian transition-all duration-300 cursor-pointer"
                >
                  {t('filters.view_details')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. SIGNATURE LUXURIES (Amenities Grid with border reveal effects) */}
      <section className="py-24 bg-charcoal/40 border-t border-b border-gold-400/10" id="signature-luxuries-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
              {t('luxuries.sub')}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-cream">
              {t('luxuries.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8" id="luxuries-reveal-grid">
            {/* Spa */}
            <div className="border border-gold-400/10 p-8 text-left space-y-4 hover:border-gold-400 transition-colors duration-500 relative group">
              <div className="w-12 h-12 rounded-full border border-gold-400/10 flex items-center justify-center mb-6 group-hover:border-gold-400 transition-colors duration-300">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-light text-cream">{t('luxuries.spa')}</h3>
              <p className="text-xs text-cream/50 leading-relaxed font-sans font-light">
                {t('luxuries.spa_desc')}
              </p>
            </div>

            {/* Michelin Dining */}
            <div className="border border-gold-400/10 p-8 text-left space-y-4 hover:border-gold-400 transition-colors duration-500 relative group">
              <div className="w-12 h-12 rounded-full border border-gold-400/10 flex items-center justify-center mb-6 group-hover:border-gold-400 transition-colors duration-300">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-light text-cream">{t('luxuries.dining')}</h3>
              <p className="text-xs text-cream/50 leading-relaxed font-sans font-light">
                {t('luxuries.dining_desc')}
              </p>
            </div>

            {/* Infinity Pool */}
            <div className="border border-gold-400/10 p-8 text-left space-y-4 hover:border-gold-400 transition-colors duration-500 relative group">
              <div className="w-12 h-12 rounded-full border border-gold-400/10 flex items-center justify-center mb-6 group-hover:border-gold-400 transition-colors duration-300">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-light text-cream">{t('luxuries.pool')}</h3>
              <p className="text-xs text-cream/50 leading-relaxed font-sans font-light">
                {t('luxuries.pool_desc')}
              </p>
            </div>

            {/* Yacht Charter */}
            <div className="border border-gold-400/10 p-8 text-left space-y-4 hover:border-gold-400 transition-colors duration-500 relative group">
              <div className="w-12 h-12 rounded-full border border-gold-400/10 flex items-center justify-center mb-6 group-hover:border-gold-400 transition-colors duration-300">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-light text-cream">{t('luxuries.yacht')}</h3>
              <p className="text-xs text-cream/50 leading-relaxed font-sans font-light">
                {t('luxuries.yacht_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CULINARY SHOWCASE */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12" id="culinary-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Beautiful gourmet gastronomy image */}
          <div className="lg:col-span-6 relative order-last lg:order-first">
            <div className="absolute -inset-4 border border-gold-400/10 -translate-x-3 -translate-y-3 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
              alt="L'Or Rouge Michelin Gastronomy Fine Dining"
              className="w-full aspect-[4/3] object-cover relative z-10 brightness-95"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right: Text elements */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
                {t('culinary.sub')}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-cream">
                {t('culinary.title')}
              </h2>
            </div>
            <p className="text-cream/75 text-sm md:text-base leading-relaxed font-sans font-light">
              {t('culinary.desc')}
            </p>
            <div>
              <button
                onClick={() => {
                  // Direct to contact form or show menu in future, let's trigger search or show alert, or transition safely
                  setView('booking');
                }}
                className="px-8 py-3 bg-transparent border border-gold-400/30 text-gold-400 text-xs uppercase tracking-[0.2em] font-bold hover:border-gold-400 hover:bg-gold-400/10 transition-all duration-300"
              >
                {t('culinary.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GUEST REVIEWS (Elegant, custom cross-fade testimonials) */}
      <section className="py-24 bg-charcoal border-t border-gold-400/10 relative overflow-hidden" id="reviews-section">
        {/* Absolute quotation mark watermark */}
        <div className="absolute left-10 top-10 font-serif text-[18rem] leading-none text-gold-400/5 select-none pointer-events-none">
          “
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
              {t('reviews.sub')}
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-light tracking-wide text-cream">
              {t('reviews.title')}
            </h2>
          </div>

          {/* Testimonial slider space */}
          <div className="min-h-[160px] flex items-center justify-center px-4 md:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReviewIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <p className="font-serif text-lg md:text-2xl font-light italic leading-relaxed text-cream/90">
                  "{TESTIMONIALS[activeReviewIndex].quote[language]}"
                </p>
                <div className="space-y-1">
                  <p className="font-sans text-xs uppercase tracking-widest text-gold-400 font-bold">
                    {TESTIMONIALS[activeReviewIndex].author}
                  </p>
                  <p className="font-mono text-[10px] text-cream/40">
                    {TESTIMONIALS[activeReviewIndex].location}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Manual navigation triggers and Star rating indicators */}
          <div className="flex flex-col items-center space-y-6 pt-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevReview}
                className="w-10 h-10 border border-gold-400/10 rounded-full flex items-center justify-center text-cream/60 hover:text-gold-400 hover:border-gold-400 transition-all duration-300"
                id="review-prev-btn"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveReviewIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeReviewIndex ? 'bg-gold-400 w-4' : 'bg-gold-400/20'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextReview}
                className="w-10 h-10 border border-gold-400/10 rounded-full flex items-center justify-center text-cream/60 hover:text-gold-400 hover:border-gold-400 transition-all duration-300"
                id="review-next-btn"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
