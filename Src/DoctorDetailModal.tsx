import React from 'react';
import {
  X,
  Star,
  GraduationCap,
  Calendar,
  Clock,
  Mail,
  Award,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (doctorId: string, departmentId: string) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onBookAppointment,
}) => {
  if (!isOpen || !doctor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      id="doctor-detail-modal-overlay"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200"
        id="doctor-detail-modal-content"
      >
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Physician Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            id="close-doctor-detail-btn"
            aria-label="Close Doctor Detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Hero Card */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-md border-2 border-slate-100 shrink-0"
            />
            <div className="space-y-2 flex-1">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                {doctor.departmentName}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif">{doctor.name}</h3>
              <p className="text-sm font-medium text-slate-700">{doctor.role}</p>
              <p className="text-xs text-slate-500">{doctor.qualifications}</p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-400 font-normal">
                    ({doctor.reviewCount} verified reviews)
                  </span>
                </div>
                <div className="text-slate-600 font-medium">
                  {doctor.experienceYears}+ Years Clinical Experience
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Biography & Philosophy
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Clinical Specializations */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Clinical Areas of Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{spec}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Education & Training */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Education & Fellowships
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {doctor.education.map((edu, i) => (
                <li key={i} className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Schedule & Consultation Fee */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Consultation Days</span>
              </div>
              <p className="text-slate-600 pl-5.5">{doctor.availableDays.join(', ')}</p>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 pt-1">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Hours: {doctor.availableHours}</span>
              </div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Award className="w-4 h-4 text-sky-600" />
                <span>Consultation Fee</span>
              </div>
              <p className="text-xl font-bold text-sky-700 font-serif">
                ${doctor.consultationFee}
                <span className="text-xs font-normal text-slate-500"> / session</span>
              </p>
              <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{doctor.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Modal Action CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookAppointment(doctor.id, doctor.departmentId);
              }}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-700/20 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
              id="book-consultation-doctor-detail-btn"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
