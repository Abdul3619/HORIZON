import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHotel } from '../HotelContext';
import { 
  LayoutDashboard, 
  Bed, 
  ClipboardList, 
  TrendingUp, 
  Settings, 
  ShieldAlert, 
  Search, 
  Bell, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  User, 
  DollarSign, 
  Percent, 
  Hotel, 
  LogOut,
  RefreshCw,
  Sliders,
  Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Define typed items matching the database migrations structure
interface Room {
  id: string;
  room_number: string;
  room_class: string;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  price: number;
}

interface Booking {
  id: string;
  guest_name: string;
  email: string;
  room_class: string;
  check_in: string;
  check_out: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_amount: number;
}

interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  table_name: string;
  record_id: string;
  changes: string;
  timestamp: string;
}

// Initial Simulated/Real-Time Data matching public database structures
const INITIAL_ROOMS: Room[] = [
  { id: '1', room_number: '101', room_class: 'Azure Executive Suite', floor: 1, status: 'available', price: 750 },
  { id: '2', room_number: '102', room_class: 'Azure Executive Suite', floor: 1, status: 'cleaning', price: 750 },
  { id: '3', room_number: '201', room_class: 'Amber Sun Suite', floor: 2, status: 'occupied', price: 950 },
  { id: '4', room_number: '202', room_class: 'Zen Oasis Suite', floor: 2, status: 'available', price: 1100 },
  { id: '5', room_number: '301', room_class: "L'Horizon Ocean Suite", floor: 3, status: 'occupied', price: 1650 },
  { id: '6', room_number: '302', room_class: "L'Horizon Ocean Suite", floor: 3, status: 'maintenance', price: 1650 },
  { id: '7', room_number: '401', room_class: 'Royal Horizon Penthouse', floor: 4, status: 'available', price: 2400 },
  { id: '8', room_number: '402', room_class: 'Riviera Presidential Suite', floor: 4, status: 'occupied', price: 3200 }
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'LR-2026-001', guest_name: 'Lord Alistair Sterling', email: 'alistair@sterling.co.uk', room_class: 'Royal Horizon Penthouse', check_in: '2026-06-29', check_out: '2026-07-04', status: 'confirmed', total_amount: 12000 },
  { id: 'LR-2026-002', guest_name: 'Viscountess Helene de Valois', email: 'helene@valois.fr', room_class: "L'Horizon Ocean Suite", check_in: '2026-06-28', check_out: '2026-07-01', status: 'checked_in', total_amount: 4950 },
  { id: 'LR-2026-003', guest_name: 'Dr. Kenji Sato', email: 'kenji.sato@kyoto-u.ac.jp', room_class: 'Zen Oasis Suite', check_in: '2026-07-05', check_out: '2026-07-12', status: 'pending', total_amount: 7700 },
  { id: 'LR-2026-004', guest_name: 'Elena Rostova', email: 'elena@rostov-holdings.ch', room_class: 'Riviera Presidential Suite', check_in: '2026-06-25', check_out: '2026-06-30', status: 'checked_in', total_amount: 16000 },
  { id: 'LR-2026-005', guest_name: 'Marcus Vance', email: 'marcus@vancecapital.com', room_class: 'Azure Executive Suite', check_in: '2026-06-20', check_out: '2026-06-24', status: 'checked_out', total_amount: 3000 },
  { id: 'LR-2026-006', guest_name: 'Charlotte Dubois', email: 'charlotte@dubois-art.fr', room_class: 'Amber Sun Suite', check_in: '2026-07-01', check_out: '2026-07-03', status: 'cancelled', total_amount: 1900 }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-902', actor: 'Madame Beatrice (Admin)', role: 'admin', action: 'CREATE_PROMO', table_name: 'promo_codes', record_id: '8a2f-11ed', changes: 'Created ROYAL15 with 15% discount limit 500 usages', timestamp: '2026-06-28 21:10:00' },
  { id: 'LOG-903', actor: 'Jean-Pierre (Manager)', role: 'manager', action: 'UPDATE_BASE_PRICE', table_name: 'room_classes', record_id: '3f2b-22df', changes: 'Increased base price of Royal Horizon Penthouse from $2200 to $2400', timestamp: '2026-06-28 22:15:30' },
  { id: 'LOG-904', actor: 'Luc (Receptionist)', role: 'receptionist', action: 'CHECK_IN_GUEST', table_name: 'bookings', record_id: 'LR-2026-002', changes: 'Checked in Viscountess Helene de Valois, assigned Room 301', timestamp: '2026-06-28 14:05:22' },
  { id: 'LOG-905', actor: 'Madame Beatrice (Admin)', role: 'admin', action: 'UPDATE_ROOM_STATUS', table_name: 'rooms', record_id: 'room-102', changes: 'Changed Room 102 status from Occupied to Cleaning', timestamp: '2026-06-28 11:30:10' }
];

