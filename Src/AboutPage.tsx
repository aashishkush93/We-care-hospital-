import React from 'react';
import {
  ShieldCheck,
  HeartPulse,
  Award,
  Users,
  Building2,
  CheckCircle2,
  Activity,
  Calendar,
  ArrowRight,
  Stethoscope,
  Microscope,
  Cpu,
} from 'lucide-react';
import { PageType } from '../types';
import { HOSPITAL_INFO, HOSPITAL_STATS, ACCREDITATIONS, HOSPITAL_FACILITIES } from '../data/hospitalData';

interface AboutPageProps {
  onNavigate: (page: PageType) => void;
  onOpenAppointmentModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenAppointmentModal }) => {
  const leadership = [
    {
      name: 'Dr. Evelyn Montgomery, MD, MHA',
      role: 'Chief Executive Officer & Medical Superintendent',
      qualification: 'Harvard Medical School & Wharton Healthcare',
      image:
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',
      bio: 'Leading We Care Hospital for over 15 years with a dedication to zero-harm patient safety, ethical healthcare delivery, and modern clinical expansion.',
    },
    {
      name: 'Dr. Arthur Vance, MD, FACC',
      role: 'Chief Medical Officer & Cardiology Chair',
      qualification: 'Johns Hopkins University & Brigham and Women’s',
      image:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
      bio: 'Pioneered minimally invasive heart interventions and structured the clinical governance models upholding our 99.4% cardiac survival record.',
    },
    {
      name: 'Dr. Elena Rostova, MD, PhD, FAANS',
      role: 'Director of Surgical Services & Research',
      qualification: 'Stanford Medicine & Mayo Clinic',
      image:
        'https://images.unsplash.com/photo-1594824813589-fb5ff52b95c3?auto=format&fit=crop&w=500&q=80',
      bio: 'Leads our multi-specialty clinical research institute, championing AI-guided robotic surgery suites and translational neuro-oncology trials.',
    },
    {
      name: 'Sister Patricia O’Connor, RN, MSN',
      role: 'Chief Nursing Officer & Patient Experience Director',
      qualification: 'Columbia School of Nursing',
      image:
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=500&q=80',
      bio: 'Oversees a team of 1,200+ certified nurses, establishing patient-centered compassionate bedside care and the DAISY Nursing Excellence recognition.',
    },
  ];

  const values = [
    {
      title: 'Compassionate Care',
      desc: 'Treating each patient as family, listening with empathy, and honoring human dignity in every medical interaction.',
      icon: HeartPulse,
      color: 'text-rose-600 bg-rose-50 border border-rose-100',
    },
    {
      title: 'Clinical Excellence',
      desc: 'Rigorous peer-reviewed standards, evidence-based therapies, and continuous training under world medical authorities.',
      icon: Award,
      color: 'text-sky-600 bg-sky-50 border border-sky-100',
    },
    {
      title: 'Ethical Integrity',
      desc: 'Transparent diagnoses, clear treatment pathways, affordable options, and zero unnecessary clinical procedures.',
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50 border border-indigo-100',
    },
    {
      title: 'Pioneering Innovation',
      desc: 'Embracing robotic surgery, rapid genomics, low-radiation imaging, and minimally invasive techniques.',
      icon: Cpu,
      color: 'text-teal-600 bg-teal-50 border border-teal-100',
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#FAFCFE]">
      {/* 1. ABOUT HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-[#FAFCFE] py-14 lg:py-20 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200">
              About We Care Hospital
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight leading-tight">
              A Legacy of Healing, Hope & World-Class Medical Innovation
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Established with the fundamental belief that every human life deserves exceptional
              care, We Care Hospital has grown into an 850-bed flagship academic and medical
              institution serving over 250,000 patients every year.
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE STORY & MISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Visual Image */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80"
                alt="We Care Hospital Surgical Suite"
                className="w-full h-96 object-cover"
              />
            </div>
            {/* Overlay badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
              <div className="text-3xl font-extrabold text-sky-700 font-serif">32+ Years</div>
              <div className="text-xs font-medium text-slate-600 mt-1">
                Delivering compassionate, multi-specialty care to generations of families.
              </div>
            </div>
          </div>

          {/* Right: Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Our Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
              Built on Compassion, Guided by Science
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Founded in 1994 by a dedicated cohort of physicians and humanitarian nurses, We Care
              Hospital began as an acute community clinic and has transformed into a leading tertiary
              care research hospital.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Today, our campus houses 8 premier Centers of Excellence, robotic surgery theaters, a
              Level 1 certified trauma center, and an advanced oncology institute. We adhere to
              uncompromising infection control and continuous peer-review methodologies.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-2xl font-bold text-sky-700 font-serif">850+</div>
                <div className="text-xs text-slate-500 mt-1">Licensed Inpatient Beds</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-2xl font-bold text-sky-700 font-serif">180+</div>
                <div className="text-xs text-slate-500 mt-1">Specialist Physicians</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISSION, VISION & CORE VALUES */}
      <section className="bg-white py-16 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Guiding Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif mt-2">
              Mission & Core Values
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Our philosophy shapes every patient interaction from the moment you step through our
              doors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FAFCFE] rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${val.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">{val.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">{val.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOSPITAL LEADERSHIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Clinical Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif mt-2">
            Executive Leadership & Advisory Board
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Renowned physician leaders and clinical administrators steering patient safety and medical
            excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((leader, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="h-56 overflow-hidden bg-slate-100">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">{leader.name}</h3>
                  <p className="text-xs text-sky-700 font-semibold">{leader.role}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{leader.qualification}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">{leader.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ACCREDITATIONS & QUALITY STANDARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1E36] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
              Gold Standard Quality
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">
              Nationally & Internationally Certified
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We Care Hospital rigorously complies with global healthcare benchmarks, clinical audit
              protocols, and zero-tolerance infection control policies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACCREDITATIONS.map((acc, index) => (
              <div
                key={index}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-serif">{acc.name}</h4>
                <p className="text-xs text-slate-400">{acc.code}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => onOpenAppointmentModal()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
            >
              <Calendar className="w-4 h-4 text-sky-700" />
              <span>Schedule a Clinical Visit</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
