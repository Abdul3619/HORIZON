import React, { createContext, useContext, useState, useEffect } from 'react';
import { Suite, ReservationState, View, Language, HotelContextType } from './types';

// Curated high-end five-star resort suites with Unsplash imagery
const SUITES_DATA: Suite[] = [
  {
    id: 'royal-horizon-penthouse',
    name: {
      en: 'Royal Horizon Penthouse',
      fr: 'Penthouse Royal Horizon'
    },
    price: 2400,
    size: 180,
    category: 'Penthouses',
    maxOccupancy: 4,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      en: 'Suspended between sea and sky, our crown jewel penthouse offers unparalleled ocean panoramas, a heated private deck pool, and bespoke luxury details selected by master European artisans.',
      fr: 'Suspendu entre ciel et mer, notre penthouse signature offre des panoramas océaniques inégalés, une piscine privée chauffée sur terrasse, et des détails luxueux sur mesure sélectionnés par des artisans européens.'
    },
    highlights: {
      en: ['24-Hour Dedicated Butler Service', 'Heated Outdoor Infinity Plunge Pool', 'Private Elevator In-Suite Access', 'Custom Bang & Olufsen Sound System'],
      fr: ['Service de majordome dédié 24h/24', 'Piscine à débordement chauffée extérieure', 'Accès par ascenseur privé en suite', 'Système audio Bang & Olufsen sur mesure']
    },
    amenities: {
      en: ['Walk-in Dressing Room', 'Hermès Bathroom Amenities', 'Stellar Bar with Rare Vintages', 'In-Suite Fine Dining by Michelin Chef', 'Custom Cashmere Linens', 'Wellness & Massage Room Access'],
      fr: ['Dressing spacieux', 'Produits d\'accueil Hermès', 'Bar d\'exception avec grands crus', 'Dîner privé en suite par un chef étoilé', 'Draps en cachemire sur mesure', 'Accès direct à la cabine de massage privée']
    }
  },
  {
    id: 'lhorizon-ocean-suite',
    name: {
      en: "L'Horizon Ocean Suite",
      fr: "Suite Océan L'Horizon"
    },
    price: 1650,
    size: 120,
    category: 'Suites',
    maxOccupancy: 3,
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      en: 'Enjoy serene mornings looking out at the endless horizon. Features an open-plan lounge, hand-crafted Italian marble bathrooms, and a deep soaking terrace jacuzzi.',
      fr: 'Profitez de matinées sereines face à l\'horizon infini. Comprend un salon ouvert, des salles de bains en marbre italien faites à la main et un jacuzzi de terrasse.'
    },
    highlights: {
      en: ['Private Terrace with Marble Jacuzzi', 'Open-Plan Architectural Lounge', 'Complimentary Vintage Champagne on Arrival', 'Curated Art Collection Display'],
      fr: ['Terrasse privée avec jacuzzi en marbre', 'Salon architectural à aire ouverte', 'Champagne millésimé offert à l\'arrivée', 'Collection d\'art contemporain exposée']
    },
    amenities: {
      en: ['Bespoke Velvet Bathrobes', 'Acqua di Parma Spa Products', 'iPad Controlled Room Ambiance', 'Espresso Atelier Station', 'Walk-in Rainfall Shower', 'Chauffeur Airport Transfer'],
      fr: ['Peignoirs en velours sur mesure', 'Produits de spa Acqua di Parma', 'Ambiance domotique contrôlée par iPad', 'Station de dégustation Espresso', 'Douche sensorielle à effet pluie', 'Transfert aéroport avec chauffeur']
    }
  },
  {
    id: 'riviera-presidential-suite',
    name: {
      en: 'Riviera Presidential Suite',
      fr: 'Suite Présidentielle Riviera'
    },
    price: 3200,
    size: 240,
    category: 'Penthouses',
    maxOccupancy: 6,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      en: 'The pinnacle of global prestige. A sprawling dual-wing presidential suite hosting an exquisite formal dining room, a private wellness studio, and sweeping 360-degree views of the coastline.',
      fr: 'Le summum du prestige mondial. Une vaste suite présidentielle à deux ailes abritant une salle à manger formelle exquise, un studio de bien-être privé et une vue imprenable à 360 degrés sur la côte.'
    },
    highlights: {
      en: ['Dual-Wing Grand Architectural Layout', 'Sleek Steinway Baby Grand Piano', 'In-Suite Private Thermal Sanctuary', '360° Panoramic Terrace Balcony'],
      fr: ['Configuration architecturale à deux ailes', 'Piano à queue Steinway d\'exception', 'Sanctuaire thermique privé en suite', 'Terrasse panoramique circulaire à 360°']
    },
    amenities: {
      en: ['Walk-in Wine Cellar Selection', 'Custom Frette Linens & Pillows', '24h Private Security Services', 'Premium Airport Meet & Greet', 'En-Suite Cinema Room', 'Private Chef on Demand'],
      fr: ['Sélection de cave à vin privative', 'Draps et oreillers Frette d\'exception', 'Service de sécurité privée 24h/24', 'Accueil VIP personnalisé à l\'aéroport', 'Salle de cinéma privée en suite', 'Chef de cuisine privé à la demande']
    }
  },
  {
    id: 'amber-sun-suite',
    name: {
      en: 'Amber Sun Suite',
      fr: 'Suite Soleil d\'Ambre'
    },
    price: 950,
    size: 85,
    category: 'Suites',
    maxOccupancy: 2,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      en: 'Drenched in warm amber sunlight, this bespoke suite offers a serene, intimate escape with natural hand-crafted oak details, a custom wetroom, and stunning sunset views.',
      fr: 'Bignée d\'une chaleureuse lumière d\'ambre, cette suite sur mesure offre une échappée sereine et intime avec des détails en chêne naturel faits à la main, une salle d\'eau moderne et d\'incroyables couchers de soleil.'
    },
    highlights: {
      en: ['Stunning West-Facing Sunset Views', 'Natural Hand-Crafted Walnut Furniture', 'Premium Glass-Encased Rainforest Shower', 'Artisanal Tea Sommelier Bar'],
      fr: ['Vues imprenables sur le coucher du soleil', 'Mobilier en noyer naturel fabriqué à la main', 'Douche à effet pluie sous vitrage', 'Bar avec sommelier de thé artisanal']
    },
    amenities: {
      en: ['Satin Silk Sleepwear Sets', 'Dyptique Paris Aromatics', 'State-of-the-Art Acoustics System', 'Organic Linen Curtains', 'Nespresso Atelier Station', 'Daily Fresh Botanical Layouts'],
      fr: ['Ensembles de nuit en soie de satin', 'Produits parfumés Diptyque Paris', 'Système acoustique de pointe', 'Rideaux en lin biologique', 'Station de café Nespresso de créateur', 'Compositions florales fraîches au quotidien']
    }
  },
  {
    id: 'azure-executive-suite',
    name: {
      en: 'Azure Executive Suite',
      fr: 'Suite Exécutive Azur'
    },
    price: 750,
    size: 70,
    category: 'Suites',
    maxOccupancy: 2,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      en: 'Fusing clean, minimalist geometry with luxury amenities, the Azure Executive Suite includes an ergonomic workspace, smart-glass bathroom privacy, and curated ocean views.',
      fr: 'Fusionnant une géométrie minimaliste et des équipements haut de gamme, la suite exécutive Azur comprend un espace de travail ergonomique, une salle de bains en verre intelligent et des vues sur la mer.'
    },
    highlights: {
      en: ['Ergonomic Designer Workstation', 'Dynamic Smart-Glass Bathroom Glass', 'Curated Sea and Port Panoramas', 'Dedicated High-Speed Satellite Link'],
      fr: ['Poste de travail ergonomique haut de gamme', 'Cloison de salle de bain en verre intelligent', 'Panoramas mer et port sélectionnés', 'Liaison satellite haut débit dédiée']
    },
    amenities: {
      en: ['Giza Cotton Terry Towels', 'Byredo Luxury Amenities', 'Integrated Wireless Power Zones', 'In-Room Healthy Wellness Bar', 'Premium Overnight Valet Parking', 'Luxury Pillow Menu Choice'],
      fr: ['Serviettes en coton de Gizeh haut de gamme', 'Produits d\'accueil Byredo de luxe', 'Zones de recharge sans fil intégrées', 'Bar de bien-être sain en chambre', 'Service de voiturier de nuit haut de gamme', 'Menu oreillers de luxe au choix']
    }
  },
  {
    id: 'zen-oasis-suite',
    name: {
      en: 'Zen Oasis Suite',
      fr: 'Suite Oasis Zen'
    },
    price: 1100,
    size: 95,
    category: 'Suites',
    maxOccupancy: 2,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      en: 'Unwind in absolute tranquility. Enjoy a private Japanese rock-garden atrium, a custom-sunken cedarwood soaking bathtub, and an organic meditation pavilion.',
      fr: 'Détendez-vous dans une tranquillité absolue. Profitez d\'un atrium avec jardin de rocaille japonais privé, d\'une baignoire en cèdre encastrée sur mesure et d\'un pavillon de méditation biologique.'
    },
    highlights: {
      en: ['Private Japanese Rock-Garden Atrium', 'Deep Sunken Cedarwood Tub', 'Organic In-Suite Meditation Pavilion', 'Curated Ambient Sensory Setting'],
      fr: ['Atrium de rocaille japonais privé', 'Baignoire en bois de cèdre encastrée', 'Pavillon de méditation biologique', 'Ajustement sensoriel d\'ambiance sélectionné']
    },
    amenities: {
      en: ['Premium Kimono Lounge Sets', 'Le Labo Hinoki Botanicals', 'Organic Bamboo Fiber Mats', 'Bespoke Kyoto Matcha Service', 'Therapeutic Sound Healing System', 'Privileged Daily Yoga Lounge Access'],
      fr: ['Ensembles d\'intérieur de type Kimono', 'Produits botaniques Le Labo Hinoki', 'Tapis en fibre de bambou biologique', 'Service de Matcha de Kyoto sur mesure', 'Système de sonothérapie thérapeutique', 'Accès privilégié quotidien au studio de yoga']
    }
  }
];

