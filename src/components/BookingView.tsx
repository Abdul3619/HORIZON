import React, { useState, useEffect } from 'react';
import { useHotel } from '../HotelContext';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Calendar, Users, Percent, ShieldCheck, CheckCircle2, Copy, Sparkles, AlertCircle, RefreshCw, Hotel } from 'lucide-react';

export default function BookingView() {
  const { reservation, updateReservation, suites, selectedSuite, setSelectedSuite, t, language } = useHotel();

  // Local form/checkout states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success' | 'invalid'>('idle');

  // Submit states
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [mockBookingRef, setMockBookingRef] = useState('');

  // Auto-format card number as 16 digits spacing
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Calculate Nights Stayed based on arrival / departure
  const getStayNights = (): number => {
    try {
      const d1 = new Date(reservation.checkIn);
      const d2 = new Date(reservation.checkOut);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
      
      const diffTime = d2.getTime() - d1.getTime();
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 1;
    } catch {
      return 1;
    }
  };

  const nights = getStayNights();
  
  // Active suite selection
  const currentSuite = selectedSuite || suites.find(s => s.id === reservation.selectedSuiteId) || null;

  // Cost calculations
  const pricePerNight = currentSuite ? currentSuite.price : 0;
  const subtotal = pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.12); // 12%
  const discountAmount = Math.round((subtotal + taxes) * (reservation.discountPercentage / 100));
  const totalAmount = subtotal + taxes - discountAmount;

  // Redeem Code Trigger
  const handleRedeemPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'ROYAL15') {
      updateReservation({ promoCode: 'ROYAL15', discountPercentage: 15 });
      setPromoStatus('success');
    } else if (code === 'LHORIZON') {
      updateReservation({ promoCode: 'LHORIZON', discountPercentage: 20 });
      setPromoStatus('success');
    } else {
      setPromoStatus('invalid');
    }
  };

  // Checkout Authorization Submission
  const handleAuthorizeBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSuite) return;

    setIsProcessing(true);

    // Simulate elite bank validation sequence
    setTimeout(() => {
      // Generate unique mock reference
      const refCode = `LHR-${Math.floor(100000 + Math.random() * 900000)}-2026`;
      setMockBookingRef(refCode);
      setIsProcessing(false);
      setBookingConfirmed(true);
    }, 1800);
  };

  // Reset booking form on return
  const handleResetWorkspace = () => {
    setBookingConfirmed(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCardName('');
    setCardNumber('');
    setCardExp('');
    setCardCvv('');
    setPromoInput('');
    setPromoStatus('idle');
    updateReservation({ promoCode: '', discountPercentage: 0 });
    setSelectedSuite(null);
  };

  return (
    <div className="bg-obsidian min-h-screen text-cream pt-28 pb-20" id="booking-workspace">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <AnimatePresence mode="wait">
          {!bookingConfirmed ? (
            <motion.div
              key="booking-form-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              
              {/* Left Column: Form & Selection (7 Cols) */}
              <div className="lg:col-span-7 space-y-8" id="booking-form-area">
                <div className="text-left space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans font-semibold">
                    {t('nav.booking')}
                  </span>
                  <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide text-cream">
                    {t('checkout.title')}
                  </h1>
                </div>

                {/* Section A: Suite Selection State */}
                <div className="bg-charcoal border border-gold-400/10 p-6 md:p-8 space-y-6 text-left" id="step-suite-selector">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-gold-400" />
                    <span>{language === 'en' ? 'Residence Sanctuary Selection' : 'Choix de votre résidence'}</span>
                  </h3>

                  {currentSuite ? (
                    <div className="flex flex-col md:flex-row gap-6 bg-obsidian/40 border border-gold-400/10 p-4 relative group">
                      <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden shrink-0">
                        <img src={currentSuite.image} alt={currentSuite.name[language]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="font-serif text-xl text-cream font-light">{currentSuite.name[language]}</h4>
                          <p className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">{currentSuite.category}</p>
                          <p className="text-xs text-cream/50 line-clamp-2 leading-relaxed font-sans font-light mt-1.5">{currentSuite.description[language]}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gold-400/5 pt-3.5 mt-4">
                          <span className="text-xs font-mono text-cream/70">{currentSuite.size} m² | Max {currentSuite.maxOccupancy} Guests</span>
                          <button
                            onClick={() => setSelectedSuite(null)}
                            className="text-[10px] text-gold-400 hover:text-gold-300 uppercase tracking-widest font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>{language === 'en' ? 'Change Sanctuary' : 'Changer'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gold-400/20 p-8 text-center space-y-4 bg-obsidian/20">
                      <AlertCircle className="w-8 h-8 text-gold-400/50 mx-auto" />
                      <p className="text-xs text-cream/60 font-sans font-light">
                        {t('bookbar.select_room_prompt')}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {suites.map((suite) => (
                          <button
                            key={suite.id}
                            onClick={() => setSelectedSuite(suite)}
                            className="bg-obsidian hover:bg-obsidian/80 border border-gold-400/15 hover:border-gold-400/40 p-4 text-left transition-all flex flex-col justify-between h-28"
                          >
                            <div>
                              <p className="text-[9px] font-mono tracking-widest text-gold-400 uppercase">{suite.category}</p>
                              <p className="font-serif text-sm font-light text-cream truncate mt-1">{suite.name[language]}</p>
                            </div>
                            <p className="text-xs font-serif text-gold-400/90 font-light">${suite.price} / {t('filters.night')}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAuthorizeBooking} className="space-y-8">
                  {/* Section B: Stay Specifications Dates */}
                  <div className="bg-charcoal border border-gold-400/10 p-6 md:p-8 space-y-6 text-left" id="step-stay-dates">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-400" />
                      <span>{t('checkout.details_sub')}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('bookbar.checkin')}</label>
                        <input
                          type="date"
                          required
                          value={reservation.checkIn}
                          onChange={(e) => updateReservation({ checkIn: e.target.value })}
                          className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('bookbar.checkout')}</label>
                        <input
                          type="date"
                          required
                          value={reservation.checkOut}
                          min={reservation.checkIn}
                          onChange={(e) => updateReservation({ checkOut: e.target.value })}
                          className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('bookbar.guests')}</label>
                        <select
                          value={reservation.guests}
                          onChange={(e) => updateReservation({ guests: parseInt(e.target.value) })}
                          className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors font-sans"
                        >
                          <option value={1}>1 Guest / Voyageur</option>
                          <option value={2}>2 Guests / Voyageurs</option>
                          <option value={3}>3 Guests / Voyageurs</option>
                          <option value={4}>4 Guests / Voyageurs</option>
                          <option value={6}>6 Guests / Voyageurs</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section C: Guest Info */}
                  <div className="bg-charcoal border border-gold-400/10 p-6 md:p-8 space-y-6 text-left" id="step-guest-registry">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans flex items-center gap-2">
                      <Users className="w-4 h-4 text-gold-400" />
                      <span>{t('checkout.personal_title')}</span>
                    </h3>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('checkout.full_name')}</label>
                        <input
                          type="text"
                          required
                          placeholder="Sir Alistair Montgomery"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('checkout.email')}</label>
                          <input
                            type="email"
                            required
                            placeholder="alistair@sterling-holdings.co.uk"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('checkout.phone')}</label>
                          <input
                            type="tel"
                            required
                            placeholder="+44 20 7946 0958"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section D: Sovereign Secured Payment */}
                  <div className="bg-charcoal border border-gold-400/10 p-6 md:p-8 space-y-6 text-left" id="step-payment">
                    <div className="flex items-center justify-between border-b border-gold-400/5 pb-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gold-400" />
                        <span>{t('checkout.payment_title')}</span>
                      </h3>
                      <div className="flex items-center space-x-1.5 text-gold-400/70">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono uppercase tracking-widest">SSL SECURED</span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('checkout.card_name')}</label>
                        <input
                          type="text"
                          required
                          placeholder="A MONTGOMERY"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors font-mono tracking-widest"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('checkout.card_num')}</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors font-mono tracking-widest"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('checkout.card_exp')}</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors font-mono text-center tracking-widest"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono">{t('checkout.card_cvv')}</label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-obsidian border border-gold-400/10 text-cream px-4 py-3 text-xs focus:outline-none focus:border-gold-400 transition-colors font-mono text-center tracking-widest"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Authorization Trigger */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isProcessing || !currentSuite}
                      className="w-full py-4.5 bg-gold-400 hover:bg-gold-500 disabled:opacity-40 text-obsidian text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl rounded-none cursor-pointer"
                      id="authorize-booking-btn"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t('checkout.processing')}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>{t('checkout.submit_btn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Dynamic Sticky Invoice & Promo (5 Cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6" id="booking-invoice-sidebar">
                <div className="bg-charcoal border border-gold-400/15 p-6 md:p-8 space-y-6 text-left">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold font-sans border-b border-gold-400/10 pb-4">
                    {t('checkout.invoice_title')}
                  </h3>

                  {currentSuite ? (
                    <div className="space-y-4">
                      {/* Night detail */}
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="text-cream/60">{t('checkout.nights_count')}</span>
                        <span className="font-mono text-cream font-medium">{nights}</span>
                      </div>

                      {/* Suite detail */}
                      <div className="flex justify-between items-start text-xs font-sans gap-2">
                        <span className="text-cream/60">{language === 'en' ? 'Suite Rate' : 'Tarif de la suite'}</span>
                        <span className="font-mono text-cream text-right font-medium">${pricePerNight} / night</span>
                      </div>

                      <div className="h-[1px] w-full bg-gold-400/5" />

                      {/* Subtotal */}
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="text-cream/60">{t('checkout.subtotal')}</span>
                        <span className="font-mono text-cream font-medium">${subtotal}</span>
                      </div>

                      {/* Taxes */}
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="text-cream/60">{t('checkout.taxes')}</span>
                        <span className="font-mono text-cream font-medium">${taxes}</span>
                      </div>

                      {/* Active Promo deduction */}
                      {reservation.discountPercentage > 0 && (
                        <div className="flex justify-between items-center text-xs font-sans text-emerald-400">
                          <span>{t('checkout.promo_success')} (-{reservation.discountPercentage}%)</span>
                          <span className="font-mono font-bold">-${discountAmount}</span>
                        </div>
                      )}

                      <div className="h-[1px] w-full bg-gold-400/10" />

                      {/* Total sovereign amount */}
                      <div className="flex justify-between items-end">
                        <span className="text-xs uppercase tracking-[0.15em] text-gold-400 font-bold font-sans">
                          {t('checkout.total')}
                        </span>
                        <span className="font-serif text-2xl md:text-3xl font-light text-cream leading-none">
                          ${totalAmount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-cream/40 italic font-sans font-light py-4 text-center">
                      {t('bookbar.select_room_prompt')}
                    </p>
                  )}

                  {/* Promo Code input system */}
                  {currentSuite && (
                    <div className="border-t border-gold-400/10 pt-6 space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-cream/40 font-mono block">
                        {t('checkout.promo_label')}
                      </label>
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          placeholder="ROYAL15"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="flex-1 bg-obsidian border border-gold-400/10 text-cream px-3 py-2 text-xs focus:outline-none focus:border-gold-400 transition-colors uppercase font-mono tracking-widest"
                          id="promo-code-input"
                        />
                        <button
                          type="button"
                          onClick={handleRedeemPromo}
                          className="px-4 bg-transparent border border-gold-400/30 hover:border-gold-400 hover:bg-gold-400/10 text-gold-400 text-[10px] uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer"
                          id="promo-code-btn"
                        >
                          {t('checkout.promo_apply')}
                        </button>
                      </div>

                      {/* Status reports */}
                      {promoStatus === 'success' && (
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{t('checkout.promo_success')}</span>
                        </p>
                      )}
                      {promoStatus === 'invalid' && (
                        <p className="text-[10px] text-rose-400 flex items-center gap-1 font-sans">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{t('checkout.promo_invalid')}</span>
                        </p>
                      )}

                      <div className="bg-obsidian/50 p-3 border border-gold-400/5 rounded-none mt-4 text-[11px] text-cream/40 leading-relaxed font-sans font-light">
                        Tip: Enter promo code <strong className="text-gold-400">ROYAL15</strong> to apply 15% discount. Or <strong className="text-gold-400">LHORIZON</strong> for 20%.
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          ) : (
            /* Success State Window */
            <motion.div
              key="booking-success-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto bg-charcoal border border-gold-400/15 p-8 md:p-12 text-center space-y-8"
              id="booking-success-screen"
            >
              <div className="w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mx-auto text-gold-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide text-cream leading-tight">
                  {t('success.title')}
                </h1>
                <p className="text-xs md:text-sm text-cream/60 font-sans font-light leading-relaxed">
                  {t('success.sub')}
                </p>
              </div>

              {/* Booking specifications reference sheet */}
              <div className="bg-obsidian/60 border border-gold-400/10 p-5 space-y-4 text-left font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cream/40 uppercase tracking-widest">{t('success.ref')}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gold-400 font-semibold tracking-wider select-all">{mockBookingRef}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(mockBookingRef)}
                      className="text-cream/40 hover:text-gold-400 p-0.5 transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gold-400/5" />

                <div className="grid grid-cols-2 gap-4 text-xs font-light">
                  <div>
                    <span className="text-cream/40 block text-[9px] uppercase tracking-widest mb-1">Lead Guest</span>
                    <span className="text-cream/90 font-medium">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-cream/40 block text-[9px] uppercase tracking-widest mb-1">{t('nav.rooms')}</span>
                    <span className="text-cream/90 font-medium truncate block">{currentSuite?.name[language]}</span>
                  </div>
                  <div>
                    <span className="text-cream/40 block text-[9px] uppercase tracking-widest mb-1">{t('bookbar.checkin')}</span>
                    <span className="font-mono text-cream/90">{reservation.checkIn}</span>
                  </div>
                  <div>
                    <span className="text-cream/40 block text-[9px] uppercase tracking-widest mb-1">{t('bookbar.checkout')}</span>
                    <span className="font-mono text-cream/90">{reservation.checkOut}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-left bg-obsidian/30 border border-gold-400/5 p-4 rounded-none">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('success.welcome')}</span>
                </h4>
                <p className="text-xs text-cream/50 leading-relaxed font-sans font-light">
                  {t('success.welcome_desc')}
                </p>
              </div>

              <div>
                <button
                  onClick={handleResetWorkspace}
                  className="w-full py-3.5 bg-gold-400 hover:bg-gold-500 text-obsidian text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-lg cursor-pointer"
                  id="success-return-btn"
                >
                  {t('success.close')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
