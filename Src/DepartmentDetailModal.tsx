import React from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  Users,
  ShieldCheck,
  Activity,
  Phone,
} from 'lucide-react';
import { Department, Doctor } from '../types';
import { DOCTORS, HOSPITAL_INFO } from '../data/hospitalData';

interface DepartmentDetailModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (doctorId?: string, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  department,
  isOpen,
  onClose,
  onBookAppointment,
  onSelectDoctor,
}) => {
  if (!isOpen || !department) return null;

  const departmentDoctors = DOCTORS.filter((d) => d.departmentId === department.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      id="department-detail-modal-overlay"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200"
        id="department-detail-modal-content"
      >
        {/* Banner with image */}
        <div className="relative h-48 sm:h-60 w-full overflow-hidden rounded-t-2xl">
          <img
            src={department.bannerImage}
            alt={department.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
            id="close-department-detail-btn"
            aria-label="Close Department Details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-sky-300 bg-sky-950/70 px-2.5 py-0.5 rounded-full border border-sky-500/30">
              Center of Clinical Excellence
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif">{department.name}</h3>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">{department.tagline}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key stats row */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            {department.stats.map((stat, i) => (
              <div key={i}>
                <div className="text-lg sm:text-2xl font-bold text-sky-700 font-serif">
                  {stat.value}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Clinical Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Department Overview
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{department.description}</p>
          </div>

          {/* Key Services & Procedures */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Specialized Procedures & Treatments
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {department.keyServices.map((service, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-50/50 border border-sky-100 text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Facilities & Technology */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Clinical Infrastructure
            </h4>
            <div className="flex flex-wrap gap-2">
              {department.facilities.map((fac, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>

          {/* Specialist Doctors in this Department */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Department Specialists ({departmentDoctors.length})
              </h4>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>OPD: {department.opdHours}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departmentDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-all group"
                >
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-slate-900 truncate font-serif">
                      {doc.name}
                    </h5>
                    <p className="text-xs text-sky-700 truncate">{doc.role}</p>
                    <p className="text-[11px] text-slate-500">{doc.experienceYears}+ yrs exp</p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectDoctor(doc);
                    }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer shrink-0"
                    title="View Doctor Profile"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Department Footer CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 rounded-b-2xl">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Department OPD Desk:{' '}
                <span className="font-semibold text-slate-800">
                  {HOSPITAL_INFO.phoneAppointments}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onBookAppointment(undefined, department.id);
                }}
                className="flex-1 sm:flex-initial px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-700/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                id="book-dept-appointment-btn"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Department Visit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