// Elegant Translation Dictionary covering all views and options
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav Bar
    'nav.home': 'Home',
    'nav.rooms': 'Suites & Villas',
    'nav.booking': 'Reservations',
    'nav.reserve': 'Reserve Suite',
    'brand.sub': 'RIVIERA EXCELLENCE',
    
    // Booking Bar
    'bookbar.checkin': 'Arrival Date',
    'bookbar.checkout': 'Departure Date',
    'bookbar.guests': 'Guests Count',
    'bookbar.search': 'Explore Availability',
    'bookbar.select_room_prompt': 'Please select your desired suite first.',

    // Hero Section
    'hero.sub': 'A FIVE-STAR MEDITERRANEAN EXPERIENCE',
    'hero.title': 'Where Endless Ocean Meets Regal Grandeur',
    'hero.desc': 'Step into L\'Horizon Royal, a coastal sanctuary where modern architectural marvels blend seamlessly with traditional five-star service.',
    'hero.scroll': 'Scroll to Discover',

    // Legacy Spotlight
    'legacy.sub': 'OUR NOBLE HERITAGE',
    'legacy.title': 'The Philosophy of Timeless Craft',
    'legacy.text1': 'Founded in 1924 along the rugged cliffs of the French Riviera, L\'Horizon Royal has served as a sanctuary for distinguished global citizens, artists, and nobility seeking uncompromised luxury.',
    'legacy.text2': 'Every marble column, every tailored linen thread, and each custom gourmet plate tells our enduring story: a century-long romance with absolute visual harmony and peerless legendary hospitality.',
    'legacy.quote': '"True elegance does not demand attention, it resides quietly in the perfection of details."',
    'legacy.founder': '— Henri de Laurent, Founder',

    // Featured grid
    'featured.sub': 'CURATED SUITES',
    'featured.title': 'Exquisite Residences of the Royal Court',
    'featured.explore_all': 'View All Accommodations',

    // Signature Luxuries
    'luxuries.sub': 'UNCOMPROMISED EXPERIENCES',
    'luxuries.title': 'Signature Services of L\'Horizon',
    'luxuries.spa': 'Thermal Senses Spa',
    'luxuries.spa_desc': 'Rejuvenating hammam, tailored bio-essential oil massage rituals, and marble ice-baths.',
    'luxuries.dining': 'L\'Or Rouge Gastronomy',
    'luxuries.dining_desc': 'Three Michelin-star marine culinary creations overseen by Executive Chef Jean-Pierre.',
    'luxuries.pool': 'Royal Infinity Edge Pool',
    'luxuries.pool_desc': 'Heated sea-water pool looking out at the endless horizon with private cabanas.',
    'luxuries.yacht': 'Bespoke Yacht Charter',
    'luxuries.yacht_desc': 'A customized carbon-hull yacht ready at the port for private island escapes.',

    // Culinary Section
    'culinary.sub': 'THE GASTRONOMIC CRAFT',
    'culinary.title': 'Artistry of L\'Or Rouge',
    'culinary.desc': 'Every dish at our Michelin-starred establishment is a sensory masterpiece. We source coastal marine flora, freshly landed blue lobster, and local organic herbs, presented as fine artwork.',
    'culinary.button': 'Explore Menu',

    // Testimonials
    'reviews.sub': 'VOICES OF APPRECIATION',
    'reviews.title': 'Praise from Celebrated Guests',

    // Footer
    'footer.desc': 'Where world-class contemporary craftsmanship meets the classic elegance of coastal heritage. Experience L\'Horizon Royal.',
    'footer.pages': 'Explore',
    'footer.legal': 'Corporate & Legal',
    'footer.legal1': 'Terms of Pure Luxury',
    'footer.legal2': 'Privacy Policy Safeguards',
    'footer.legal3': 'Cookie Configurations',
    'footer.contact': 'Inquiries',
    'footer.address': '742 Boulevard de la Reine, Nice, France',
    'footer.rights': '© 2026 L\'Horizon Royal S.A. All rights reserved. Devised for elite travelers.',

    // Accommodations / Filters
    'filters.all': 'All Sanctuary Rooms',
    'filters.suites': 'Master Suites',
    'filters.penthouses': 'Crown Penthouses',
    'filters.price_limit': 'Maximum Rate Limit',
    'filters.night': 'night',
    'filters.view_details': 'Explore Highlights',
    'filters.book_now': 'Book Residence',
    'filters.size_label': 'Area',
    'filters.guests_label': 'Max Guests',
    'filters.amenities_label': 'Exclusive In-Room Amenities',

    // Lightbox Modal
    'lightbox.title': 'Suite Architectural Blueprint',
    'lightbox.policies': 'Royal Resort Policies',
    'lightbox.policy_desc': 'Check-in begins at 15:00. Check-out is strictly at 12:00. Elite valet and custom butler preferences can be submitted up to 48 hours prior to arrival. Cancelation is fully complimentary up to 7 days before check-in.',
    'lightbox.close': 'Close Overview',

    // Checkout Form
    'checkout.title': 'Finalize Your Royal Sanctuary',
    'checkout.details_sub': 'Confirm Reservation Specifications',
    'checkout.dates_label': 'Selected Stay Duration',
    'checkout.change_btn': 'Change Specifications',
    'checkout.personal_title': 'Lead Guest Personal Registry',
    'checkout.full_name': 'Full Legal Name',
    'checkout.email': 'Secure Email Address',
    'checkout.phone': 'Contact Telephone Number',
    'checkout.payment_title': 'Secure Sovereign Encryption Payment',
    'checkout.card_name': 'Name on Card',
    'checkout.card_num': 'Card Number',
    'checkout.card_exp': 'Expiration Date',
    'checkout.card_cvv': 'Security CVV',
    'checkout.invoice_title': 'Summary Sovereign Balance',
    'checkout.nights_count': 'Total Nights',
    'checkout.subtotal': 'Subtotal Stay Charge',
    'checkout.taxes': 'Taxes & Resort Luxuries (12%)',
    'checkout.total': 'Total Sovereign Amount',
    'checkout.promo_label': 'Luxury Promo Code',
    'checkout.promo_apply': 'Redeem',
    'checkout.promo_success': '15% Discount successfully applied!',
    'checkout.promo_invalid': 'Invalid promo code.',
    'checkout.submit_btn': 'Authorize Royal Booking',
    'checkout.processing': 'Sovereign Bank Encrypting...',

    // Success Screen
    'success.title': 'Sovereign Reservation Sealed',
    'success.sub': 'Your sanctuary at L\'Horizon Royal awaits.',
    'success.ref': 'Booking Reference Code',
    'success.welcome': 'Welcome Package',
    'success.welcome_desc': 'A private digital dossier and premium welcoming message has been sent to your registered address. Our lead concierge will contact you shortly.',
    'success.close': 'Return to Grand Foyer'
  },
  fr: {
    // Nav Bar
    'nav.home': 'Accueil',
    'nav.rooms': 'Suites & Villas',
    'nav.booking': 'Réservations',
    'nav.reserve': 'Réserver la Suite',
    'brand.sub': 'EXCELLENCE DE LA RIVIERA',
    
    // Booking Bar
    'bookbar.checkin': 'Date d\'Arrivée',
    'bookbar.checkout': 'Date de Départ',
    'bookbar.guests': 'Nombre de Voyageurs',
    'bookbar.search': 'Explorer la Disponibilité',
    'bookbar.select_room_prompt': 'Veuillez d\'abord sélectionner la suite souhaitée.',

    // Hero Section
    'hero.sub': 'UNE EXPÉRIENCE CINQ ÉTOILES MÉDITERRANÉENNE',
    'hero.title': 'Là où l\'Océan Infini Épouse la Grandeur Royale',
    'hero.desc': 'Entrez à L\'Horizon Royal, un sanctuaire côtier où le design architectural contemporain fusionne harmonieusement avec le service d\'exception.',
    'hero.scroll': 'Faites Défiler pour Découvrir',

    // Legacy Spotlight
    'legacy.sub': 'NOTRE NOBLE HÉRITAGE',
    'legacy.title': 'La Philosophie du Geste Intemporel',
    'legacy.text1': 'Fondé en 1924 au sommet des falaises escarpées de la Côte d\'Azur, L\'Horizon Royal a accueilli les plus grands esprits mondiaux, artistes et membres de la haute noblesse.',
    'legacy.text2': 'Chaque colonne de marbre, chaque fil de lin sur mesure et chaque plat gastronomique raconte notre histoire continue : un amour séculaire pour l\'harmonie esthétique et l\'hospitalité légendaire.',
    'legacy.quote': '"La véritable élégance n\'exige pas le regard, elle réside silencieusement dans la perfection des détails."',
    'legacy.founder': '— Henri de Laurent, Fondateur',

    // Featured grid
    'featured.sub': 'SUITES SÉLECTIONNÉES',
    'featured.title': 'Résidences Prestigieuses de la Cour Royale',
    'featured.explore_all': 'Voir Tous les Hébergements',

    // Signature Luxuries
    'luxuries.sub': 'EXPÉRIENCES SANS CONCESSION',
    'luxuries.title': 'Les Services Signatures de L\'Horizon',
    'luxuries.spa': 'Spa des Sens Thermaux',
    'luxuries.spa_desc': 'Hammam revitalisant, massages sur mesure aux huiles essentielles bio et bains glacés de marbre.',
    'luxuries.dining': 'Gastronomie L\'Or Rouge',
    'luxuries.dining_desc': 'Créations marines triplement étoilées au Michelin par notre chef exécutif Jean-Pierre.',
    'luxuries.pool': 'Piscine Royale à Débordement',
    'luxuries.pool_desc': 'Bassin d\'eau de mer chauffé suspendu sur l\'océan avec cabines privatives de repos.',
    'luxuries.yacht': 'Location de Yacht Privée',
    'luxuries.yacht_desc': 'Un yacht personnalisé en fibre de carbone à votre disposition pour vos escapades insulaires.',

    // Culinary Section
    'culinary.sub': 'L\'ART DE LA GASTRONOMIE',
    'culinary.title': 'Le Geste de L\'Or Rouge',
    'culinary.desc': 'Chaque plat dans notre établissement étoilé est un chef-d\'œuvre sensoriel. Nous sélectionnons des fleurs marines locales, du homard bleu de ligne et des herbes bio locales, sculptés comme des œuvres d\'art.',
    'culinary.button': 'Explorer la Carte',

    // Testimonials
    'reviews.sub': 'ÉLOGES DE NOS RÉSIDENTS',
    'reviews.title': 'Témoignages de Voyageurs Distingués',

    // Footer
    'footer.desc': 'Là où l\'excellence contemporaine rencontre la grandeur classique de notre héritage côtier. Vivez L\'Horizon Royal.',
    'footer.pages': 'Explorer',
    'footer.legal': 'Mentions Légales',
    'footer.legal1': 'Conditions de Grand Luxe',
    'footer.legal2': 'Politique de Confidentialité',
    'footer.legal3': 'Configurations des Cookies',
    'footer.contact': 'Inscriptions & Contact',
    'footer.address': '742 Boulevard de la Reine, Nice, France',
    'footer.rights': '© 2026 L\'Horizon Royal S.A. Tous droits réservés. Dédié aux voyageurs d\'élite.',

    // Accommodations / Filters
    'filters.all': 'Toutes les Suites',
    'filters.suites': 'Suites de Maîtres',
    'filters.penthouses': 'Penthouses de la Couronne',
    'filters.price_limit': 'Tarif Maximum',
    'filters.night': 'nuit',
    'filters.view_details': 'Explorer les Détails',
    'filters.book_now': 'Réserver la Résidence',
    'filters.size_label': 'Superficie',
    'filters.guests_label': 'Capacité Max',
    'filters.amenities_label': 'Équipements de Prestige en Chambre',

    // Lightbox Modal
    'lightbox.title': 'Fiche Architecturale de la Suite',
    'lightbox.policies': 'Conditions Générales du Resort',
    'lightbox.policy_desc': 'L\'enregistrement s\'effectue à partir de 15h00. Le départ doit avoir lieu à 12h00 au plus tard. Vos demandes de majordome personnalisé et voiturier premium peuvent être soumises jusqu\'à 48 heures avant votre arrivée. Annulation gratuite jusqu\'à 7 jours avant.',
    'lightbox.close': 'Fermer la Fiche',

    // Checkout Form
    'checkout.title': 'Finalisez Votre Sanctuaire Royal',
    'checkout.details_sub': 'Confirmer les Spécifications du Séjour',
    'checkout.dates_label': 'Durée Sélectionnée',
    'checkout.change_btn': 'Modifier le Séjour',
    'checkout.personal_title': 'Enregistrement du Voyageur Principal',
    'checkout.full_name': 'Nom Complet Légal',
    'checkout.email': 'Adresse E-mail Sécurisée',
    'checkout.phone': 'Numéro de Téléphone',
    'checkout.payment_title': 'Paiement Sécurisé Hautement Chiffré',
    'checkout.card_name': 'Nom du Titulaire de la Carte',
    'checkout.card_num': 'Numéro de Carte',
    'checkout.card_exp': 'Date d\'Expiration',
    'checkout.card_cvv': 'Code de Sécurité (CVV)',
    'checkout.invoice_title': 'Récapitulatif du Solde Souverain',
    'checkout.nights_count': 'Nombre de Nuits',
    'checkout.subtotal': 'Tarif de Séjour Brut',
    'checkout.taxes': 'Taxes & Taxes de Séjour (12%)',
    'checkout.total': 'Montant Total',
    'checkout.promo_label': 'Code Promotionnel Privé',
    'checkout.promo_apply': 'Appliquer',
    'checkout.promo_success': 'Remise de 15% appliquée avec succès !',
    'checkout.promo_invalid': 'Code promotionnel invalide.',
    'checkout.submit_btn': 'Confirmer la Réservation Royale',
    'checkout.processing': 'Chiffrement Bancaire Souverain...',

    // Success Screen
    'success.title': 'Réservation Royale Confirmée',
    'success.sub': 'Votre havre de paix à L\'Horizon Royal vous attend.',
    'success.ref': 'Référence de Réservation',
    'success.welcome': 'Carnet d\'Accueil VIP',
    'success.welcome_desc': 'Un carnet numérique privé de bienvenue a été envoyé à votre adresse e-mail. Notre concierge en chef prendra contact avec vous très prochainement.',
    'success.close': 'Retourner au Grand Hall'
  }
};

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setView] = useState<View>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedSuite, setSelectedSuite] = useState<Suite | null>(null);
  const [openSuiteLightbox, setOpenSuiteLightbox] = useState<Suite | null>(null);

  // Default initial dates: 3 days stay starting tomorrow
  const getTomorrowString = (offset = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const [reservation, setReservationState] = useState<ReservationState>({
    checkIn: getTomorrowString(1),
    checkOut: getTomorrowString(4),
    guests: 2,
    selectedSuiteId: '',
    promoCode: '',
    discountPercentage: 0
  });

  const updateReservation = (updates: Partial<ReservationState>) => {
    setReservationState(prev => {
      const newState = { ...prev, ...updates };
      // Double check validity if date updates
      if (updates.checkIn && newState.checkOut <= updates.checkIn) {
        // Automatically slide checkout by 1 night
        const d = new Date(updates.checkIn);
        d.setDate(d.getDate() + 2);
        newState.checkOut = d.toISOString().split('T')[0];
      }
      return newState;
    });
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'fr' : 'en'));
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  // Keep track of changes to selectedSuite and update reservation selectRoomId
  useEffect(() => {
    if (selectedSuite) {
      updateReservation({ selectedSuiteId: selectedSuite.id });
    }
  }, [selectedSuite]);

  return (
    <HotelContext.Provider
      value={{
        currentView,
        setView: (v) => {
          setView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        language,
        toggleLanguage,
        reservation,
        updateReservation,
        suites: SUITES_DATA,
        selectedSuite,
        setSelectedSuite,
        openSuiteLightbox,
        setOpenSuiteLightbox,
        t
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
