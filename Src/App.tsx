import React, { useState } from 'react';
import { PageType, Doctor, Department } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DepartmentPage } from './pages/DepartmentPage';
import { DoctorPage } from './pages/DoctorPage';
import { AdminPage } from './pages/AdminPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { AppointmentModal } from './components/AppointmentModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { DepartmentDetailModal } from './components/DepartmentDetailModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthGate } from './components/AuthGate';
import { AuthModal } from './components/AuthModal';
import { MyAppointmentsModal } from './components/MyAppointmentsModal';
import { HeartPulse, LogIn, ShieldAlert } from 'lucide-react';

function HospitalApp() {
  const { currentUser, isGuestBrowsing, loading, openAuthModal } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  // Modals state
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [appointmentDocId, setAppointmentDocId] = useState<string | undefined>(undefined);
  const [appointmentDeptId, setAppointmentDeptId] = useState<string | undefined>(undefined);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDoctorDetailOpen, setIsDoctorDetailOpen] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isDepartmentDetailOpen, setIsDepartmentDetailOpen] = useState(false);

  const [isAppointmentsListOpen, setIsAppointmentsListOpen] = useState(false);

  const handleOpenAppointmentModal = (doctorId?: string, departmentId?: string) => {
    setAppointmentDocId(doctorId);
    setAppointmentDeptId(departmentId);
    setIsAppointmentOpen(true);
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDoctorDetailOpen(true);
  };

  const handleSelectDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsDepartmentDetailOpen(true);
  };

  // 1. Initial Authentication Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-sky-600/20 animate-pulse mb-4">
          <HeartPulse className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
          We Care Hospital
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Verifying secure patient session...
        </p>
      </div>
    );
  }

  // 2. Gate: Authenticate Before Entering the Site
  if (!currentUser && !isGuestBrowsing) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900 font-sans antialiased">
      {/* Optional Guest Mode Notification Pill Strip */}
      {isGuestBrowsing && !currentUser && (
        <aside
          aria-label="Guest browsing banner"
          className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>
                <strong>Browsing in Guest Mode:</strong> Sign in with Google or Email to link your
                prescriptions, lab tests, and appointment history securely.
              </span>
            </div>
            <button
              onClick={openAuthModal}
              id="guest-banner-signin-btn"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In Now</span>
            </button>
          </div>
        </aside>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenAppointmentModal={handleOpenAppointmentModal}
        onOpenAppointmentsList={() => setIsAppointmentsListOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={setCurrentPage}
            onOpenAppointmentModal={handleOpenAppointmentModal}
            onSelectDoctor={handleSelectDoctor}
            onSelectDepartment={handleSelectDepartment}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={setCurrentPage}
            onOpenAppointmentModal={() => handleOpenAppointmentModal()}
          />
        )}

        {currentPage === 'department' && (
          <DepartmentPage
            onSelectDepartment={handleSelectDepartment}
            onOpenAppointmentModal={handleOpenAppointmentModal}
            onSelectDoctor={handleSelectDoctor}
          />
        )}

        {currentPage === 'doctor' && (
          <DoctorPage
            onSelectDoctor={handleSelectDoctor}
            onOpenAppointmentModal={handleOpenAppointmentModal}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage
            onNavigate={setCurrentPage}
            onOpenAppointmentModal={handleOpenAppointmentModal}
          />
        )}

        {currentPage === 'profile' && (
          <PatientProfilePage
            onNavigate={setCurrentPage}
            onOpenAppointmentModal={handleOpenAppointmentModal}
          />
        )}
      </main>

      {/* Global Footer (Hidden on Admin Portal) */}
      {currentPage !== 'admin' && (
        <Footer
          onNavigate={setCurrentPage}
          onOpenAppointmentModal={handleOpenAppointmentModal}
          onSelectDepartment={(deptId) => {
            setCurrentPage('department');
          }}
        />
      )}

      {/* Authentication Modal (For Guest or Triggered Sign In) */}
      <AuthModal />

      {/* Patient Appointments Overview Modal */}
      <MyAppointmentsModal
        isOpen={isAppointmentsListOpen}
        onClose={() => setIsAppointmentsListOpen(false)}
        onBookNew={() => {
          setIsAppointmentsListOpen(false);
          handleOpenAppointmentModal();
        }}
      />

      {/* Appointment Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        initialDoctorId={appointmentDocId}
        initialDepartmentId={appointmentDeptId}
      />

      {/* Doctor Detail Modal */}
      <DoctorDetailModal
        doctor={selectedDoctor}
        isOpen={isDoctorDetailOpen}
        onClose={() => setIsDoctorDetailOpen(false)}
        onBookAppointment={(docId, deptId) => {
          handleOpenAppointmentModal(docId, deptId);
        }}
      />

      {/* Department Detail Modal */}
      <DepartmentDetailModal
        department={selectedDepartment}
        isOpen={isDepartmentDetailOpen}
        onClose={() => setIsDepartmentDetailOpen(false)}
        onBookAppointment={(docId, deptId) => {
          handleOpenAppointmentModal(docId, deptId);
        }}
        onSelectDoctor={(doc) => {
          handleSelectDoctor(doc);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HospitalApp />
    </AuthProvider>
  );
    }
      
