import React from 'react';
import {
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { PageType } from '../types';
import { HOSPITAL_INFO, DEPARTMENTS, ACCREDITATIONS } from '../data/hospitalData';

interface FooterProps {
  onNavigate: (page: PageType) => void;
  onOpenAppointmentModal: (doctorId?: string, departmentId?: string) => void;
  onSelectDepartment?: (departmentId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenAppointmentModal,
  onSelectDepartment,
}) => {
  const handleNav = (page: PageType) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeptClick = (deptId: string) => {
    onNavigate('department');
    if (onSelectDepartment) {
      onSelectDepartment(deptId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1E36] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      {/* Emergency & Helpline Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-rose-950/90 via-[#0E2849] to-[#0A2240] border border-rose-900/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white tracking-tight font-serif">
                Need Immediate Emergency Assistance?
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                Our Level 1 Trauma unit, acute stroke resuscitation protocols, and mobile ICU
                ambulances operate 24/7/365.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`tel:${HOSPITAL_INFO.phoneEmergency}`}
              id="footer-emergency-call-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call 24/7 Emergency: {HOSPITAL_INFO.phoneEmergency}</span>
            </a>
            <button
              onClick={() => onOpenAppointmentModal()}
              id="footer-appointment-modal-btn"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Book Doctor Visit</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Hospital Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-serif">
                We Care <span className="text-sky-400 font-light">Hospital</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              An 850-bed JCI Gold Seal and NABH accredited tertiary teaching hospital delivering
              comprehensive multi-specialty care, robotic surgery, and compassionate clinical
              outcomes since 1994.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{HOSPITAL_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Emergency: 24/7 | OPD Clinics: Mon - Sat 8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{HOSPITAL_INFO.email}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Our Hospital
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('department')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Clinical Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('doctor')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Doctors & Specialists
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAppointmentModal()}
                  className="hover:text-white transition-colors cursor-pointer font-medium text-sky-400"
                >
                  Book an Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('profile')}
                  id="footer-patient-profile-link"
                  className="hover:text-white transition-colors cursor-pointer text-sky-400 font-medium"
                >
                  Patient Health Profile & Summary
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  id="footer-admin-portal-link"
                  className="hover:text-amber-300 transition-colors cursor-pointer font-medium text-amber-400 flex items-center gap-1"
                >
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Centers of Excellence */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Specialties</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {DEPARTMENTS.slice(0, 5).map((dept) => (
                <li key={dept.id}>
                  <button
                    onClick={() => handleDeptClick(dept.id)}
                    className="hover:text-white transition-colors text-left cursor-pointer truncate max-w-[180px]"
                  >
                    {dept.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Accreditations & Quality */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Quality & Trust
            </h5>
            <div className="space-y-2.5">
              {ACCREDITATIONS.map((acc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block leading-tight">{acc.name}</span>
                    <span className="text-[10px] text-slate-400">{acc.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} We Care Hospital. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">
              Patient Rights & Privacy
            </span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">
              Clinical Quality Reports
            </span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">
              Ethical Governance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
