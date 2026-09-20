import React, { useState } from 'react';
import {
  HeartPulse,
  Brain,
  Activity,
  Baby,
  ShieldAlert,
  Heart,
  Smile,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Filter,
  Users,
  ArrowRight,
  Stethoscope,
  Phone,
  Building2,
} from 'lucide-react';
import { Department, Doctor } from '../types';
import { DEPARTMENTS, DOCTORS, HOSPITAL_INFO } from '../data/hospitalData';

interface DepartmentPageProps {
  onSelectDepartment: (dept: Department) => void;
  onOpenAppointmentModal: (doctorId?: string, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DepartmentPage: React.FC<DepartmentPageProps> = ({
  onSelectDepartment,
  onOpenAppointmentModal,
  onSelectDoctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredDepartments = DEPARTMENTS.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.keyServices.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' || dept.id === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getDeptIcon = (name: string) => {
    switch (name) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-sky-600" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-amber-600" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-rose-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-purple-600" />;
      case 'Ambulance':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'Smile':
        return <Smile className="w-5 h-5 text-teal-600" />;
      default:
        return <Stethoscope className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-12 pb-16 bg-[#FAFCFE]">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-[#FAFCFE] py-12 lg:py-16 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200">
              We Care Hospital Centers of Excellence
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight leading-tight">
              Clinical Departments & Institutes
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Explore our 8 specialized medical departments, each equipped with dedicated intensive
              care units, modern surgical suites, and top medical specialists.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search departments, conditions, or clinical procedures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                id="dept-search-input"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="md:col-span-4">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                id="dept-filter-select"
              >
                <option value="all">All Departments ({DEPARTMENTS.length})</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-slate-100">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Departments
            </button>
            {DEPARTMENTS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedFilter(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === d.id
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

      {/* 3. DEPARTMENTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-sm font-semibold text-slate-600">
              No departments matched your search query.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
              }}
              className="mt-3 text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
            >
              Reset search filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => {
              const deptHeadDoctor = DOCTORS.find((doc) => doc.departmentId === dept.id);

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  {/* Department Banner Image */}
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={dept.bannerImage}
                        alt={dept.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-2 rounded-xl text-slate-900 shadow-xs">
                        {getDeptIcon(dept.iconName)}
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold font-serif">{dept.name}</h3>
                        <p className="text-xs text-slate-200">{dept.tagline}</p>
                      </div>
                    </div>

                    {/* Department Content */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {dept.description}
                      </p>

                      {/* Clinical Capacity */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Bed Capacity</span>
                          <span className="font-semibold text-slate-900">{dept.bedCapacity} Specialized Beds</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">OPD Timing</span>
                          <span className="font-semibold text-slate-900">{dept.opdHours.split(' ')[0]} 8AM-8PM</span>
                        </div>
                      </div>

                      {/* Key Services */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Key Clinical Services
                        </span>
                        <div className="space-y-1">
                          {dept.keyServices.slice(0, 3).map((srv, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span className="truncate">{srv}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Department Head */}
                      {dept.headDoctor && (
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={dept.headDoctor.avatarUrl}
                              alt={dept.headDoctor.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 line-clamp-1">
                                {dept.headDoctor.name}
                              </div>
                              <div className="text-[10px] text-slate-400">{dept.headDoctor.title}</div>
                            </div>
                          </div>
                          {deptHeadDoctor && (
                            <button
                              onClick={() => onSelectDoctor(deptHeadDoctor)}
                              className="text-[11px] text-sky-700 hover:underline font-semibold cursor-pointer"
                            >
                              Profile
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectDepartment(dept)}
                      className="w-full text-xs font-semibold py-2 px-2 rounded-lg text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onOpenAppointmentModal(undefined, dept.id)}
                      className="w-full text-xs font-semibold py-2 px-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer text-center shadow-2xs"
                    >
                      Book OPD
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. EMERGENCY TRIAGE ADVISEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1E36] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif">Acute Trauma or Cardiac Emergency?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Do not wait for standard OPD clinic appointments. Our Level 1 Emergency Resuscitation
                Bay is staffed 24/7 with immediate trauma surgeons and cath-lab response teams.
              </p>
            </div>
          </div>

          <a
            href={`tel:${HOSPITAL_INFO.phoneEmergency}`}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shrink-0 flex items-center gap-2 shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Emergency Line: {HOSPITAL_INFO.phoneEmergency}</span>
          </a>
        </div>
      </section>
    </div>
  );
};