// Recharts simulated financial performance data
const REVENUE_DATA = [
  { name: 'Mon', revenue: 14200 },
  { name: 'Tue', revenue: 16800 },
  { name: 'Wed', revenue: 15300 },
  { name: 'Thu', revenue: 19400 },
  { name: 'Fri', revenue: 24500 },
  { name: 'Sat', revenue: 32000 },
  { name: 'Sun', revenue: 28900 }
];

const OCCUPANCY_DATA = [
  { name: 'Azure Exec', capacity: 20, occupied: 15 },
  { name: 'Amber Sun', capacity: 15, occupied: 11 },
  { name: 'Zen Oasis', capacity: 12, occupied: 8 },
  { name: "Horizon Ocean", capacity: 10, occupied: 9 },
  { name: 'Royal Pent', capacity: 5, occupied: 4 },
  { name: 'Riviera Pres', capacity: 2, occupied: 2 }
];

export default function AdminDashboard() {
  const { setView } = useHotel();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'analytics' | 'settings'>('rooms');
  
  // Custom Claim / RBAC Role Selector simulating real authorization claims parsed from JWT App Metadata
  const [activeRole, setActiveRole] = useState<'admin' | 'manager' | 'receptionist' | 'staff' | 'customer'>('admin');
  
  // Live State Registries
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  // Real-Time Simulated Alerts Queue
  const [alerts, setAlerts] = useState<string[]>([
    "Lord Sterling has completed a gourmet custom dining order via in-suite tablet.",
    "Housekeeping marked Suite 202 as fully pristine.",
    "New reservation [LR-2026-007] submitted for Riviera Presidential Suite."
  ]);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  // Search & Filtering State
  const [roomFilter, setRoomFilter] = useState<'all' | 'available' | 'occupied' | 'cleaning' | 'maintenance'>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'>('all');
  
  // Selected Room for Edit Modal
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);
  
  // Content Management System Form
  const [cmsHotelName, setCmsHotelName] = useState("L'Horizon Royal");
  const [cmsBrandingSlogan, setCmsBrandingSlogan] = useState("Where Endless Ocean Meets Regal Grandeur");
  const [cmsBaseMultiplier, setCmsBaseMultiplier] = useState(1.00);
  const [cmsAlertMessage, setCmsAlertMessage] = useState('');

  // Pagination for ledger
  const [ledgerPage, setLedgerPage] = useState(0);
  const ledgerRowsPerPage = 5;

  // Real-Time Sync Simulator: Simulates external bookings or room status updates from other devices every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Choose a random room and change its status
      setRooms(prev => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const nextRooms = [...prev];
        const statusCycle: ('available' | 'occupied' | 'cleaning' | 'maintenance')[] = ['available', 'occupied', 'cleaning', 'maintenance'];
        const currentStatus = nextRooms[randomIndex].status;
        const remainingStatuses = statusCycle.filter(s => s !== currentStatus);
        const nextStatus = remainingStatuses[Math.floor(Math.random() * remainingStatuses.length)];
        
        nextRooms[randomIndex] = {
          ...nextRooms[randomIndex],
          status: nextStatus
        };

        // Inject dynamic notification
        const roomNum = nextRooms[randomIndex].room_number;
        setAlerts(old => [
          `[Real-Time Link] Room ${roomNum} state transitioned to '${nextStatus}' globally.`,
          ...old.slice(0, 4)
        ]);

        return nextRooms;
      });
    }, 22000);

    return () => clearInterval(interval);
  }, []);

  // Check RBAC Route Limits
  const hasAccessToAnalytics = activeRole === 'admin' || activeRole === 'manager';
  const hasAccessToSettings = activeRole === 'admin';

  // Handler: Modify Room Status
  const handleUpdateRoomStatus = (roomId: string, newStatus: 'available' | 'occupied' | 'cleaning' | 'maintenance') => {
    const updated = rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r);
    setRooms(updated);
    
    const targetRoom = rooms.find(r => r.id === roomId);
    if (targetRoom) {
      // Append Audit Log
      const changeText = `Updated status of Room ${targetRoom.room_number} to ${newStatus}`;
      const newLog: AuditLog = {
        id: `LOG-${Math.floor(Math.random() * 1000) + 100}`,
        actor: `${activeRole.toUpperCase()} Session`,
        role: activeRole,
        action: 'UPDATE_ROOM_STATUS',
        table_name: 'rooms',
        record_id: roomId,
        changes: changeText,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    
    setSelectedRoomForEdit(null);
  };

  // Handler: Booking actions (Check In / Check Out / Cancel)
  const handleUpdateBookingStatus = (bookingId: string, nextStatus: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled') => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b));
    
    // Log Audit change
    const targetB = bookings.find(b => b.id === bookingId);
    if (targetB) {
      const newLog: AuditLog = {
        id: `LOG-${Math.floor(Math.random() * 1000) + 100}`,
        actor: `${activeRole.toUpperCase()} Session`,
        role: activeRole,
        action: 'UPDATE_BOOKING_STATUS',
        table_name: 'bookings',
        record_id: bookingId,
        changes: `Changed booking status for ${targetB.guest_name} to ${nextStatus}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  // Handler: Save CMS Changes
  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    setCmsAlertMessage('Branding & Price multiplier successfully written to public.hotels.metadata column!');
    
    // Add audit log
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(Math.random() * 1000) + 100}`,
      actor: `${activeRole.toUpperCase()} Session`,
      role: activeRole,
      action: 'UPDATE_HOTEL_METADATA',
      table_name: 'hotels',
      record_id: 'global-hotel-id',
      changes: `Modified branding slogan to "${cmsBrandingSlogan}" & set yield pricing factor to ${cmsBaseMultiplier}x`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setCmsAlertMessage('');
    }, 4000);
  };

  // Filtered lists
  const filteredRooms = rooms.filter(r => roomFilter === 'all' || r.status === roomFilter);
  
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guest_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.id.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in');
  const occupancyPercentage = Number(((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100).toFixed(1));
  const averageDailyRate = activeBookings.length > 0
    ? Math.round(activeBookings.reduce((sum, b) => sum + (b.total_amount / 4), 0) / activeBookings.length)
    : 1250;
  const revPar = Math.round(averageDailyRate * (occupancyPercentage / 100));

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-cream flex overflow-hidden font-sans" id="admin-workspace">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? '70px' : '280px' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#0F1115] border-r border-gold-400/10 flex flex-col justify-between select-none relative z-20 shrink-0"
        id="sidebar-container"
      >
        <div>
          {/* Brand Panel */}
          <div className="h-20 border-b border-gold-400/10 flex items-center justify-between px-5 overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col text-left"
                >
                  <span className="font-serif text-sm tracking-[0.15em] text-gold-400 font-bold">L'HORIZON ROYAL</span>
                  <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 text-cream">Operations Space</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-gold-400/10 text-gold-400 border border-gold-400/20 rounded transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center space-x-4 px-3.5 py-3 rounded text-sm transition-all ${
                activeTab === 'rooms' 
                  ? 'bg-gold-400 text-obsidian font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                  : 'text-cream/70 hover:text-gold-400 hover:bg-white/5'
              }`}
            >
              <Bed className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span>Room Grid</span>}
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center space-x-4 px-3.5 py-3 rounded text-sm transition-all ${
                activeTab === 'bookings' 
                  ? 'bg-gold-400 text-obsidian font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                  : 'text-cream/70 hover:text-gold-400 hover:bg-white/5'
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span>Reservations Ledger</span>}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-4 px-3.5 py-3 rounded text-sm transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-gold-400 text-obsidian font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                  : 'text-cream/70 hover:text-gold-400 hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span>Recharts Analytics</span>}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-4 px-3.5 py-3 rounded text-sm transition-all ${
                activeTab === 'settings' 
                  ? 'bg-gold-400 text-obsidian font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                  : 'text-cream/70 hover:text-gold-400 hover:bg-white/5'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span>Settings & Compliance</span>}
            </button>

            <button
              onClick={() => setView('home')}
              className="w-full flex items-center space-x-4 px-3.5 py-3 rounded text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-all mt-6 border-t border-white/5 pt-6"
            >
              <LogOut className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span>Return to Resort</span>}
            </button>
          </nav>
        </div>

        {/* User Identity / Claims Display */}
        <div className="p-4 border-t border-gold-400/10">
          <div className="bg-[#14171D] p-3 rounded border border-white/5 overflow-hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400 font-serif font-bold text-xs">
                {activeRole[0].toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="text-left leading-none">
                  <p className="text-xs font-semibold text-cream">Claim Identity</p>
                  <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-gold-400/20 text-gold-400 border border-gold-400/30 uppercase tracking-wider">
                    {activeRole}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10" id="admin-viewport">
        
        {/* TOP COMPREHENSIVE NAVBAR */}
        <header className="h-20 border-b border-gold-400/10 px-8 flex items-center justify-between bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-30" id="dashboard-header">
          <div className="flex items-center space-x-6">
            <h1 className="font-serif text-lg tracking-wider text-cream font-semibold hidden md:block">
              EXECUTIVE PORTAL
            </h1>
            
            {/* ROLE SELECTOR (Simulating Supabase Custom JWT Claims & Identity Changes) */}
            <div className="flex items-center space-x-2 bg-[#14171D] border border-white/10 px-2 py-1 rounded" id="claims-simulator">
              <span className="text-[10px] text-cream/40 uppercase tracking-widest font-mono">Role JWT Claims:</span>
              <select 
                value={activeRole} 
                onChange={(e) => {
                  setActiveRole(e.target.value as any);
                  // Real-time audit log
                  const newLog: AuditLog = {
                    id: `LOG-${Math.floor(Math.random() * 1000) + 100}`,
                    actor: `Systems Daemon`,
                    role: 'admin',
                    action: 'SWITCH_CLAIM_ROLE',
                    table_name: 'auth.users',
                    record_id: 'user-id-simulation',
                    changes: `Simulated authentication token claims changed to role '${e.target.value}'`,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
                  };
                  setAuditLogs(prev => [newLog, ...prev]);
                }}
                className="bg-transparent text-xs text-gold-400 font-bold focus:outline-none cursor-pointer pr-2"
              >
                <option value="admin">Admin (All Access)</option>
                <option value="manager">Manager (Read/Write/Analytics)</option>
                <option value="receptionist">Receptionist (Ledger Only)</option>
                <option value="staff">Housekeeping (Room Grid Only)</option>
                <option value="customer">Customer (Access Denied)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-6" id="header-actions">
            
            {/* Real-time Webhook simulation link */}
            <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-mono bg-emerald-400/5 px-2.5 py-1.5 border border-emerald-400/20 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>REAL-TIME ENGINE LIVE</span>
            </div>

            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowAlertMenu(!showAlertMenu)}
                className="p-2 text-cream hover:text-gold-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-400" />
              </button>
              
              <AnimatePresence>
                {showAlertMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-[#14171D] border border-gold-400/20 rounded-lg p-4 shadow-2xl z-50 text-left"
                  >
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400 border-b border-white/5 pb-2 mb-2">
                      Operations Stream (Webhook Events)
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {alerts.map((alt, idx) => (
                        <div key={idx} className="text-[11px] leading-relaxed text-cream/70 hover:text-cream transition-colors border-b border-white/5 pb-2 last:border-0">
                          <p>{alt}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <div className="p-8 flex-1" id="workspace-content">
          
          {/* TAB 1: ROOMS INTERACTIVE VISUAL GRID */}
          {activeTab === 'rooms' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                  <h2 className="font-serif text-2xl text-cream tracking-wide">Pristine Room Status Grid</h2>
                  <p className="text-xs text-cream/50 mt-1">
                    Manage individual suite layouts, housekeeping schedules, and physical room assignments.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {(['all', 'available', 'occupied', 'cleaning', 'maintenance'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setRoomFilter(st)}
                      className={`px-4 py-1.5 rounded text-xs uppercase tracking-wider font-semibold border transition-all ${
                        roomFilter === st 
                          ? 'bg-gold-400 border-gold-400 text-obsidian shadow-lg' 
                          : 'border-white/10 bg-white/5 text-cream/75 hover:border-gold-400/40'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Representing Physical Rooms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRooms.map((room) => {
                  // Operational state coloration
                  const statusColors = {
                    available: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500',
                    occupied: 'border-red-500/30 bg-red-500/5 text-red-400 hover:border-red-500',
                    cleaning: 'border-blue-500/30 bg-blue-500/5 text-blue-400 hover:border-blue-500',
                    maintenance: 'border-amber-500/30 bg-amber-500/5 text-amber-400 hover:border-amber-500'
                  };

                  return (
                    <motion.div
                      layout
                      key={room.id}
                      onClick={() => setSelectedRoomForEdit(room)}
                      className={`border p-5 rounded-lg text-left transition-all cursor-pointer relative group ${statusColors[room.status]}`}
                      whileHover={{ y: -4, scale: 1.01 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-serif text-3xl font-light tracking-tight">{room.room_number}</span>
                          <span className="text-[10px] block font-mono text-cream/40 mt-1 uppercase tracking-wider">Floor {room.floor}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-widest">
                          {room.status}
                        </span>
                      </div>

                      <div className="mt-6 border-t border-white/5 pt-4">
                        <p className="text-xs font-semibold truncate text-cream/90">{room.room_class}</p>
                        <p className="text-[11px] font-mono text-gold-400/80 mt-1">${room.price} / night</p>
                      </div>

                      {/* Micro interaction feedback */}
                      <div className="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Status Modifier Modal */}
              <AnimatePresence>
                {selectedRoomForEdit && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#14171D] border border-gold-400/30 rounded-lg max-w-md w-full p-6 text-left"
                    >
                      <h3 className="font-serif text-xl text-gold-400 tracking-wide">
                        Modify Room {selectedRoomForEdit.room_number}
                      </h3>
                      <p className="text-xs text-cream/60 mt-1 mb-6">
                        Operational states are synchronized across desk and housekeeping terminals instantly.
                      </p>

                      <div className="space-y-4">
                        <label className="text-xs text-cream/40 uppercase tracking-wider">Operational Status</label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['available', 'occupied', 'cleaning', 'maintenance'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateRoomStatus(selectedRoomForEdit.id, st)}
                              className={`px-4 py-3 rounded text-xs uppercase font-semibold border transition-all text-center ${
                                selectedRoomForEdit.status === st 
                                  ? 'bg-gold-400 border-gold-400 text-obsidian font-bold' 
                                  : 'border-white/10 bg-white/5 text-cream/70 hover:border-gold-400/40'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={() => setSelectedRoomForEdit(null)}
                          className="px-5 py-2 text-xs border border-white/10 text-cream/60 hover:text-cream hover:bg-white/5 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 2: ADVANCED RESERVATIONS LEDGER */}
          {activeTab === 'bookings' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                  <h2 className="font-serif text-2xl text-cream tracking-wide">Elite Reservations Ledger</h2>
                  <p className="text-xs text-cream/50 mt-1">
                    Execute guest check-ins, record physical suite allocations, and handle dynamic cancellations.
                  </p>
                </div>

                {/* Ledger Toolbar */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Search input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Guest, Email, or Reference ID..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-[#14171D] border border-white/10 pl-9 pr-4 py-2 rounded text-xs focus:outline-none focus:border-gold-400/50"
                    />
                  </div>

                  {/* Status filter dropdown */}
                  <select
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value as any)}
                    className="bg-[#14171D] border border-white/10 px-4 py-2 rounded text-xs text-cream/80 focus:outline-none focus:border-gold-400/50 cursor-pointer"
                  >
                    <option value="all">All Booking Statuses</option>
                    <option value="pending">Pending Approval</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* TanStack-like Custom Data Table */}
              <div className="bg-[#0F1115] border border-gold-400/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gold-400/10 text-[10px] uppercase tracking-widest text-gold-400 font-semibold bg-[#14171D]/40">
                        <th className="p-4">Reference</th>
                        <th className="p-4">Lead Guest</th>
                        <th className="p-4">Accommodation</th>
                        <th className="p-4">Stay Dates</th>
                        <th className="p-4">Total Sovereign</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {filteredBookings
                        .slice(ledgerPage * ledgerRowsPerPage, (ledgerPage + 1) * ledgerRowsPerPage)
                        .map((b) => {
                          const statusBadges = {
                            pending: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
                            confirmed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
                            checked_in: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
                            checked_out: 'bg-cream/10 text-cream/60 border-white/10',
                            cancelled: 'bg-red-400/10 text-red-400 border-red-400/20'
                          };

                          return (
                            <tr key={b.id} className="hover:bg-white/2 transition-colors">
                              <td className="p-4 font-mono font-bold text-cream/90">{b.id}</td>
                              <td className="p-4">
                                <div className="font-semibold">{b.guest_name}</div>
                                <div className="text-[10px] text-cream/40 font-mono">{b.email}</div>
                              </td>
                              <td className="p-4 text-cream/80">{b.room_class}</td>
                              <td className="p-4 font-mono text-[11px] text-cream/60">
                                {b.check_in} <span className="opacity-45">to</span> {b.check_out}
                              </td>
                              <td className="p-4 text-gold-400 font-semibold">${b.total_amount.toLocaleString()}</td>
                              <td className="p-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] uppercase tracking-wider font-mono ${statusBadges[b.status]}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                {b.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'checked_in')}
                                    className="px-3 py-1 bg-blue-400 text-obsidian rounded text-[10px] font-bold uppercase hover:bg-blue-300 transition-colors"
                                  >
                                    Check In
                                  </button>
                                )}
                                {b.status === 'checked_in' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'checked_out')}
                                    className="px-3 py-1 bg-cream text-obsidian rounded text-[10px] font-bold uppercase hover:bg-cream/80 transition-colors"
                                  >
                                    Check Out
                                  </button>
                                )}
                                {(b.status === 'pending' || b.status === 'confirmed') && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                    className="px-3 py-1 bg-red-400/10 text-red-400 border border-red-400/20 rounded text-[10px] font-semibold uppercase hover:bg-red-400/20 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-cream/40">
                            No reservations match your active query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination bar */}
                <div className="p-4 border-t border-gold-400/10 flex justify-between items-center bg-[#14171D]/20 text-xs">
                  <span className="text-cream/50">
                    Showing {ledgerPage * ledgerRowsPerPage + 1} - {Math.min((ledgerPage + 1) * ledgerRowsPerPage, filteredBookings.length)} of {filteredBookings.length}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={ledgerPage === 0}
                      onClick={() => setLedgerPage(p => Math.max(0, p - 1))}
                      className="p-1.5 border border-white/10 rounded hover:bg-white/5 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={(ledgerPage + 1) * ledgerRowsPerPage >= filteredBookings.length}
                      onClick={() => setLedgerPage(p => p + 1)}
                      className="p-1.5 border border-white/10 rounded hover:bg-white/5 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: RECHARTS ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
            >
              {/* Role Gate Verification shield */}
              {!hasAccessToAnalytics ? (
                <div className="bg-[#1C1517] border border-red-400/20 rounded-lg p-10 text-center max-w-2xl mx-auto my-12 text-red-400">
                  <ShieldAlert className="w-16 h-16 mx-auto mb-4 animate-pulse text-red-400" />
                  <h3 className="font-serif text-2xl tracking-wide text-cream mb-2">Operational Access Denied</h3>
                  <p className="text-sm text-cream/60 max-w-md mx-auto mb-6">
                    Next.js Edge router reports authentication JWT app_metadata claim '{activeRole}' possesses insufficient privileges. 
                    Only 'admin' and 'manager' roles can retrieve financial metrics.
                  </p>
                  <div className="text-xs bg-red-400/10 border border-red-400/20 py-2 px-4 rounded font-mono text-cream inline-block">
                    GATEWAY_ERROR: RBAC_ROLE_MINIMUM_REQUIRED_EXCEEDED
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-left">
                    <h2 className="font-serif text-2xl text-cream tracking-wide">Executive Intelligence Metrics</h2>
                    <p className="text-xs text-cream/50 mt-1">
                      Real-time calculations for L'Horizon Royal ADR, RevPAR, and dynamic capacity utilization.
                    </p>
                  </div>

                  {/* Operational KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      className="bg-[#0F1115] border border-gold-400/10 p-6 rounded-lg text-left"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] uppercase tracking-widest text-cream/40 font-mono">Average Daily Rate (ADR)</span>
                        <DollarSign className="w-4.5 h-4.5 text-gold-400" />
                      </div>
                      <p className="font-serif text-3xl font-light text-cream mt-4">${averageDailyRate.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-400 mt-2 flex items-center">
                        <span>+4.2% from previous cycle</span>
                      </p>
                    </motion.div>

                    <motion.div 
                      className="bg-[#0F1115] border border-gold-400/10 p-6 rounded-lg text-left"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] uppercase tracking-widest text-cream/40 font-mono">Occupancy Rate</span>
                        <Percent className="w-4.5 h-4.5 text-gold-400" />
                      </div>
                      <p className="font-serif text-3xl font-light text-cream mt-4">{occupancyPercentage}%</p>
                      <p className="text-[10px] text-emerald-400 mt-2 flex items-center">
                        <span>+1.5% live check-in momentum</span>
                      </p>
                    </motion.div>

                    <motion.div 
                      className="bg-[#0F1115] border border-gold-400/10 p-6 rounded-lg text-left"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] uppercase tracking-widest text-cream/40 font-mono">RevPAR</span>
                        <TrendingUp className="w-4.5 h-4.5 text-gold-400" />
                      </div>
                      <p className="font-serif text-3xl font-light text-cream mt-4">${revPar}</p>
                      <p className="text-[10px] text-emerald-400 mt-2 flex items-center">
                        <span>Excellent yield optimization</span>
                      </p>
                    </motion.div>
                  </div>

                  {/* Area Chart: Weekly Gross Revenue */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-[#0F1115] border border-gold-400/10 p-6 rounded-lg">
                      <h3 className="font-serif text-sm tracking-widest text-gold-400 uppercase mb-6 text-left">
                        Weekly Gross Sovereign Revenue Flow
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2229" />
                            <XAxis dataKey="name" stroke="#686D76" fontSize={11} tickLine={false} />
                            <YAxis stroke="#686D76" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#14171D', borderColor: '#D4AF37' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#goldGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart: Suite Class Allocation vs Occupied Count */}
                    <div className="bg-[#0F1115] border border-gold-400/10 p-6 rounded-lg">
                      <h3 className="font-serif text-sm tracking-widest text-gold-400 uppercase mb-6 text-left">
                        Active Room Class Capacity vs Utilization
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={OCCUPANCY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2229" />
                            <XAxis dataKey="name" stroke="#686D76" fontSize={10} tickLine={false} />
                            <YAxis stroke="#686D76" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#14171D', borderColor: '#D4AF37' }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="capacity" fill="#1F2229" stroke="#686D76" strokeWidth={1} name="Physical Capacity" />
                            <Bar dataKey="occupied" fill="#22C55E" name="Occupied Suites" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 4: SYSTEM SETTINGS & AUDIT COMPLIANCE */}
          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-8"
            >
              {/* CMS Controls Forms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Content Management System Panel */}
                <div className="bg-[#0F1115] border border-gold-400/10 p-6 rounded-lg text-left">
                  <div className="flex items-center space-x-3 mb-6">
                    <Sliders className="w-5 h-5 text-gold-400" />
                    <h3 className="font-serif text-base text-gold-400 tracking-wide uppercase">
                      CMS Hotels Metadata Customizer
                    </h3>
                  </div>

                  <form onSubmit={handleSaveCMS} className="space-y-5">
                    <div>
                      <label className="text-xs text-cream/40 uppercase tracking-wider block mb-2">Hotel Brand Display</label>
                      <input
                        type="text"
                        value={cmsHotelName}
                        onChange={(e) => setCmsHotelName(e.target.value)}
                        className="w-full bg-[#14171D] border border-white/10 p-3 rounded text-xs focus:outline-none focus:border-gold-400/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-cream/40 uppercase tracking-wider block mb-2">Editorial Hero Slogan</label>
                      <input
                        type="text"
                        value={cmsBrandingSlogan}
                        onChange={(e) => setCmsBrandingSlogan(e.target.value)}
                        className="w-full bg-[#14171D] border border-white/10 p-3 rounded text-xs focus:outline-none focus:border-gold-400/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-cream/40 uppercase tracking-wider block mb-2">
                        Dynamic Price Multiplier (Base Yield)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        max="2.5"
                        value={cmsBaseMultiplier}
                        onChange={(e) => setCmsBaseMultiplier(parseFloat(e.target.value))}
                        className="w-full bg-[#14171D] border border-white/10 p-3 rounded text-xs focus:outline-none focus:border-gold-400/50"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gold-400 text-obsidian text-xs font-bold uppercase tracking-wider hover:bg-gold-300 transition-colors"
                    >
                      Update Public.hotels.metadata Column
                    </button>

                    {cmsAlertMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-emerald-400 font-mono bg-emerald-400/10 border border-emerald-400/20 p-3 rounded"
                      >
                        {cmsAlertMessage}
                      </motion.div>
                    )}
                  </form>
                </div>

                {/* Relational Table Schema Preview */}
                <div className="bg-[#0F1115] border border-gold-400/10 p-6 rounded-lg text-left">
                  <div className="flex items-center space-x-3 mb-6">
                    <Database className="w-5 h-5 text-gold-400" />
                    <h3 className="font-serif text-base text-gold-400 tracking-wide uppercase">
                      Supabase DB Topology Preview
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-cream/60 leading-relaxed">
                      L'Horizon Royal operations are fully mapped in high-efficiency PostgreSQL tables inside public schemas with real-time replication tunnels.
                    </p>

                    <div className="space-y-2.5 font-mono text-[10px]">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gold-400 font-semibold">public.hotels</span>
                        <span className="text-cream/50">Global physical resort details & metadata JSON</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gold-400 font-semibold">public.room_classes</span>
                        <span className="text-cream/50">Suite specs, sizes, base rates & feature arrays</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gold-400 font-semibold">public.room_inventories</span>
                        <span className="text-cream/50">Day-by-day availability counters (Pessimistic locked)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gold-400 font-semibold">public.bookings</span>
                        <span className="text-cream/50">Client records, stay boundaries, discount summaries</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gold-400 font-semibold">public.payments</span>
                        <span className="text-cream/50">Sovereign transactional financial ledger records</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECURITY AUDIT COMPLIANCE VIEW */}
              <div className="bg-[#0F1115] border border-gold-400/10 rounded-lg p-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center space-x-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-gold-400" />
                    <div>
                      <h3 className="font-serif text-base text-cream tracking-wide">
                        Security Compliance Audit Log
                      </h3>
                      <p className="text-[11px] text-cream/40 mt-0.5">
                        FIPS compliance recording of schema modifications, checkout creations, and status revisions.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-gold-400/10 text-gold-400 border border-gold-400/20 px-2.5 py-1 rounded">
                    Audit Tracking Active
                  </span>
                </div>

                {/* Audit table restricted tab check (Admins only) */}
                {!hasAccessToSettings ? (
                  <div className="py-12 text-center text-red-400 text-xs">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-60" />
                    <span>Your auth claim role '{activeRole}' possesses insufficient clearance to fetch compliance records.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto text-left">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-cream/40 font-mono">
                          <th className="pb-3">Actor</th>
                          <th className="pb-3">Event Type</th>
                          <th className="pb-3">Table Target</th>
                          <th className="pb-3">Record Unique Key</th>
                          <th className="pb-3">Pristine Mutation Summary</th>
                          <th className="pb-3 text-right">Time Log</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[11px] font-mono text-cream/80">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/1">
                            <td className="py-3 font-semibold text-cream">{log.actor}</td>
                            <td className="py-3 text-gold-400">{log.action}</td>
                            <td className="py-3 text-cream/60">{log.table_name}</td>
                            <td className="py-3 text-cream/50 truncate max-w-[120px]">{log.record_id}</td>
                            <td className="py-3 text-cream/70 max-w-sm font-sans leading-relaxed">{log.changes}</td>
                            <td className="py-3 text-right text-cream/40">{log.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
