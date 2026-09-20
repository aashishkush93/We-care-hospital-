      import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Calendar,
  CalendarCheck,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  Download,
  Building2,
  Stethoscope,
  LogOut,
  ArrowLeft,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  FileText,
  Phone,
  Mail,
  User,
  Check,
} from 'lucide-react';
import { PageType, Doctor } from '../types';
import { DOCTORS, DEPARTMENTS, HOSPITAL_INFO } from '../data/hospitalData';
import {
  SavedAppointment,
  fetchAllAppointments,
  updateAppointmentStatus,
  deleteAppointmentRecord,
  saveAppointment,
  ADMIN_CONFIG,
} from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface AdminPageProps {
  onNavigate: (page: PageType) => void;
  onOpenAppointmentModal: (doctorId?: string, departmentId?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, isAdmin, loginWithEmailPass, loginAsAdminUser, logout } =
    useAuth();

  // Admin login form state
  const [adminEmailInput, setAdminEmailInput] = useState(ADMIN_CONFIG.email);
  const [adminPasswordInput, setAdminPasswordInput] = useState(ADMIN_CONFIG.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Portal tabs
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'departments'>(
    'appointments'
  );

  // Appointments data
  const [appointments, setAppointments] = useState<SavedAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  // Selected appointment for detail / edit modal
  const [selectedAppointment, setSelectedAppointment] = useState<SavedAppointment | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Walk-in booking modal state
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInPatientName, setWalkInPatientName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInDepartment, setWalkInDepartment] = useState('cardiology');
  const [walkInDoctor, setWalkInDoctor] = useState(DOCTORS[0]?.id || '');
  const [walkInTimeSlot, setWalkInTimeSlot] = useState('10:00 AM');
  const [walkInDate, setWalkInDate] = useState(new Date().toISOString().split('T')[0]);
  const [walkInNotes, setWalkInNotes] = useState('');
  const [isSavingWalkIn, setIsSavingWalkIn] = useState(false);

  // Doctor roster availability toggle state
  const [doctorRoster, setDoctorRoster] = useState<
    { id: string; name: string; status: 'available' | 'in-surgery' | 'on-leave'; fee: number }[]
  >(
    DOCTORS.map((d, index) => ({
      id: d.id,
      name: d.name,
      status: index === 1 ? 'in-surgery' : index === 4 ? 'on-leave' : 'available',
      fee: d.consultationFee,
    }))
  );

  // Load appointments when admin is authenticated
  const loadAppointmentsData = async () => {
    setIsLoadingAppointments(true);
    try {
      const data = await fetchAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching admin appointments:', err);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAppointmentsData();
    }
  }, [isAdmin]);

  // Handle Admin Login submission
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const emailTrim = adminEmailInput.trim().toLowerCase();
    if (emailTrim === ADMIN_CONFIG.email.toLowerCase() && adminPasswordInput === ADMIN_CONFIG.password) {
      loginAsAdminUser();
      setIsLoggingIn(false);
      return;
    }

    try {
      await loginWithEmailPass(adminEmailInput, adminPasswordInput);
    } catch (err: any) {
      console.error('Admin login error:', err);
      setLoginError('Invalid Administrator credentials. Please verify your email and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return appointments.filter((apt) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apt.patientName.toLowerCase().includes(q);
        const matchesRef = apt.bookingRef.toLowerCase().includes(q);
        const matchesEmail = apt.patientEmail.toLowerCase().includes(q);
        const matchesPhone = apt.patientPhone.includes(q);
        const matchesDoc = (apt.doctorName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesEmail && !matchesPhone && !matchesDoc) {
          return false;
        }
      }

      // Department
      if (departmentFilter !== 'all' && apt.departmentId !== departmentFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false;
      }

      // Date
      if (dateFilter === 'today' && apt.date !== todayStr) {
        return false;
      }
      if (dateFilter === 'upcoming' && apt.date < todayStr) {
        return false;
      }

      return true;
    });
  }, [appointments, searchQuery, departmentFilter, statusFilter, dateFilter]);

  // Appointment status counts
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = appointments.filter((a) => a.date === todayStr).length;

    return { total, confirmed, pending, completed, cancelled, todayCount };
  }, [appointments]);

  // Handle status change
  const handleStatusChange = async (
    apt: SavedAppointment,
    newStatus: SavedAppointment['status']
  ) => {
    setIsUpdatingStatus(true);
    try {
      await updateAppointmentStatus(apt.id || apt.bookingRef, newStatus);
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === apt.id || item.bookingRef === apt.bookingRef
            ? { ...item, status: newStatus }
            : item
        )
      );
      if (selectedAppointment && (selectedAppointment.id === apt.id || selectedAppointment.bookingRef === apt.bookingRef)) {
        setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.error('Error changing status:', e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle saving clinical notes
  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;
    setIsUpdatingStatus(true);
    try {
      await updateAppointmentStatus(
        selectedAppointment.id || selectedAppointment.bookingRef,
        selectedAppointment.status,
        adminNoteInput
      );
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedAppointment.id || item.bookingRef === selectedAppointment.bookingRef
            ? { ...item, adminNotes: adminNoteInput }
            : item
        )
      );
      setSelectedAppointment((prev) => (prev ? { ...prev, adminNotes: adminNoteInput } : null));
    } catch (e) {
      console.error('Error saving notes:', e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle delete
  const handleDeleteAppointment = async (apt: SavedAppointment) => {
    if (!window.confirm(`Are you sure you want to delete appointment ${apt.bookingRef} for ${apt.patientName}?`)) {
      return;
    }
    try {
      await deleteAppointmentRecord(apt.id || apt.bookingRef);
      setAppointments((prev) =>
        prev.filter((item) => item.id !== apt.id && item.bookingRef !== apt.bookingRef)
      );
      if (selectedAppointment && (selectedAppointment.id === apt.id || selectedAppointment.bookingRef === apt.bookingRef)) {
        setSelectedAppointment(null);
      }
    } catch (e) {
      console.error('Error deleting appointment:', e);
    }
  };

  // Handle Walk-In Booking
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInPatientName.trim() || !walkInPhone.trim()) {
      alert('Please provide patient name and phone number.');
      return;
    }
    setIsSavingWalkIn(true);

    const docObj = DOCTORS.find((d) => d.id === walkInDoctor);
    const deptObj = DEPARTMENTS.find((d) => d.id === walkInDepartment);
    const bookingRef = `WCH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newApt: Omit<SavedAppointment, 'id' | 'createdAt'> = {
      userId: `walkin-${Date.now()}`,
      patientName: walkInPatientName.trim(),
      patientPhone: walkInPhone.trim(),
      patientEmail: walkInEmail.trim() || 'walkin@wecarehospital.org',
      departmentId: walkInDepartment,
      departmentName: deptObj?.name || 'General Medicine',
      doctorId: walkInDoctor,
      doctorName: docObj?.name || 'On-Duty Physician',
      appointmentType: 'in-person',
      date: walkInDate,
      timeSlot: walkInTimeSlot,
      notes: walkInNotes.trim() || 'Walk-in OPD Consultation',
      bookingRef,
      status: 'confirmed',
    };

    try {
      const docId = await saveAppointment(newApt);
      const createdItem: SavedAppointment = {
        ...newApt,
        id: docId,
        createdAt: new Date().toISOString(),
      };
      setAppointments((prev) => [createdItem, ...prev]);
      setIsWalkInModalOpen(false);
      // Reset form
      setWalkInPatientName('');
      setWalkInPhone('');
      setWalkInEmail('');
      setWalkInNotes('');
    } catch (err) {
      console.error('Error saving walk in appointment:', err);
    } finally {
      setIsSavingWalkIn(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Booking Ref',
      'Patient Name',
      'Phone',
      'Email',
      'Department',
      'Doctor',
      'Date',
      'Time Slot',
      'Type',
      'Status',
      'Notes',
    ];
    const rows = filteredAppointments.map((a) => [
      a.bookingRef,
      `"${a.patientName}"`,
      `"${a.patientPhone}"`,
      a.patientEmail,
      `"${a.departmentName || a.departmentId}"`,
      `"${a.doctorName || ''}"`,
      a.date,
      a.timeSlot,
      a.appointmentType,
      a.status,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `we_care_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. If not logged in as Admin: Render Admin Access Gate
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 mb-3 border border-amber-400/30">
              <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
            </div>
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Hospital Admin Portal
          </h2>
          <p className="mt-1.5 text-center text-xs text-slate-400">
            Executive Clinical Administration & OPD Management
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800/90 border border-slate-700/80 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl backdrop-blur-xl">
            {/* Direct Admin Credential Notice */}
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                <Lock className="w-4 h-4" />
                <span>Authorized Administrative Personnel Only</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Sign in with the designated Hospital Administrator account to manage doctor schedules,
                patient bookings, and department workloads.
              </p>
              <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-mono">
                  aashish@gmail.com
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmailInput(ADMIN_CONFIG.email);
                    setAdminPasswordInput(ADMIN_CONFIG.password);
                    setLoginError(null);
                  }}
                  className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
                >
                  Fill Credentials
                </button>
              </div>
            </div>

            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator Email ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="aashish@gmail.com"
                    id="admin-login-email"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    id="admin-login-password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  id="admin-submit-login-btn"
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Verifying Security Token...' : 'Enter Admin Portal'}</span>
                </button>

                {/* Instant 1-click admin authorization button */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsAdminUser();
                  }}
                  id="admin-quick-authorize-btn"
                  className="w-full py-2.5 px-4 bg-slate-700/70 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs border border-amber-500/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Authorize as Aashish (aashish@gmail.com)</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Hospital Public Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin View: Full Clinical & Operational Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Executive Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold tracking-tight text-white">
                  Executive Clinical Administration
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 uppercase tracking-wider">
                  Admin Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as{' '}
                <strong className="text-slate-200">
                  {userProfile?.displayName || 'Aashish'}
                </strong>{' '}
                (<span className="text-amber-300 font-mono">aashish@gmail.com</span>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsWalkInModalOpen(true)}
              id="admin-walkin-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Walk-In Patient</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title="Return to Public Patient View"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Site</span>
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 transition-colors cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Bookings
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="mt-1 text-[11px] text-slate-500">All registered consultations</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Confirmed
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">{stats.confirmed}</div>
            <div className="mt-1 text-[11px] text-emerald-600">Ready for consultation</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Pending Review
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-700">{stats.pending}</div>
            <div className="mt-1 text-[11px] text-amber-600">Awaiting triage/slot</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
              Today's OPD
            </div>
            <div className="mt-2 text-2xl font-bold text-sky-700">{stats.todayCount}</div>
            <div className="mt-1 text-[11px] text-sky-600">Scheduled for today</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
              Completed
            </div>
            <div className="mt-2 text-2xl font-bold text-indigo-700">{stats.completed}</div>
            <div className="mt-1 text-[11px] text-indigo-600">Discharged / Seen</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Doctor Roster
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {doctorRoster.filter((d) => d.status === 'available').length}/{doctorRoster.length}
            </div>
            <div className="mt-1 text-[11px] text-teal-600">Active specialists on duty</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-2xl px-4 pt-2 shadow-2xs">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Appointments & Consultations ({appointments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'doctors'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Roster & Shifts ({DOCTORS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'departments'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Department Bed Capacity ({DEPARTMENTS.length})</span>
          </button>
        </div>

        {/* TAB 1: Appointments Management */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Patient Name, Phone, Email, Doctor, or Ref (WCH-...)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Date Filter */}
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    onClick={() => setDateFilter('all')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      dateFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDateFilter('today')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      dateFilter === 'today'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateFilter('upcoming')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      dateFilter === 'upcoming'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upcoming
                  </button>
                </div>

                {/* Actions */}
                <button
                  onClick={loadAppointmentsData}
                  className="p-2 text-slate-600 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Refresh Appointments"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoadingAppointments ? 'animate-spin' : ''}`}
                  />
                </button>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Table of Appointments */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Ref Code</th>
                      <th className="py-3.5 px-4">Patient Information</th>
                      <th className="py-3.5 px-4">Department & Doctor</th>
                      <th className="py-3.5 px-4">Schedule</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-700">No appointments found</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Try adjusting your search filters or click "+ New Walk-In Patient".
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => {
                        const statusColors = {
                          confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          pending: 'bg-amber-50 text-amber-700 border-amber-200',
                          completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                          rescheduled: 'bg-purple-50 text-purple-700 border-purple-200',
                          cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                        };

                        return (
                          <tr key={apt.id || apt.bookingRef} className="hover:bg-slate-50/70 transition-colors">
                            {/* Ref Code */}
                            <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                              {apt.bookingRef}
                            </td>

                            {/* Patient Info */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{apt.patientName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{apt.patientPhone}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[160px]">{apt.patientEmail}</span>
                              </div>
                            </td>

                            {/* Department & Doctor */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">
                                {apt.doctorName || 'Assigned Specialist'}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {apt.departmentName || apt.departmentId}
                              </div>
                            </td>

                            {/* Schedule */}
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-slate-900 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{apt.date}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{apt.timeSlot}</span>
                              </div>
                            </td>

                            {/* Appointment Type */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  apt.appointmentType === 'in-person'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-teal-50 text-teal-700'
                                }`}
                              >
                                {apt.appointmentType}
                              </span>
                            </td>

                            {/* Status Selector */}
                            <td className="py-3.5 px-4">
                              <select
                                value={apt.status}
                                onChange={(e) =>
                                  handleStatusChange(apt, e.target.value as SavedAppointment['status'])
                                }
                                className={`px-2 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${
                                  statusColors[apt.status] || 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setAdminNoteInput(apt.adminNotes || '');
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                  title="Clinical Notes & Details"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAppointment(apt)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Doctor Roster & Shift Status */}
        {activeTab === 'doctors' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Specialist Doctor OPD Shift Status
                </h3>
                <p className="text-xs text-slate-500">
                  Update active clinical availability, on-duty status, and consultation fees.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOCTORS.map((doc) => {
                const rosterInfo = doctorRoster.find((r) => r.id === doc.id);
                const currentStatus = rosterInfo?.status || 'available';

                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm truncate">{doc.name}</div>
                        <div className="text-xs text-sky-700 font-medium truncate">{doc.departmentName}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{doc.role}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Fee: </span>
                        <strong className="text-slate-800">${doc.consultationFee}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setDoctorRoster((prev) =>
                              prev.map((r) => (r.id === doc.id ? { ...r, status: 'available' } : r))
                            )
                          }
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            currentStatus === 'available'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          On Duty
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDoctorRoster((prev) =>
                              prev.map((r) => (r.id === doc.id ? { ...r, status: 'in-surgery' } : r))
                            )
                          }
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            currentStatus === 'in-surgery'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          In Surgery
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDoctorRoster((prev) =>
                              prev.map((r) => (r.id === doc.id ? { ...r, status: 'on-leave' } : r))
                            )
                          }
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            currentStatus === 'on-leave'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Department Capacities & Bed Occupancy */}
        {activeTab === 'departments' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-serif font-bold text-slate-900">
                Clinical Department Bed Occupancies & Triage
              </h3>
              <p className="text-xs text-slate-500">
                Monitor inpatient capacity, 24/7 emergency readiness, and OPD operational hours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DEPARTMENTS.map((dept, index) => {
                // Approximate realistic live occupancy
                const occupiedPct = [78, 85, 64, 72, 91, 58][index % 6];
                const occupiedBeds = Math.round((dept.bedCapacity * occupiedPct) / 100);

                return (
                  <div
                    key={dept.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                          {dept.name}
                        </span>
                        {dept.emergencyAvailable ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            24/7 ER Ready
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Elective OPD
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-slate-600">Bed Occupancy</span>
                          <span className="text-slate-900 font-bold">
                            {occupiedBeds} / {dept.bedCapacity} beds ({occupiedPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              occupiedPct > 85 ? 'bg-rose-500' : occupiedPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${occupiedPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 text-xs text-slate-600 space-y-1">
                        <div>
                          <strong>Head:</strong> {dept.headDoctor.name} ({dept.headDoctor.title})
                        </div>
                        <div>
                          <strong>OPD Hours:</strong> {dept.opdHours}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Total Beds: {dept.bedCapacity}</span>
                      <span className="text-emerald-700 font-semibold">
                        {dept.bedCapacity - occupiedBeds} Available
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Detail & Clinical Notes Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base">
                  Consultation #{selectedAppointment.bookingRef}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Patient</div>
                  <div className="font-bold text-slate-900">{selectedAppointment.patientName}</div>
                  <div className="text-slate-500 text-xs">{selectedAppointment.patientPhone}</div>
                  <div className="text-slate-500 text-xs">{selectedAppointment.patientEmail}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Doctor & Dept</div>
                  <div className="font-bold text-slate-900">
                    {selectedAppointment.doctorName || 'Assigned Specialist'}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {selectedAppointment.departmentName || selectedAppointment.departmentId}
                  </div>
                  <div className="text-slate-700 text-xs font-medium mt-1">
                    {selectedAppointment.date} at {selectedAppointment.timeSlot}
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Patient Symptoms & Request Notes:
                  </label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic">
                    "{selectedAppointment.notes}"
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Change Appointment Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['confirmed', 'pending', 'completed', 'rescheduled', 'cancelled'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(selectedAppointment, st)}
                        disabled={isUpdatingStatus}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                          selectedAppointment.status === st
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Admin Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator & Doctor Clinical Notes:
                </label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Enter medical assessment, triage notes, room assignment, or prescription follow-up instructions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isUpdatingStatus ? 'Saving...' : 'Save Clinical Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Walk-In Patient Booking Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base">New Walk-In Patient Registration</h3>
              </div>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="p-6 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkInPatientName}
                  onChange={(e) => setWalkInPatientName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={walkInDepartment}
                    onChange={(e) => {
                      setWalkInDepartment(e.target.value);
                      const firstDoc = DOCTORS.find((d) => d.departmentId === e.target.value);
                      if (firstDoc) setWalkInDoctor(firstDoc.id);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consulting Doctor
                  </label>
                  <select
                    value={walkInDoctor}
                    onChange={(e) => setWalkInDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {DOCTORS.filter(
                      (d) => !walkInDepartment || d.departmentId === walkInDepartment
                    ).map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} (${doc.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={walkInDate}
                    onChange={(e) => setWalkInDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={walkInTimeSlot}
                    onChange={(e) => setWalkInTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Symptoms / Intake Notes
                </label>
                <textarea
                  rows={2}
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  placeholder="Primary complaint, vitals, or triage level..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWalkIn}
                  className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSavingWalkIn ? 'Registering...' : 'Confirm Walk-In Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
