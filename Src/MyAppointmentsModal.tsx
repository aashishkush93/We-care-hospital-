import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Building2,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserAppointments, SavedAppointment } from '../lib/firebase';

interface MyAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookNew: () => void;
}

export const MyAppointmentsModal: React.FC<MyAppointmentsModalProps> = ({
  isOpen,
  onClose,
  onBookNew,
}) => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<SavedAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchUserAppointments(currentUser.uid);
      setAppointments(data);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadAppointments();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      id="my-appointments-modal-overlay"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        id="my-appointments-modal-content"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                My Clinical Appointments
              </h3>
              <p className="text-xs text-slate-500">
                Patient Portal • {currentUser?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAppointments}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Refresh"
              aria-label="Refresh appointments"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              id="close-my-appointments-btn"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
              <span>Loading your appointments...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 font-serif">
                No Scheduled Appointments Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not have any upcoming consultations booked. You can schedule an in-person or
                telehealth appointment anytime.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onBookNew();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors cursor-pointer"
                >
                  Book an Appointment Now
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id || apt.bookingRef}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl hover:border-sky-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirmed
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-700">
                      {apt.bookingRef}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Specialist / Doctor</span>
                      <span className="font-semibold text-slate-900">
                        {apt.doctorName || 'Hospital Specialist'}
                      </span>
                      <span className="text-slate-500 block">{apt.departmentName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Date & Time</span>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sky-700 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{apt.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 capitalize">
                      {apt.appointmentType === 'telehealth' ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-sky-600" />
                          Telehealth Video Consultation
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          In-Person Hospital Visit
                        </>
                      )}
                    </span>
                    <span className="text-slate-400">Patient: {apt.patientName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
          <span className="text-xs text-slate-500">
            Need to reschedule? Call: (555) 234-5678
          </span>
          <button
            onClick={() => {
              onClose();
              onBookNew();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs transition-colors cursor-pointer"
          >
            + Book Another Visit
          </button>
        </div>
      </div>
    </div>
  );
};
