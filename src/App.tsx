/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HotelProvider, useHotel } from './HotelContext';
import type { View } from './types';
import LuxuryNavbar from './components/LuxuryNavbar';
import LuxuryFooter from './components/LuxuryFooter';
import HomeView from './components/HomeView';
import RoomsView from './components/RoomsView';
import BookingView from './components/BookingView';
import AdminDashboard from './components/AdminDashboard';
import LegalView from './components/LegalView';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentView } = useHotel();

  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col justify-between" id="app-container">
      {/* Luxury Sticky Transparent-to-Opaque Header */}
      <LuxuryNavbar />

      {/* Main Experience Panel */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <HomeView />
            </motion.div>
          )}

          {currentView === 'rooms' && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <RoomsView />
            </motion.div>
          )}

          {currentView === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <BookingView />
            </motion.div>
          )}
          {(currentView === 'privacy' || currentView === 'terms' || currentView === 'cookies') && (
            <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <LegalView view={currentView} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Luxury Footer with brand credentials & legal indices */}
      <LuxuryFooter />
    </div>
  );
}

export default function App({ initialView = 'home' }: { initialView?: View }) {
  return (
    <HotelProvider initialView={initialView}>
      <AppContent />
    </HotelProvider>
  );
}

