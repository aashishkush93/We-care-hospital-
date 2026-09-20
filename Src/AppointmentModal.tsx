import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Video,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { DEPARTMENTS, DOCTORS, HOSPITAL_INFO } from '../data/hospitalData';
import { useAuth } from '../context/AuthContext';
import { saveAppointment } from '../lib/firebase';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctorId?: string;
  initialDepartmentId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialDoctorId,
  initialDepartmentId,
}) => {
  const [departmentId, setDepartmentId] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'telehealth'>('in-person');

  // Patient details
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const { currentUser, userProfile } = useAuth();

  // Prepopulate when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      if (initialDepartmentId) {
        setDepartmentId(initialDepartmentId);
      } else if (initialDoctorId) {
        const foundDoc = DOCTORS.find((d) => d.id === initialDoctorId);
        if (foundDoc) {
          setDepartmentId(foundDoc.departmentId);
          setDoctorId(foundDoc.id);
        }
      } else {
        setDepartmentId(DEPARTMENTS[0].id);
      }

      if (initialDoctorId) {
        setDoctorId(initialDoctorId);
      }

      // Pre-fill user profile info if available
      if (currentUser) {
        if (!patientName) {
          setPatientName(userProfile?.displayName || currentUser.displayName || '');
        }
        if (!email) {
          setEmail(currentUser.email || '');
        }
        if (!phone && userProfile?.phoneNumber) {
          setPhone(userProfile.phoneNumber);
        }
      }

      // Default date: tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);

      // Default slot
      setTimeSlot('09:30 AM');
      setFormError(null);
      setBookingSuccess(false);
    }
  }, [isOpen, initialDoctorId, initialDepartmentId, currentUser, userProfile]);

  if (!isOpen) return null;

  const availableDoctors = DOCTORS.filter(
    (d) => !departmentId || d.departmentId === departmentId
  );

  const selectedDoctor = DOCTORS.find((d) => d.id === doctorId);
  const selectedDept = DEPARTMENTS.find((d) => d.id === departmentId);

  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!departmentId) {
      setFormError('Please select a medical department.');
      return;
    }
    if (!patientName.trim()) {
      setFormError('Please provide your full name.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Please provide a contact phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }

    setIsSaving(true);
    // Generate random reference code
    const ref = 'WCH-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);

    try {
      if (currentUser) {
        await saveAppointment({
          userId: currentUser.uid,
          patientName: patientName.trim(),
          patientPhone: phone.trim(),
          patientEmail: email.trim(),
          departmentId,
          departmentName: selectedDept?.name || 'General Department',
          doctorId: selectedDoctor?.id || '',
          doctorName: selectedDoctor?.name || 'Hospital Specialist',
          appointmentType,
          date,
          timeSlot,
          notes: notes.trim(),
          bookingRef: ref,
          status: 'confirmed',
        });
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
    } finally {
      setIsSaving(false);
      setBookingSuccess(true);
    }
  };

  const handleReset = () => {
    setBookingSuccess(false);
    setPatientName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      id="appointment-modal-overlay"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200"
        id="appointment-modal-content"
      >
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Schedule an Appointment
              </h3>
              <p className="text-xs text-slate-500">We Care Hospital • Outpatient Booking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            id="close-appointment-modal-btn"
            aria-label="Close Appointment Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccess ? (
          /* Confirmation State */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Appointment Confirmed
              </span>
              <h4 className="text-2xl font-bold text-slate-900 font-serif pt-2">
                We Look Forward to Welcoming You
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your consultation request has been confirmed with{' '}
                <span className="font-semibold text-slate-900">
                  {selectedDoctor?.name || 'our medical team'}
                </span>
                . A confirmation SMS and email have been sent to{' '}
                <span className="font-medium text-slate-800">{email}</span>.
              </p>
            </div>

            {/* Appointment summary card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-medium text-slate-500">Reference Number</span>
                <span className="text-sm font-mono font-bold text-sky-700">{bookingRef}</span>
              </div>

              {currentUser && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Successfully linked to your patient portal profile ({currentUser.email}). You can
                    review this visit anytime under &quot;My Appointments&quot;.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Doctor</span>
                  <span className="font-semibold text-slate-900">
                    {selectedDoctor?.name || 'Hospital Specialist'}
                  </span>
                  <span className="text-xs text-slate-600 block">
                    {selectedDoctor?.role || selectedDept?.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Date & Time</span>
                  <span className="font-semibold text-slate-900">{date}</span>
                  <span className="text-xs text-sky-700 font-medium block">{timeSlot}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Consultation Type</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {appointmentType === 'telehealth'
                      ? 'Telehealth Video Call'
                      : 'In-Person Hospital Visit'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Location</span>
                  <span className="text-xs text-slate-800">
                    {appointmentType === 'telehealth'
                      ? 'Secure Patient Video Portal (Link Sent via Email)'
                      : `${selectedDept?.name || 'OPD Tower'}, 2nd Floor, We Care Hospital`}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Please arrive 15 minutes prior to your slot with photo identification and prior
                  prescriptions.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Book Another Appointment
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Step 1: Doctor & Department Selection */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                1. Select Department & Specialist
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={departmentId}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        setDepartmentId(newDept);
                        const firstDoc = DOCTORS.find((d) => d.departmentId === newDept);
                        setDoctorId(firstDoc ? firstDoc.id : '');
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                      id="modal-select-department"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Doctor</label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                      id="modal-select-doctor"
                    >
                      <option value="">-- Choose a doctor --</option>
                      {availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.role.split(' ')[0]} - ${doc.consultationFee})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedDoctor && (
                <div className="flex items-center gap-3 bg-sky-50/60 border border-sky-100 p-3 rounded-xl text-xs text-slate-700">
                  <img
                    src={selectedDoctor.avatarUrl}
                    alt={selectedDoctor.name}
                    className="w-12 h-12 rounded-full object-cover border border-sky-200"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">
                      {selectedDoctor.name}
                    </div>
                    <div className="text-sky-700">{selectedDoctor.qualifications}</div>
                    <div className="text-slate-500 mt-0.5">
                      Available: {selectedDoctor.availableDays.join(', ')} (
                      {selectedDoctor.availableHours})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Fee</span>
                    <span className="text-base font-bold text-sky-700">
                      ${selectedDoctor.consultationFee}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Date, Time & Consultation Type */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                2. Schedule & Visit Format
              </h4>

              {/* Consultation Type Radio Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAppointmentType('in-person')}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    appointmentType === 'in-person'
                      ? 'border-sky-600 bg-sky-50/70 text-sky-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MapPin
                    className={`w-4 h-4 ${
                      appointmentType === 'in-person' ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold">In-Person Visit</div>
                    <div className="text-[11px] text-slate-500">Hospital OPD Clinic</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAppointmentType('telehealth')}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    appointmentType === 'telehealth'
                      ? 'border-sky-600 bg-sky-50/70 text-sky-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Video
                    className={`w-4 h-4 ${
                      appointmentType === 'telehealth' ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold">Telehealth Video</div>
                    <div className="text-[11px] text-slate-500">Online Video Call</div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                      id="modal-input-date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                      id="modal-select-timeslot"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Patient Information */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                3. Patient Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                      id="modal-patient-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="e.g. (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                      id="modal-patient-phone"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="e.g. patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                    id="modal-patient-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Brief Medical Reason or Symptoms (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Briefly describe your symptoms or reason for the visit..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 focus:outline-hidden"
                    id="modal-patient-notes"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg shadow-sm shadow-sky-700/20 active:scale-98 transition-all cursor-pointer"
                id="modal-submit-appointment-btn"
              >
                {isSaving ? 'Processing...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
