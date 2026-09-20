import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Activity,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Pill,
  Syringe,
  ClipboardCheck,
  Edit3,
  Plus,
  X,
  Printer,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Lock,
  ArrowRight,
  Stethoscope,
  Building2,
  SlidersHorizontal,
  CalendarCheck,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  PatientHealthProfile,
  PageType,
  AllergyItem,
  VitalsSummary,
  DiagnosticReport,
  PastMedicalProcedure,
} from '../types';
import {
  fetchPatientHealthProfile,
  savePatientHealthProfile,
  fetchUserAppointments,
  updateAppointmentStatus,
  SavedAppointment,
} from '../lib/firebase';

interface PatientProfilePageProps {
  onNavigate: (page: PageType) => void;
  onOpenAppointmentModal: (deptId?: string, docId?: string) => void;
}

type ProfileTab = 'summary' | 'appointments' | 'history' | 'immunizations' | 'reports';

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  onNavigate,
  onOpenAppointmentModal,
}) => {
  const {
    currentUser,
    userProfile,
    isGuestBrowsing,
    loginAsDemoPatient,
    openAuthModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>('summary');
  const [profile, setProfile] = useState<PatientHealthProfile | null>(null);
  const [appointments, setAppointments] = useState<SavedAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(false);
  const [copiedMRN, setCopiedMRN] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [viewingReport, setViewingReport] = useState<DiagnosticReport | null>(null);
  const [viewingAppointmentSlip, setViewingAppointmentSlip] = useState<SavedAppointment | null>(null);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<{
    bloodGroup: string;
    weightKg: number;
    heightCm: number;
    bloodPressure: string;
    heartRate: number;
    emergencyContactName: string;
    emergencyContactRel: string;
    emergencyContactPhone: string;
    insuranceProvider: string;
    insurancePolicy: string;
    organDonorStatus: boolean;
    allergies: AllergyItem[];
    notes: string;
  }>({
    bloodGroup: '',
    weightKg: 70,
    heightCm: 175,
    bloodPressure: '120/80',
    heartRate: 72,
    emergencyContactName: '',
    emergencyContactRel: '',
    emergencyContactPhone: '',
    insuranceProvider: '',
    insurancePolicy: '',
    organDonorStatus: true,
    allergies: [],
    notes: '',
  });

  const [newAllergen, setNewAllergen] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Life-threatening'>('Moderate');
  const [newReaction, setNewReaction] = useState('');

  // Load patient data
  const loadData = async () => {
    if (!currentUser || isGuestBrowsing) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const p = await fetchPatientHealthProfile(
        currentUser.uid,
        currentUser.displayName || userProfile?.displayName,
        currentUser.email
      );
      setProfile(p);

      // Populate edit form
      setEditForm({
        bloodGroup: p.bloodGroup,
        weightKg: p.vitals.weightKg,
        heightCm: p.vitals.heightCm,
        bloodPressure: p.vitals.bloodPressure,
        heartRate: p.vitals.heartRate,
        emergencyContactName: p.emergencyContact.name,
        emergencyContactRel: p.emergencyContact.relationship,
        emergencyContactPhone: p.emergencyContact.phone,
        insuranceProvider: p.insuranceInfo.provider,
        insurancePolicy: p.insuranceInfo.policyNumber,
        organDonorStatus: p.organDonorStatus,
        allergies: [...p.allergies],
        notes: p.notes || '',
      });
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!currentUser || isGuestBrowsing) return;
    setAppointmentsLoading(true);
    try {
      const list = await fetchUserAppointments(currentUser.uid);
      setAppointments(list);
    } catch (e) {
      console.error('Error fetching appointments:', e);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAppointments();
  }, [currentUser]);

  const handleCopyMRN = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.mrn);
    setCopiedMRN(true);
    setTimeout(() => setCopiedMRN(false), 2000);
  };

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Add allergen in edit modal
  const handleAddAllergen = () => {
    if (!newAllergen.trim()) return;
    const item: AllergyItem = {
      id: `alg-${Date.now()}`,
      allergen: newAllergen.trim(),
      severity: newSeverity,
      reaction: newReaction.trim() || 'Sensitivity reaction',
    };
    setEditForm((prev) => ({
      ...prev,
      allergies: [...prev.allergies, item],
    }));
    setNewAllergen('');
    setNewReaction('');
  };

  const handleRemoveAllergen = (id: string) => {
    setEditForm((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a.id !== id),
    }));
  };

  // Save profile modifications
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentUser) return;

    // Calculate BMI
    const heightM = editForm.heightCm / 100;
    const calcBmi = Number((editForm.weightKg / (heightM * heightM)).toFixed(1));

    const updated: PatientHealthProfile = {
      ...profile,
      bloodGroup: editForm.bloodGroup,
      organDonorStatus: editForm.organDonorStatus,
      notes: editForm.notes,
      allergies: editForm.allergies,
      emergencyContact: {
        name: editForm.emergencyContactName,
        relationship: editForm.emergencyContactRel,
        phone: editForm.emergencyContactPhone,
      },
      insuranceInfo: {
        ...profile.insuranceInfo,
        provider: editForm.insuranceProvider,
        policyNumber: editForm.insurancePolicy,
      },
      vitals: {
        ...profile.vitals,
        weightKg: editForm.weightKg,
        heightCm: editForm.heightCm,
        bmi: calcBmi,
        bloodPressure: editForm.bloodPressure,
        heartRate: editForm.heartRate,
        lastRecordedDate: 'Updated Today',
      },
    };

    try {
      await savePatientHealthProfile(currentUser.uid, updated);
      setProfile(updated);
      setIsEditModalOpen(false);
      setActionSuccessMessage('Health summary updated successfully.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  // Cancel appointment
  const handleConfirmCancelAppointment = async (apt: SavedAppointment) => {
    try {
      await updateAppointmentStatus(apt.id || apt.bookingRef, 'cancelled', 'Cancelled by patient through Patient Portal');
      setAppointments((prev) =>
        prev.map((item) =>
          item.bookingRef === apt.bookingRef ? { ...item, status: 'cancelled' } : item
        )
      );
      setCancellingAppointmentId(null);
      setActionSuccessMessage(`Appointment #${apt.bookingRef} was successfully cancelled.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const handlePrintSummary = () => {
    window.print();
  };

  // -------------------------------------------------------------
  // RENDER: Unauthenticated or Guest View (Secure Access Gate)
  // -------------------------------------------------------------
  if (!currentUser || isGuestBrowsing) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-slate-50 via-white to-sky-50/40 py-16 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden text-center p-8 sm:p-10">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-8 h-8 text-sky-600" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted HIPAA-Compliant Patient Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif tracking-tight mb-3">
            Secure Patient Health Record
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
            Please sign in to access your electronic health summary, vital signs tracking, outpatient appointments, and verified laboratory test records.
          </p>

          <div className="space-y-3 max-w-sm mx-auto mb-8">
            <button
              onClick={openAuthModal}
              id="patient-portal-signin-btn"
              className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In to Patient Portal</span>
            </button>

            <button
              onClick={loginAsDemoPatient}
              id="patient-portal-demo-btn"
              className="w-full py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Explore as Demo Patient (John Doe)</span>
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 text-left border-t border-slate-100 pt-6">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Health Summary</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Live blood pressure, heart rate, BMI, allergies & prescriptions.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs mb-1">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Appointments</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Book, reschedule, and download verified OPD consultation passes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Retrieving encrypted medical record...</p>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'rescheduled' || a.status === 'pending'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Action success toast alert */}
        {actionSuccessMessage && (
          <div
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-sm shadow-xs animate-in fade-in"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* -------------------------------------------------------------
            Patient Banner Header
        ------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Info: Avatar + Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md border-2 border-white">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'P'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Verified Active Patient">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                    {currentUser.displayName || userProfile?.displayName || 'Patient Record'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
                    Active Patient
                  </span>
                  {profile.organDonorStatus && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      <span>Organ Donor</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-500">
                  <span className="text-slate-700 font-medium">
                    MRN: <strong className="font-mono text-slate-900">{profile.mrn}</strong>
                  </span>
                  <button
                    onClick={handleCopyMRN}
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 transition-colors font-medium cursor-pointer"
                    title="Copy MRN"
                  >
                    {copiedMRN ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMRN ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <span>DOB: {profile.dateOfBirth}</span>
                  <span className="text-slate-300">•</span>
                  <span>Blood: <strong className="text-slate-900">{profile.bloodGroup}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>{currentUser.email}</span>
                </div>

                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                  <span>Primary Care: <strong>{profile.primaryCarePhysician.name}</strong> ({profile.primaryCarePhysician.clinic})</span>
                </p>
              </div>
            </div>

            {/* Right Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenAppointmentModal()}
                id="patient-book-consult-btn"
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={() => setIsEditModalOpen(true)}
                id="patient-edit-summary-btn"
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={handlePrintSummary}
                id="patient-print-summary-btn"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                title="Print Health Record Summary"
                aria-label="Print Health Record Summary"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Critical Allergy Alert Bar if any */}
          {profile.allergies.length > 0 && (
            <div className="mt-6 p-3 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                    Clinical Allergies & Sensitivities Recorded ({profile.allergies.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {profile.allergies.map((alg) => (
                      <span
                        key={alg.id}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          alg.severity === 'Severe' || alg.severity === 'Life-threatening'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {alg.allergen} ({alg.severity})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline self-start sm:self-auto cursor-pointer"
              >
                Update Allergies
              </button>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------
            Navigation Tabs
        ------------------------------------------------------------- */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setActiveTab('summary')}
            id="tab-health-summary"
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Health Summary & Vitals</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            id="tab-appointments"
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments</span>
            {upcomingAppointments.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'appointments'
                    ? 'bg-white text-sky-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {upcomingAppointments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            id="tab-history"
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Past Medical History ({profile.pastProcedures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('immunizations')}
            id="tab-immunizations"
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'immunizations'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Syringe className="w-4 h-4" />
            <span>Immunizations ({profile.immunizations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            id="tab-reports"
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lab & Diagnostics ({profile.diagnosticReports.length})</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: HEALTH SUMMARY & VITALS
        ------------------------------------------------------------- */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            
            {/* Vitals Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <h2 className="text-base font-bold text-slate-900">Current Vital Signs</h2>
                </div>
                <span className="text-xs text-slate-500">
                  Last recorded: {profile.vitals.lastRecordedDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Blood Pressure */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">Blood Pressure</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900">
                    {profile.vitals.bloodPressure}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                    <Check className="w-3 h-3" />
                    <span>Normal Range</span>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">Pulse Rate</span>
                    <Activity className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900">
                    {profile.vitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                    <Check className="w-3 h-3" />
                    <span>Normal Sinus</span>
                  </div>
                </div>

                {/* SpO2 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">Oxygen (SpO2)</span>
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900">
                    {profile.vitals.spO2}%
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                    <Check className="w-3 h-3" />
                    <span>Optimal</span>
                  </div>
                </div>

                {/* Blood Glucose */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">Blood Sugar</span>
                    <Pill className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900">
                    {profile.vitals.bloodGlucose}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                    <Check className="w-3 h-3" />
                    <span>Fasting Euglycemic</span>
                  </div>
                </div>

                {/* Body Mass Index */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">BMI</span>
                    <SlidersHorizontal className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900">
                    {profile.vitals.bmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mt-1">
                    {profile.vitals.weightKg} kg / {profile.vitals.heightCm} cm
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">Temp / Resp</span>
                    <Activity className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {profile.vitals.temperature}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {profile.vitals.respiratoryRate} breaths/min
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Section: Active Prescriptions & Chronic Conditions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Active Prescriptions */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Active Prescriptions</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {profile.medications.length} Medications
                  </span>
                </div>

                <div className="space-y-3">
                  {profile.medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900">{med.name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold">
                              {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong>Frequency:</strong> {med.frequency}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            <strong>Indication:</strong> {med.purpose}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {med.refillsRemaining} Refills Left
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">By {med.prescribedBy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions & Ongoing Care Plans */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Chronic Conditions & Care Plans</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {profile.chronicConditions.length} Diagnoses
                  </span>
                </div>

                <div className="space-y-3">
                  {profile.chronicConditions.map((cond) => (
                    <div
                      key={cond.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900">{cond.condition}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Diagnosed: {cond.diagnosedDate} • Physician: <strong>{cond.managingPhysician}</strong>
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            cond.status === 'Controlled'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {cond.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Notes / Lifestyle guidance */}
                  {profile.notes && (
                    <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/60 text-xs text-sky-900 mt-4">
                      <strong className="font-semibold block mb-1">Clinical Lifestyle & Adherence Note:</strong>
                      {profile.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row: Emergency Contacts & Health Insurance Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Emergency Contact */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Emergency Contact</h3>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{profile.emergencyContact.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Relationship: <strong className="text-slate-800">{profile.emergencyContact.relationship}</strong>
                    </p>
                    <p className="text-xs font-mono font-medium text-slate-800 mt-1">
                      {profile.emergencyContact.phone}
                    </p>
                  </div>
                  <a
                    href={`tel:${profile.emergencyContact.phone}`}
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    title="Call Emergency Contact"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Verified Insurance Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Verified Health Insurance</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    Active Coverage
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold tracking-wide uppercase text-sky-300">
                      {profile.insuranceInfo.provider}
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                      Exp: {profile.insuranceInfo.validUntil}
                    </span>
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold tracking-wider mb-2">
                    {profile.insuranceInfo.policyNumber}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Group ID: <strong className="text-white font-mono">{profile.insuranceInfo.groupNumber}</strong></span>
                    <span>Patient: <strong className="text-white">{currentUser.displayName || 'John Doe'}</strong></span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: APPOINTMENTS (UPCOMING & PAST)
        ------------------------------------------------------------- */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">Clinical Appointments Roster</h2>
                <p className="text-xs text-slate-500">
                  Manage confirmed consultations, telehealth sessions, and follow-up examinations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadAppointments}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  title="Refresh Appointments"
                >
                  <RefreshCw className={`w-4 h-4 ${appointmentsLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => onOpenAppointmentModal()}
                  id="patient-new-booking-btn"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Upcoming & Scheduled Visits ({upcomingAppointments.length})</span>
              </h3>

              {upcomingAppointments.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">No Upcoming Appointments</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    You have no scheduled clinical visits at this time. Book a routine check-up or specialist consultation.
                  </p>
                  <button
                    onClick={() => onOpenAppointmentModal()}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Schedule Consultation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.bookingRef}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Date + Status */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{apt.date}</span>
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : apt.status === 'rescheduled'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        </div>

                        {/* Time & Doctor */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-bold">
                            <Clock className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {apt.timeSlot}
                            </div>
                            <div className="text-xs font-semibold text-slate-700">
                              {apt.doctorName || 'Assigned Specialist'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {apt.departmentName || 'Outpatient Clinic'}
                            </div>
                          </div>
                        </div>

                        {/* Booking Ref + Type */}
                        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Ref:</span>
                            <span className="font-mono font-bold text-slate-800">{apt.bookingRef}</span>
                            <button
                              onClick={() => handleCopyRef(apt.bookingRef)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy Reference"
                            >
                              {copiedRef === apt.bookingRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <span className="text-slate-600 font-medium">
                            {apt.appointmentType === 'telehealth' ? '🎥 Telehealth' : '🏥 In-Person OPD'}
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 italic">
                            "{apt.notes}"
                          </p>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                        <button
                          onClick={() => setViewingAppointmentSlip(apt)}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View OPD Slip</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCancellingAppointmentId(apt.bookingRef)}
                            className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Completed / Cancelled Appointments */}
            {pastAppointments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
                  Past Consultation History ({pastAppointments.length})
                </h3>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {pastAppointments.map((apt) => (
                      <div key={apt.bookingRef} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <CalendarCheck className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900">{apt.doctorName || 'Specialist'}</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  apt.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {apt.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {apt.departmentName} • {apt.date} at {apt.timeSlot}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-500">{apt.bookingRef}</span>
                          <button
                            onClick={() => setViewingAppointmentSlip(apt)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: PAST MEDICAL HISTORY & PROCEDURES
        ------------------------------------------------------------- */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">Surgical & Clinical History</h2>
                <p className="text-xs text-slate-500">
                  Chronological record of verified hospital procedures, operative notes, and outcomes
                </p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-sky-100 space-y-6">
              {profile.pastProcedures.map((proc, idx) => (
                <div key={proc.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-sky-600"></div>

                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-base text-slate-900">{proc.procedureName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {proc.outcome}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 self-start sm:self-auto">
                        {proc.date}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mb-3 space-y-1">
                      <p>
                        <strong>Surgical Facility:</strong> {proc.hospital}
                      </p>
                      <p>
                        <strong>Lead Surgeon / Specialist:</strong> {proc.surgeon}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block mb-1">Operative & Recovery Summary:</strong>
                      {proc.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: IMMUNIZATIONS & VACCINES
        ------------------------------------------------------------- */}
        {activeTab === 'immunizations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">Official Immunization Registry</h2>
                <p className="text-xs text-slate-500">
                  Documented vaccine administrations, lot numbers, and authorized clinic locations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.immunizations.map((imm) => (
                <div
                  key={imm.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 hover:border-sky-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <Syringe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{imm.vaccineName}</h4>
                        <p className="text-xs text-slate-500">Administered: {imm.administeredDate}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {imm.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Lot / Batch No.</span>
                      <strong className="font-mono text-slate-800">{imm.batchNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Clinic Location</span>
                      <strong className="text-slate-800">{imm.clinic}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: DIAGNOSTIC LAB REPORTS & SCANS
        ------------------------------------------------------------- */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">Diagnostic Lab & Radiology Reports</h2>
                <p className="text-xs text-slate-500">
                  Official diagnostic findings signed off by WeCare pathology and imaging specialists
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {profile.diagnosticReports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">{rep.testName}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                            {rep.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Conducted on {rep.date} • Signed by <strong>{rep.reportingDoctor}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          rep.resultStatus === 'Normal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {rep.resultStatus}
                      </span>

                      <button
                        onClick={() => setViewingReport(rep)}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-sky-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report Sheet</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 mb-3">
                    {rep.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {rep.findings.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 font-mono">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          MODAL: EDIT HEALTH PROFILE
      ------------------------------------------------------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 font-serif">Edit Personal Health Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5">
              
              {/* Vitals / Physical Stats */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Physical Characteristics & Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="O+ (Positive)">O+ (Positive)</option>
                      <option value="O- (Negative)">O- (Negative)</option>
                      <option value="A+ (Positive)">A+ (Positive)</option>
                      <option value="A- (Negative)">A- (Negative)</option>
                      <option value="B+ (Positive)">B+ (Positive)</option>
                      <option value="B- (Negative)">B- (Negative)</option>
                      <option value="AB+ (Positive)">AB+ (Positive)</option>
                      <option value="AB- (Negative)">AB- (Negative)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editForm.weightKg}
                      onChange={(e) => setEditForm({ ...editForm, weightKg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={editForm.heightCm}
                      onChange={(e) => setEditForm({ ...editForm, heightCm: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={editForm.bloodPressure}
                      onChange={(e) => setEditForm({ ...editForm, bloodPressure: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Emergency Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Contact Full Name</label>
                    <input
                      type="text"
                      value={editForm.emergencyContactName}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={editForm.emergencyContactRel}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContactRel: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      value={editForm.emergencyContactPhone}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Details */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Health Insurance Policy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Insurance Carrier</label>
                    <input
                      type="text"
                      value={editForm.insuranceProvider}
                      onChange={(e) => setEditForm({ ...editForm, insuranceProvider: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Policy / Member ID</label>
                    <input
                      type="text"
                      value={editForm.insurancePolicy}
                      onChange={(e) => setEditForm({ ...editForm, insurancePolicy: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Allergies Management */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Allergies & Sensitivities
                </h4>
                <div className="space-y-2 mb-3">
                  {editForm.allergies.map((alg) => (
                    <div
                      key={alg.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div>
                        <strong>{alg.allergen}</strong> ({alg.severity}) — <span className="text-slate-500">{alg.reaction}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(alg.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Allergen (e.g. Iodine)"
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <select
                    value={newSeverity}
                    onChange={(e: any) => setNewSeverity(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Life-threatening">Life-threatening</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reaction"
                      value={newReaction}
                      onChange={(e) => setNewReaction(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAllergen}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Organ Donor & Notes */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.organDonorStatus}
                    onChange={(e) => setEditForm({ ...editForm, organDonorStatus: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Registered Organ & Tissue Donor
                  </span>
                </label>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Special Health or Dietary Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Health Summary
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: VIEW DIAGNOSTIC REPORT SHEET
      ------------------------------------------------------------- */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            
            {/* Report Header */}
            <div className="bg-slate-900 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>WeCare Diagnostic Center & Pathology Lab</span>
                </div>
                <button
                  onClick={() => setViewingReport(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold font-serif">{viewingReport.testName}</h3>
              <p className="text-xs text-slate-300 mt-1">
                Category: {viewingReport.category} • Date: {viewingReport.date}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Patient Name</span>
                  <strong className="text-slate-900">{currentUser.displayName || 'John Doe'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">MRN ID</span>
                  <strong className="font-mono text-slate-900">{profile.mrn}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reporting Physician</span>
                  <strong className="text-slate-900">{viewingReport.reportingDoctor}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Clinical Impression</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {viewingReport.resultStatus}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Detailed Findings
                </h4>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 text-xs font-mono space-y-2">
                  {viewingReport.findings.map((f, i) => (
                    <div key={i} className="pt-2 first:pt-0 flex items-center justify-between">
                      <span className="text-slate-800">{f}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Physician Interpretation
                </h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {viewingReport.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Electronic Verification Hash: #WCH-DX-{viewingReport.id}</span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: APPOINTMENT PASS & CONFIRMATION SLIP
      ------------------------------------------------------------- */}
      {viewingAppointmentSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            
            <div className="bg-gradient-to-r from-sky-600 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-sky-200">
                  WeCare Hospital Outpatient Pass
                </span>
                <h3 className="text-lg font-bold font-serif mt-0.5">Clinical Appointment Slip</h3>
              </div>
              <button
                onClick={() => setViewingAppointmentSlip(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-3 border-b border-dashed border-slate-200">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Booking Reference Number</span>
                <div className="text-2xl font-mono font-bold text-slate-900 tracking-wider mt-1">
                  {viewingAppointmentSlip.bookingRef}
                </div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {viewingAppointmentSlip.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Patient:</span>
                  <strong className="text-slate-900">{viewingAppointmentSlip.patientName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Date & Time:</span>
                  <strong className="text-slate-900">{viewingAppointmentSlip.date} at {viewingAppointmentSlip.timeSlot}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Department:</span>
                  <strong className="text-slate-900">{viewingAppointmentSlip.departmentName || 'Specialist Clinic'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Consultant:</span>
                  <strong className="text-slate-900">{viewingAppointmentSlip.doctorName || 'Attending Physician'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Consultation Format:</span>
                  <strong className="text-slate-900">
                    {viewingAppointmentSlip.appointmentType === 'telehealth' ? 'Virtual Video Call' : 'In-Person OPD Clinic'}
                  </strong>
                </div>
              </div>

              {/* QR Code Graphic Placeholder */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-center">
                <div className="font-mono text-[11px] text-slate-500">
                  [ HOSPITAL OPD CHECK-IN BARCODE ]
                  <br />
                  <span className="font-bold text-slate-700">{viewingAppointmentSlip.bookingRef}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Please present this slip or your MRN at the reception desk 15 minutes prior to your scheduled consultation slot.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CANCEL APPOINTMENT CONFIRMATION
      ------------------------------------------------------------- */}
      {cancellingAppointmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-1 font-serif">Cancel Appointment?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to cancel appointment <strong>#{cancellingAppointmentId}</strong>? This slot will be released for other outpatient patients.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCancellingAppointmentId(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Keep Booking
              </button>

              <button
                onClick={() => {
                  const target = appointments.find((a) => a.bookingRef === cancellingAppointmentId);
                  if (target) handleConfirmCancelAppointment(target);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
