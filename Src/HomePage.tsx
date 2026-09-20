import React, { useState } from 'react';
import {
  Calendar,
  Phone,
  ShieldAlert,
  ArrowRight,
  HeartPulse,
  Brain,
  Activity,
  Baby,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  Stethoscope,
  Users,
  Award,
  Sparkles,
  Building2,
  FileCheck,
} from 'lucide-react';
import { PageType, Department, Doctor } from '../types';
import {
  HOSPITAL_INFO,
  HOSPITAL_STATS,
  DEPARTMENTS,
  DOCTORS,
  TESTIMONIALS,
  HOSPITAL_FACILITIES,
} from '../data/hospitalData';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
  onOpenAppointmentModal: (doctorId?: string, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectDepartment: (dept: Department) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAppointmentModal,
  onSelectDoctor,
  onSelectDepartment,
}) => {
  // Inline quick appointment state
  const [quickDept, setQuickDept] = useState(DEPARTMENTS[0].id);
  const [quickDate, setQuickDate] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickPhone) return;
    setQuickSubmitted(true);
  };

  const getDeptIcon = (name: string) => {
    switch (name) {
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6 text-sky-600" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-indigo-600" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-amber-600" />;
      case 'Baby':
        return <Baby className="w-6 h-6 text-rose-500" />;
      default:
        return <Stethoscope className="w-6 h-6 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16 bg-[#FAFCFE]">
      {/* 1. CLEAN HOSPITAL HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-[#FAFCFE] pt-10 pb-16 lg:py-20 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 text-sky-800 text-xs font-semibold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>JCI Gold Seal Certified • Level 1 Trauma & Multi-Specialty Hospital</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-serif leading-[1.18]">
                Compassionate Care. <br />
                <span className="text-sky-700">World-Class Medicine.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                At <span className="font-semibold text-slate-900">We Care Hospital</span>, our
                board-certified specialists, 24/7 acute trauma surgeons, and compassionate bedside
                nurses are dedicated to providing state-of-the-art care for you and your loved ones.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenAppointmentModal()}
                  id="hero-book-appointment-btn"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-base text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/25 active:scale-98 transition-all cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book an Appointment</span>
                </button>

                <button
                  onClick={() => onNavigate('doctor')}
                  id="hero-find-doctor-btn"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-base text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs hover:border-slate-400 transition-all cursor-pointer"
                >
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  <span>Find a Specialist</span>
                </button>
              </div>

              {/* Emergency Hotline Bar */}
              <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">24/7 Immediate Trauma Hotline: </span>
                <a
                  href={`tel:${HOSPITAL_INFO.phoneEmergency}`}
                  className="font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{HOSPITAL_INFO.phoneEmergency}</span>
                </a>
              </div>
            </div>

            {/* Right Visual Image & Hospital Credential Card */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                    alt="We Care Hospital Modern Medical Building"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent rounded-3xl" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-100 flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold font-serif">
                      180+
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Board-Certified</div>
                      <div className="text-[11px] text-slate-500">Medical Specialists</div>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Level 1 Emergency Care</div>
                          <div className="text-[11px] text-slate-500">
                            Immediate Triage & Helipad Transfer
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Always Open
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR CLINICAL QUICK-ACCESS TILES (Clean Hospital Standard) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onOpenAppointmentModal()}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-serif">Request an Appointment</h3>
            <p className="text-xs text-slate-500 mt-1">Schedule an in-person or telehealth visit.</p>
            <span className="text-xs font-semibold text-sky-600 group-hover:text-sky-700 inline-flex items-center gap-1 mt-3">
              <span>Book Online</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => onNavigate('doctor')}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-serif">Find a Doctor</h3>
            <p className="text-xs text-slate-500 mt-1">Search by specialty, condition, or name.</p>
            <span className="text-xs font-semibold text-teal-700 group-hover:text-teal-800 inline-flex items-center gap-1 mt-3">
              <span>Browse Doctors</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => onNavigate('department')}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-serif">Clinical Departments</h3>
            <p className="text-xs text-slate-500 mt-1">Cardiology, Neurology, Oncology & more.</p>
            <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 inline-flex items-center gap-1 mt-3">
              <span>View Specialties</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <a
            href={`tel:${HOSPITAL_INFO.phoneEmergency}`}
            className="p-5 bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-200/90 shadow-xs hover:shadow-md hover:border-rose-300 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-serif">24/7 Emergency Care</h3>
            <p className="text-xs text-slate-600 mt-1">Immediate resuscitation & trauma care.</p>
            <span className="text-xs font-bold text-rose-600 inline-flex items-center gap-1 mt-3">
              <span>Call: {HOSPITAL_INFO.phoneEmergency}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>
        </div>
      </section>

      {/* 3. HOSPITAL STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {HOSPITAL_STATS.map((stat, i) => (
              <div
                key={i}
                className={`text-center ${i > 0 && i % 2 === 0 ? 'pt-4 md:pt-0' : ''} ${
                  i > 0 ? 'md:px-4' : ''
                }`}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-sky-700 font-serif">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLINICAL DEPARTMENTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Centers of Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif mt-2">
              Clinical Departments
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Equipped with specialized surgical suites, dedicated ICU beds, and world-renowned
              department leaders.
            </p>
          </div>

          <button
            onClick={() => onNavigate('department')}
            id="view-all-departments-btn"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer group shrink-0"
          >
            <span>Explore All 8 Departments</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.slice(0, 6).map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                    {getDeptIcon(dept.iconName)}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {dept.bedCapacity} Beds
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.tagline}</p>
                </div>

                {/* Key procedures */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Key Procedures
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {dept.keyServices.slice(0, 3).map((srv, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectDepartment(dept)}
                  className="text-xs font-semibold text-slate-700 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Clinical Info
                </button>
                <button
                  onClick={() => onOpenAppointmentModal(undefined, dept.id)}
                  className="text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Schedule Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TOP SPECIALISTS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Medical Faculty
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif mt-2">
              Distinguished Physicians & Surgeons
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Meet our department directors and senior consultants committed to compassionate,
              evidence-based clinical care.
            </p>
          </div>

          <button
            onClick={() => onNavigate('doctor')}
            id="view-all-doctors-btn"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer group shrink-0"
          >
            <span>View All Doctors & Schedule</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOCTORS.slice(0, 4).map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col group"
            >
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <img
                  src={doctor.avatarUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 shadow-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating}</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[11px] font-medium text-white">
                  {doctor.departmentName.split('&')[0]}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">{doctor.name}</h3>
                  <p className="text-xs text-sky-700 font-medium">{doctor.role}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {doctor.qualifications}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Experience:</span>
                    <span className="font-semibold text-slate-900">
                      {doctor.experienceYears}+ Years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consultation:</span>
                    <span className="font-bold text-sky-700 font-serif">
                      ${doctor.consultationFee}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectDoctor(doctor)}
                    className="w-full text-xs font-semibold py-2 px-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => onOpenAppointmentModal(doctor.id, doctor.departmentId)}
                    className="w-full text-xs font-semibold py-2 px-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INLINE QUICK CONSULTATION SCHEDULER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1E36] text-white rounded-3xl p-8 lg:p-12 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
                Direct OPD Booking
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                Schedule Your Medical Visit
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect with our clinical specialists for an outpatient consultation or telehealth
                call. Transparent pricing, zero booking fees, and timely confirmations.
              </p>

              <div className="space-y-3 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Verified appointment confirmation within 15 minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>In-person clinic visit or secure HIPAA video consultation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Complimentary review consultation within 7 days</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenAppointmentModal()}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                >
                  Open Full Appointment Wizard
                </button>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-6">
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl">
                {quickSubmitted ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Consultation Request Received</h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Thank you, <span className="font-semibold">{quickName}</span>. Our outpatient
                      coordination desk will call{' '}
                      <span className="font-semibold">{quickPhone}</span> to confirm your time.
                    </p>
                    <button
                      onClick={() => setQuickSubmitted(false)}
                      className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                    >
                      Schedule another appointment
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuickSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold font-serif text-slate-900">
                      Quick Consultation Request
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Select Department
                      </label>
                      <select
                        value={quickDept}
                        onChange={(e) => setQuickDept(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-sky-500"
                        id="quick-select-department"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Patient Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-sky-500"
                          id="quick-patient-name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="(555) 000-0000"
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-sky-500"
                          id="quick-patient-phone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={quickDate}
                        onChange={(e) => setQuickDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-sky-500"
                        id="quick-appointment-date"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-all cursor-pointer"
                      id="quick-submit-btn"
                    >
                      Confirm Booking Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PATIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Patient Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif mt-2">
            Trusted by Thousands of Patients
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Real stories from individuals whose lives were renewed by our medical teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{t.content}"</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 font-serif">{t.patientName}</div>
                  <div className="text-slate-500">{t.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sky-700">{t.department.split('&')[0]}</div>
                  <div className="text-[11px] text-slate-400">{t.doctorName}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. VISITING HOURS & HOSPITAL INFO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">Visiting Hours</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Daily General Wards: 08:00 AM – 08:00 PM <br />
                ICU Attendants: 11:00 AM – 1:00 PM & 5:00 PM – 7:00 PM
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">Campus Location</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {HOSPITAL_INFO.address} <br />
                24/7 Dedicated Emergency Ramp & Valet Parking
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">Trauma & Helipad</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Helpline: {HOSPITAL_INFO.phoneEmergency} <br />
                Rooftop helipad with rapid ICU elevator transfer
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
