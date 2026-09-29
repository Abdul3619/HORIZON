// TEMPLATE CONTENT — NEEDS LEGAL REVIEW. These Terms, Privacy and Cookie pages are generic starting points written
// for this demo hotel. They are not legal advice and must be reviewed and adapted (company details, governing law,
// actual data processing and cookies used) before real bookings are taken.
import React from 'react';
import { useHotel } from '../HotelContext';
import IllustrativeBadge from './IllustrativeBadge';

type LegalView = 'privacy' | 'terms' | 'cookies';

const CONTENT: Record<LegalView, { en: { title: string; sections: [string, string][] }; fr: { title: string; sections: [string, string][] } }> = {
  terms: {
    en: {
      title: 'Terms & Conditions',
      sections: [
        ['Reservations', 'A reservation is confirmed once you receive a confirmation email. Rates are per suite, per night, and include taxes unless stated otherwise.'],
        ['Deposits and payment', 'A deposit of one night may be requested to secure your stay. The balance is settled at check-out.'],
        ['Cancellations', 'Cancel free of charge up to 7 days before arrival. Later cancellations and no-shows are charged one night.'],
        ['Check-in and check-out', 'Check-in from 15:00, check-out by 12:00. Early arrival and late departure are subject to availability.'],
        ['House rules', 'Suites are non-smoking. Guests are responsible for damage beyond normal wear.'],
      ],
    },
    fr: {
      title: 'Conditions Générales',
      sections: [
        ['Réservations', 'Une réservation est confirmée dès réception de l\'e-mail de confirmation. Les tarifs s\'entendent par suite et par nuit, taxes comprises sauf indication contraire.'],
        ['Acompte et paiement', 'Un acompte d\'une nuit peut être demandé pour garantir votre séjour. Le solde est réglé au départ.'],
        ['Annulations', 'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée. Au-delà, ou en cas de non-présentation, une nuit est facturée.'],
        ['Arrivée et départ', 'Arrivée à partir de 15h00, départ avant 12h00. Arrivée anticipée et départ tardif selon disponibilité.'],
        ['Règlement intérieur', 'Les suites sont non-fumeurs. Les clients sont responsables des dommages au-delà de l\'usure normale.'],
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      sections: [
        ['What we collect', 'When you book, we collect your name, email, phone number, stay dates and any requests you share with us.'],
        ['Why we use it', 'To manage your reservation, contact you about your stay and meet our legal obligations. We do not sell your data.'],
        ['On this device', 'Your language and the stay you are planning (dates, guests, suite) are saved in your browser so you can pick up where you left off. Clear your browser storage to remove them.'],
        ['How long we keep it', 'Booking records are kept for as long as the law requires, then deleted.'],
        ['Your rights', 'You can ask to access, correct or delete your personal data, or object to its use, by contacting us.'],
      ],
    },
    fr: {
      title: 'Politique de Confidentialité',
      sections: [
        ['Données collectées', 'Lors d\'une réservation, nous collectons votre nom, e-mail, téléphone, dates de séjour et vos éventuelles demandes.'],
        ['Utilisation', 'Pour gérer votre réservation, vous contacter au sujet de votre séjour et respecter nos obligations légales. Nous ne vendons pas vos données.'],
        ['Sur cet appareil', 'Votre langue et le séjour en préparation (dates, personnes, suite) sont enregistrés dans votre navigateur pour reprendre là où vous vous êtes arrêté.'],
        ['Durée de conservation', 'Les données de réservation sont conservées le temps requis par la loi, puis supprimées.'],
        ['Vos droits', 'Vous pouvez demander l\'accès, la rectification ou la suppression de vos données en nous contactant.'],
      ],
    },
  },
  cookies: {
    en: {
      title: 'Cookie Policy',
      sections: [
        ['What we use', 'This site uses no advertising or tracking cookies. It stores your language and planned stay in your browser\'s local storage, which never leaves your device.'],
        ['Managing storage', 'You can clear this data at any time from your browser settings. The site works without it; your choices simply will not be remembered.'],
      ],
    },
    fr: {
      title: 'Politique de Cookies',
      sections: [
        ['Ce que nous utilisons', 'Ce site n\'utilise aucun cookie publicitaire ou de suivi. Il enregistre votre langue et votre séjour en préparation dans le stockage local de votre navigateur.'],
        ['Gérer le stockage', 'Vous pouvez effacer ces données à tout moment dans les réglages de votre navigateur. Le site fonctionne sans elles.'],
      ],
    },
  },
};

export default function LegalView({ view }: { view: LegalView }) {
  const { language } = useHotel();
  const page = CONTENT[view][language];
  return (
    <div className="bg-obsidian min-h-screen text-cream pt-32 pb-24" id={`legal-${view}`}>
      <article className="max-w-3xl mx-auto px-6 md:px-12">
        <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide mb-4">{page.title}</h1>
        <p className="text-gold-400 mb-12 flex flex-wrap items-center gap-3 text-sm">
          <IllustrativeBadge label={language === 'en' ? 'Template' : 'Modèle'} />
          <span className="text-cream/70">
            {language === 'en' ? 'Generic template text for this demo hotel, pending legal review.' : 'Texte type pour cet hôtel de démonstration, à faire valider juridiquement.'}
          </span>
        </p>
        <div className="space-y-10">
          {page.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="font-serif text-2xl font-light text-gold-400 mb-3">{heading}</h2>
              <p className="text-sm md:text-base text-cream/80 leading-relaxed font-sans font-light">{body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
