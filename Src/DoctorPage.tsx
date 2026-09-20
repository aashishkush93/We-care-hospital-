import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  Calendar,
  Clock,
  Award,
  GraduationCap,
  ArrowRight,
  Stethoscope,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { Doctor } from '../types';
import { DOCTORS, DEPARTMENTS, HOSPITAL_INFO } from '../data/hospitalData';

interface DoctorPageProps {
  onSelectDoctor: (doctor: Doctor) => void;
  onOpenAppointmentModal: (doctorId?: string, departmentId?: string) => void;
}

export const DoctorPage: React.FC<DoctorPageProps> = ({
  onSelectDoctor,
  onOpenAppointmentModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');

  const filteredDoctors = DOCTORS.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specializations.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept =
      selectedDeptFilter === 'all' || doctor.departmentId === selectedDeptFilter;

    return matchesSearch && matchesDept;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
    return 0;
  });

  return (
    <div className="space-y-12 pb-16 bg-[#FAFCFE]">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-[#FAFCFE] py-12 lg:py-16 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200">
              We Care Hospital Medical Faculty
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight leading-tight">
              Our Medical Doctors & Specialists
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Meet our board-certified physicians, interventional surgeons, and clinical chairs
              dedicated to compassionate diagnosis, minimally invasive interventions, and long-term
              wellness.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by doctor name, specialty, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                id="doctor-search-input"
              />
            </div>

            {/* Department Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                id="doctor-filter-dept"
              >
                <option value="all">All Specialties ({DOCTORS.length})</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                id="doctor-sort-select"
              >
                <option value="rating">Sort by: Highest Rated</option>
                <option value="experience">Sort by: Most Experienced</option>
                <option value="fee">Sort by: Lowest Consultation Fee</option>
              </select>
            </div>
          </div>

          {/* Quick Department Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-slate-100">
            <button
              onClick={() => setSelectedDeptFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedDeptFilter === 'all'
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specialties
            </button>
            {DEPARTMENTS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDeptFilter(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDeptFilter === d.id
                    ? 'bg-sky-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DOCTOR CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-sm font-semibold text-slate-600">
              No doctors matched your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDeptFilter('all');
              }}
              className="mt-3 text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
            >
              Reset filters and show all specialists
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
              >
                {/* Doctor Head Card */}
                <div>
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={doctor.avatarUrl}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 shadow-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doctor.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({doctor.reviewCount})
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider block">
                        {doctor.departmentName}
                      </span>
                      <h3 className="text-xl font-bold font-serif">{doctor.name}</h3>
                      <p className="text-xs text-slate-300 truncate">{doctor.role}</p>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-5 space-y-4">
                    <div className="text-xs text-slate-600 flex items-start gap-1.5">
                      <GraduationCap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{doctor.qualifications}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{doctor.bio}</p>

                    {/* Specialization Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {doctor.specializations.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Available days & Fee */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          <span>Clinic Days:</span>
                        </span>
                        <span className="font-medium text-slate-900 truncate max-w-[140px]">
                          {doctor.availableDays.join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Hours:</span>
                        </span>
                        <span className="font-medium text-slate-900">{doctor.availableHours}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200">
                        <span>Consultation Fee:</span>
                        <span className="text-sm font-bold text-sky-700 font-serif">
                          ${doctor.consultationFee}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectDoctor(doctor)}
                    className="w-full text-xs font-semibold py-2 px-2 rounded-lg text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-center"
                  >
                    View Bio
                  </button>
                  <button
                    onClick={() => onOpenAppointmentModal(doctor.id, doctor.departmentId)}
                    className="w-full text-xs font-semibold py-2 px-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. HELP FINDING SPECIALIST BOX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1E36] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif">Unsure Which Specialist to Consult?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Our patient navigators and general physicians are available to evaluate your medical
                records and guide you to the appropriate specialist clinic.
              </p>
            </div>
          </div>

          <a
            href={`tel:${HOSPITAL_INFO.phoneAppointments}`}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-900 bg-sky-300 hover:bg-sky-200 transition-colors shrink-0 flex items-center gap-2 shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Call Patient Navigator: {HOSPITAL_INFO.phoneAppointments}</span>
          </a>
        </div>
      </section>
    </div>
  );
};
