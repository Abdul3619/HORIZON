export interface Suite {
  id: string;
  name: {
    en: string;
    fr: string;
  };
  price: number;
  size: number; // in m²
  category: 'Suites' | 'Penthouses';
  maxOccupancy: number;
  image: string;
  images: string[];
  description: {
    en: string;
    fr: string;
  };
  highlights: {
    en: string[];
    fr: string[];
  };
  amenities: {
    en: string[];
    fr: string[];
  };
}

export interface ReservationState {
  checkIn: string;
  checkOut: string;
  guests: number;
  selectedSuiteId: string;
  promoCode: string;
  discountPercentage: number;
}

export type View = 'home' | 'rooms' | 'booking' | 'admin';
export type Language = 'en' | 'fr';

export interface HotelContextType {
  currentView: View;
  setView: (view: View) => void;
  language: Language;
  toggleLanguage: () => void;
  reservation: ReservationState;
  updateReservation: (updates: Partial<ReservationState>) => void;
  suites: Suite[];
  selectedSuite: Suite | null;
  setSelectedSuite: (suite: Suite | null) => void;
  openSuiteLightbox: Suite | null;
  setOpenSuiteLightbox: (suite: Suite | null) => void;
  t: (key: string) => string;
}
