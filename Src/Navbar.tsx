import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Clock,
  MapPin,
  Calendar,
  Menu,
  X,
  HeartPulse,
  ShieldAlert,
  Sparkles,
  User as UserIcon,
  LogOut,
  LogIn,
  ChevronDown,
  ShieldCheck,
  CalendarCheck,
  Activity,
} from 'lucide-react';
import { PageType } from '../types';
import { HOSPITAL_INFO } from '../data/hospitalData';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onOpenAppointmentModal: (doctorId?: string, departmentId?: string) => void;
  onOpenAppointmentsList: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenAppointmentModal,
  onOpenAppointmentsList,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { currentUser, userProfile, isAdmin, logout, openAuthModal } = useAuth();

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: PageType; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'department', label: 'Departments' },
    { id: 'doctor', label: 'Doctors & Specialists' },
    { id: 'profile', label: 'Patient Profile' },
    { id: 'admin', label: 'Admin Portal' },
  ];

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Patient';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Clinical Emergency & Contact Strip */}
      <div className="bg-[#0B1E36] text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <a
              href={`tel:${HOSPITAL_INFO.phoneEmergency}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white font-semibold tracking-wide transition-colors shadow-xs"
              id="topbar-emergency-helpline"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>24/7 Emergency Trauma: {HOSPITAL_INFO.phoneEmergency}</span>
            </a>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>OPD Clinics: Mon – Sat 8:00 AM – 8:00 PM</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate max-w-xs">{HOSPITAL_INFO.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              id="topbar-admin-portal-link"
              className="inline-flex items-center gap-1 text-amber-300 hover:text-white font-semibold cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </button>
            <span className="hidden lg:inline text-slate-400">|</span>
            <span className="hidden lg:inline text-slate-300 font-medium">
              JCI & NABH Accredited
            </span>
            <a
              href={`tel:${HOSPITAL_INFO.phoneAppointments}`}
              className="flex items-center gap-1.5 text-sky-300 hover:text-white font-semibold transition-colors"
              id="topbar-phone-appointment"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Appointments: {HOSPITAL_INFO.phoneAppointments}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Hospital Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
            id="brand-logo-btn"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-700 via-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform duration-200 border border-sky-400/30">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif">
                  We Care
                </span>
                <span className="text-xl sm:text-2xl font-medium text-sky-600 font-serif">
                  Hospital
                </span>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Center for Medical Excellence & Compassion
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const isItemAdmin = item.id === 'admin';
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? isItemAdmin
                        ? 'text-amber-950 bg-amber-100 border border-amber-300 shadow-2xs'
                        : 'text-sky-800 bg-sky-50 border border-sky-200/80 shadow-2xs'
                      : isItemAdmin
                      ? 'text-amber-800 hover:text-amber-950 hover:bg-amber-50/80 border border-amber-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {isItemAdmin && <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {/* Admin Indicator Pill if logged in as Admin */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin')}
                    id="nav-admin-active-pill-btn"
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === 'admin'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                    }`}
                    title="Active Hospital Administrator Session"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                )}

                {/* My Appointments Quick Button */}
                <button
                  type="button"
                  onClick={onOpenAppointmentsList}
                  id="nav-my-appointments-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-700 bg-slate-100/80 hover:bg-sky-50 border border-slate-200 transition-colors cursor-pointer"
                  title="View My Scheduled Appointments"
                >
                  <CalendarCheck className="w-4 h-4 text-sky-600" />
                  <span>My Appointments</span>
                </button>

                {/* User Dropdown Pill */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    id="nav-user-profile-menu-btn"
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer text-left"
                    aria-label="User profile menu"
                  >
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt={displayName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {initials}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                      id="nav-user-dropdown"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </div>
                        {isAdmin ? (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Hospital Administrator</span>
                          </div>
                        ) : (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Patient</span>
                          </div>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavClick('profile');
                          }}
                          id="nav-user-dropdown-profile-btn"
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-sky-800 hover:bg-sky-50 flex items-center gap-2 cursor-pointer bg-sky-50/40"
                        >
                          <Activity className="w-4 h-4 text-sky-600" />
                          <span>Patient Health Profile & Summary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavClick('admin');
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-amber-950 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Hospital Admin Portal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenAppointmentsList();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4 text-sky-600" />
                          <span>My Scheduled Appointments</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenAppointmentModal();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-sky-600" />
                          <span>Book New Consultation</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          id="nav-logout-btn"
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                id="nav-signin-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-sky-600" />
                <span>Sign In / Register</span>
              </button>
            )}

            <button
              onClick={() => onOpenAppointmentModal()}
              id="nav-book-appointment-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-md shadow-sky-700/20 active:scale-98 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser ? (
              <button
                onClick={onOpenAppointmentsList}
                className="p-2 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                title="My Appointments"
                aria-label="My Appointments"
              >
                <CalendarCheck className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="p-2 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                title="Sign In"
                aria-label="Sign In"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onOpenAppointmentModal()}
              id="mobile-nav-book-btn"
              className="p-2 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
              title="Book Appointment"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* Mobile user status card */}
          {currentUser ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{displayName}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mb-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-sky-600" />
                <span>Sign In or Register</span>
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'text-sky-800 bg-sky-50 font-semibold border border-sky-100'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
                </button>
              );
            })}

            {currentUser && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAppointmentsList();
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-sky-600" />
                <span>My Appointments</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAppointmentModal();
              }}
              id="mobile-drawer-book-appointment"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Doctor Appointment</span>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>24/7 Emergency Line: </span>
            <a
              href={`tel:${HOSPITAL_INFO.phoneEmergency}`}
              className="text-rose-600 font-semibold hover:underline"
            >
              {HOSPITAL_INFO.phoneEmergency}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
