import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PatientHealthProfile } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: 'patient' | 'doctor' | 'admin';
  phoneNumber?: string;
  createdAt?: string;
}

export interface SavedAppointment {
  id?: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  departmentId: string;
  departmentName?: string;
  doctorId?: string;
  doctorName?: string;
  appointmentType: 'in-person' | 'telehealth';
  date: string;
  timeSlot: string;
  notes?: string;
  adminNotes?: string;
  bookingRef: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'pending';
  createdAt?: any;
}

export const ADMIN_CONFIG = {
  email: 'aashish@gmail.com',
  password: 'Aashish@2007',
  displayName: 'Aashish (Hospital Administrator)',
};

export const INITIAL_CLINICAL_APPOINTMENTS: SavedAppointment[] = [
  {
    id: 'apt-seed-101',
    userId: 'patient-ext-101',
    patientName: 'Robert Miller',
    patientPhone: '+1 (555) 349-8120',
    patientEmail: 'r.miller@example.com',
    departmentId: 'cardiology',
    departmentName: 'Cardiology & Vascular Institute',
    doctorId: 'dr-arthur-vance',
    doctorName: 'Dr. Arthur Vance',
    appointmentType: 'in-person',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:30 AM',
    notes: 'Follow-up for post-stent cardiac rehabilitation and ECG evaluation.',
    bookingRef: 'WCH-94281',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'apt-seed-102',
    userId: 'patient-ext-102',
    patientName: 'Elena Davis',
    patientPhone: '+1 (555) 721-4902',
    patientEmail: 'elena.davis@example.com',
    departmentId: 'neurology',
    departmentName: 'Neurology & Neurosurgery',
    doctorId: 'dr-elena-rostova',
    doctorName: 'Dr. Elena Rostova',
    appointmentType: 'in-person',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM',
    notes: 'Persistent migraine with visual aura; MRI scans brought from external clinic.',
    bookingRef: 'WCH-81340',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'apt-seed-103',
    userId: 'patient-ext-103',
    patientName: 'Marcus Sterling',
    patientPhone: '+1 (555) 884-1290',
    patientEmail: 'm.sterling@example.com',
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics & Joint Reconstruction',
    doctorId: 'dr-marcus-thorne',
    doctorName: 'Dr. Marcus Thorne',
    appointmentType: 'in-person',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:15 AM',
    notes: 'Right knee arthroscopy follow-up examination.',
    bookingRef: 'WCH-73591',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'apt-seed-104',
    userId: 'patient-ext-104',
    patientName: 'Samantha Lee',
    patientPhone: '+1 (555) 902-6154',
    patientEmail: 'slee_fam@example.com',
    departmentId: 'pediatrics',
    departmentName: 'Pediatrics & Neonatal Care',
    doctorId: 'dr-priya-nair',
    doctorName: 'Dr. Priya Nair',
    appointmentType: 'telehealth',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '04:00 PM',
    notes: 'Routine developmental pediatric assessment for 3-year-old child.',
    bookingRef: 'WCH-65209',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'apt-seed-105',
    userId: 'patient-ext-105',
    patientName: 'David Wilson',
    patientPhone: '+1 (555) 438-9901',
    patientEmail: 'dwilson@example.com',
    departmentId: 'oncology',
    departmentName: 'Comprehensive Cancer Center',
    doctorId: 'dr-jonathan-hayes',
    doctorName: 'Dr. Jonathan Hayes',
    appointmentType: 'in-person',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '09:00 AM',
    notes: 'Immunotherapy cycle 3 review and blood work analysis.',
    bookingRef: 'WCH-59418',
    status: 'rescheduled',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

// Google Sign In
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Persist / update profile doc
  await ensureUserProfile(user);
  return user;
}

// Email/Password Sign In
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

// Email/Password Sign Up
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = result.user;

  if (displayName.trim()) {
    await updateProfile(user, { displayName: displayName.trim() });
  }

  await ensureUserProfile(user, { displayName: displayName.trim() });
  return user;
}

// Ensure User Profile in Firestore
export async function ensureUserProfile(
  user: FirebaseUser,
  extra?: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        displayName: extra?.displayName || user.displayName || 'Patient',
        photoURL: user.photoURL || '',
        phoneNumber: extra?.phoneNumber || user.phoneNumber || '',
        role: extra?.role || 'patient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (extra) {
      await setDoc(userRef, { ...extra, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }
}

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Save Appointment to Firestore with resilient local backup
export async function saveAppointment(data: Omit<SavedAppointment, 'id' | 'createdAt'>): Promise<string> {
  let docId = data.bookingRef;
  try {
    const colRef = collection(db, 'appointments');
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    docId = docRef.id;
  } catch (err) {
    console.warn('Could not write to Firestore directly (saving to local store):', err);
  }

  // Always keep a local copy for immediate client recovery and demo/offline persistence
  try {
    const localSaved: SavedAppointment[] = JSON.parse(
      localStorage.getItem('wecare_local_appointments') || '[]'
    );
    const newAppointment: SavedAppointment = {
      ...data,
      id: docId,
      createdAt: new Date().toISOString(),
    };
    // Prepend and dedup
    const filtered = localSaved.filter((a) => a.bookingRef !== data.bookingRef);
    localStorage.setItem(
      'wecare_local_appointments',
      JSON.stringify([newAppointment, ...filtered])
    );
  } catch (storageErr) {
    console.error('Error saving to localStorage backup:', storageErr);
  }

  return docId;
}

// Fetch Appointments for a User
export async function fetchUserAppointments(userId: string): Promise<SavedAppointment[]> {
  const localList: SavedAppointment[] = [];
  try {
    const stored = localStorage.getItem('wecare_local_appointments');
    if (stored) {
      const parsed: SavedAppointment[] = JSON.parse(stored);
      localList.push(...parsed.filter((a) => a.userId === userId));
    }
  } catch (e) {
    console.error('Error reading local appointments:', e);
  }

  try {
    const colRef = collection(db, 'appointments');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const firestoreList: SavedAppointment[] = [];
    snap.forEach((d) => {
      firestoreList.push({ id: d.id, ...(d.data() as any) });
    });

    // Merge without duplicates by bookingRef
    const combined = [...firestoreList];
    for (const localItem of localList) {
      if (!combined.some((c) => c.bookingRef === localItem.bookingRef)) {
        combined.push(localItem);
      }
    }
    return combined;
  } catch (err) {
    console.warn('Could not fetch from Firestore, returning local cached list:', err);
    return localList;
  }
}

// Fetch ALL Hospital Appointments (for Admin Portal)
export async function fetchAllAppointments(): Promise<SavedAppointment[]> {
  const localList: SavedAppointment[] = [];
  try {
    const stored = localStorage.getItem('wecare_local_appointments');
    if (stored) {
      const parsed: SavedAppointment[] = JSON.parse(stored);
      localList.push(...parsed);
    }
  } catch (e) {
    console.error('Error reading local appointments:', e);
  }

  // Include default clinical appointments if no local list exists
  if (localList.length === 0) {
    localList.push(...INITIAL_CLINICAL_APPOINTMENTS);
    try {
      localStorage.setItem('wecare_local_appointments', JSON.stringify(INITIAL_CLINICAL_APPOINTMENTS));
    } catch (e) {
      // ignore
    }
  }

  try {
    const colRef = collection(db, 'appointments');
    const snap = await getDocs(colRef);
    const firestoreList: SavedAppointment[] = [];
    snap.forEach((d) => {
      firestoreList.push({ id: d.id, ...(d.data() as any) });
    });

    const combined = [...firestoreList];
    for (const localItem of localList) {
      if (!combined.some((c) => c.bookingRef === localItem.bookingRef)) {
        combined.push(localItem);
      }
    }
    return combined;
  } catch (err) {
    console.warn('Could not fetch all from Firestore, using local list:', err);
    return localList;
  }
}

// Update Appointment Status and Clinical Notes (Admin)
export async function updateAppointmentStatus(
  appointmentRefOrId: string,
  newStatus: SavedAppointment['status'],
  adminNotes?: string
): Promise<void> {
  // Update in Firestore
  try {
    const docRef = doc(db, 'appointments', appointmentRefOrId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, {
        status: newStatus,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Could not update in Firestore, updating local cache:', err);
  }

  // Always sync local storage
  try {
    const stored = localStorage.getItem('wecare_local_appointments');
    if (stored) {
      const parsed: SavedAppointment[] = JSON.parse(stored);
      const updated = parsed.map((item) => {
        if (item.id === appointmentRefOrId || item.bookingRef === appointmentRefOrId) {
          return {
            ...item,
            status: newStatus,
            ...(adminNotes !== undefined ? { adminNotes } : {}),
          };
        }
        return item;
      });
      localStorage.setItem('wecare_local_appointments', JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Error updating local appointment storage:', err);
  }
}

// Delete Appointment Record (Admin)
export async function deleteAppointmentRecord(appointmentRefOrId: string): Promise<void> {
  // Remove from Firestore
  try {
    const docRef = doc(db, 'appointments', appointmentRefOrId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete in Firestore, removing from local storage:', err);
  }

  // Remove from local storage
  try {
    const stored = localStorage.getItem('wecare_local_appointments');
    if (stored) {
      const parsed: SavedAppointment[] = JSON.parse(stored);
      const filtered = parsed.filter(
        (item) => item.id !== appointmentRefOrId && item.bookingRef !== appointmentRefOrId
      );
      localStorage.setItem('wecare_local_appointments', JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Error deleting from local appointments:', err);
  }
}

// Default Health Profile Generator
export function createDefaultPatientHealthProfile(
  userId: string,
  displayName?: string | null,
  email?: string | null
): PatientHealthProfile {
  const isDemo = userId === 'demo-patient-101' || !email || email.includes('example.com') || email.includes('patient');

  return {
    mrn: `WCH-PT-${Math.abs(userId.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 17) % 90000 + 10000)}`,
    bloodGroup: 'O+ (Positive)',
    dateOfBirth: '1988-06-14',
    gender: 'Male',
    emergencyContact: {
      name: 'Sarah Miller',
      relationship: 'Spouse',
      phone: '+1 (555) 349-8121',
    },
    insuranceInfo: {
      provider: 'BlueCross BlueShield Premier Care',
      policyNumber: 'BCBS-99482103',
      groupNumber: 'GRP-00248',
      status: 'Active',
      validUntil: '2027-12-31',
    },
    primaryCarePhysician: {
      name: 'Dr. Arthur Vance, MD',
      clinic: 'Cardiology & Internal Medicine, WeCare Hospital',
      phone: '+1 (800) 555-CARE Ext. 402',
    },
    vitals: {
      bloodPressure: '118/76 mmHg',
      heartRate: 72,
      spO2: 99,
      temperature: '98.4 °F',
      respiratoryRate: 16,
      bloodGlucose: '94 mg/dL (Fasting)',
      bmi: 22.8,
      weightKg: 71,
      heightCm: 176,
      lastRecordedDate: 'Sept 14, 2026',
    },
    allergies: [
      {
        id: 'alg-1',
        allergen: 'Penicillin (Beta-Lactam)',
        severity: 'Severe',
        reaction: 'Anaphylactoid rash and bronchospasm',
      },
      {
        id: 'alg-2',
        allergen: 'Sulfa Antibiotics',
        severity: 'Moderate',
        reaction: 'Urticaria and facial flushing',
      },
      {
        id: 'alg-3',
        allergen: 'Latex Surgical Powder',
        severity: 'Mild',
        reaction: 'Local contact dermatitis',
      },
    ],
    chronicConditions: [
      {
        id: 'cc-1',
        condition: 'Essential Hypertension (Stage 1)',
        diagnosedDate: 'Jan 2023',
        status: 'Controlled',
        managingPhysician: 'Dr. Arthur Vance',
      },
      {
        id: 'cc-2',
        condition: 'Seasonal Allergic Rhinitis',
        diagnosedDate: 'May 2021',
        status: 'Active',
        managingPhysician: 'Dr. Elena Rostova',
      },
    ],
    medications: [
      {
        id: 'med-1',
        name: 'Lisinopril Oral Tablet',
        dosage: '10 mg',
        frequency: 'Once daily every morning with water',
        prescribedBy: 'Dr. Arthur Vance',
        purpose: 'Cardiovascular blood pressure regulation',
        refillsRemaining: 3,
      },
      {
        id: 'med-2',
        name: 'Cetirizine HCl Tablet',
        dosage: '10 mg',
        frequency: 'Once daily at bedtime as needed',
        prescribedBy: 'Dr. Elena Rostova',
        purpose: 'Seasonal allergy & histamine relief',
        refillsRemaining: 2,
      },
      {
        id: 'med-3',
        name: 'CoQ10 Dietary Supplement',
        dosage: '100 mg',
        frequency: 'Daily with meals',
        prescribedBy: 'Dr. Arthur Vance',
        purpose: 'Cardiometabolic cellular support',
        refillsRemaining: 5,
      },
    ],
    pastProcedures: [
      {
        id: 'proc-1',
        procedureName: 'Diagnostic Coronary Angiogram & Preventive Stenting',
        date: 'Sept 14, 2025',
        hospital: 'WeCare Cardiac Catheterization Lab (Room 4A)',
        surgeon: 'Dr. Arthur Vance, FACC',
        notes: 'Patent vessel restored. Post-operative recovery uneventful. Full cardiac rehabilitation completed.',
        outcome: 'Successful',
      },
      {
        id: 'proc-2',
        procedureName: 'Arthroscopic Partial Meniscectomy (Right Knee)',
        date: 'March 22, 2024',
        hospital: 'WeCare Orthopedic Surgical Wing',
        surgeon: 'Dr. Marcus Thorne, FAAOS',
        notes: 'Minimal invasion tear repair. Physical therapy completed with full flexion range.',
        outcome: 'Successful',
      },
      {
        id: 'proc-3',
        procedureName: 'Laparoscopic Appendectomy',
        date: 'July 10, 2018',
        hospital: 'WeCare General Emergency Surgical Unit',
        surgeon: 'Dr. Sarah Jenkins',
        notes: 'Uncomplicated laparoscopic removal. Clean healing.',
        outcome: 'Routine',
      },
    ],
    immunizations: [
      {
        id: 'imm-1',
        vaccineName: 'COVID-19 mRNA Updated Bivalent Vaccine',
        administeredDate: 'Oct 15, 2025',
        batchNumber: 'PFIZ-88942-B',
        clinic: 'WeCare Community Immunization Clinic',
        status: 'Completed',
      },
      {
        id: 'imm-2',
        vaccineName: 'Quadrivalent Influenza Vaccine (FluZone)',
        administeredDate: 'Sept 04, 2026',
        batchNumber: 'SANO-77120-Q',
        clinic: 'WeCare Outpatient Pharmacy Station',
        status: 'Completed',
      },
      {
        id: 'imm-3',
        vaccineName: 'Tdap (Tetanus, Diphtheria, Pertussis Booster)',
        administeredDate: 'May 18, 2023',
        batchNumber: 'GSK-55421-T',
        clinic: 'WeCare Occupational Health',
        status: 'Completed',
      },
      {
        id: 'imm-4',
        vaccineName: 'Hepatitis B (3-Dose Adult Series)',
        administeredDate: 'Aug 12, 2020',
        batchNumber: 'ENG-33920-H',
        clinic: 'WeCare Preventive Medicine',
        status: 'Completed',
      },
    ],
    diagnosticReports: [
      {
        id: 'rep-1',
        testName: 'Comprehensive Metabolic Panel (CMP) + Lipid Panel',
        category: 'Laboratory',
        date: 'Sept 12, 2026',
        reportingDoctor: 'Dr. Arthur Vance',
        resultStatus: 'Normal',
        summary: 'Electrolytes, liver enzymes, and kidney function normal. Total cholesterol 178 mg/dL, HDL 54 mg/dL, LDL 96 mg/dL.',
        findings: [
          'Serum Creatinine: 0.92 mg/dL (Normal Range 0.7 - 1.3)',
          'eGFR: >90 mL/min/1.73m²',
          'Total Cholesterol: 178 mg/dL (Desirable <200)',
          'Triglycerides: 130 mg/dL (Normal <150)',
        ],
      },
      {
        id: 'rep-2',
        testName: '12-Lead Electrocardiogram (ECG / EKG)',
        category: 'Cardiology',
        date: 'Sept 12, 2026',
        reportingDoctor: 'Dr. Arthur Vance',
        resultStatus: 'Normal',
        summary: 'Normal sinus rhythm, heart rate 72 bpm. PR interval 158 ms, QRS duration 86 ms. No ST elevations or ischemic changes.',
        findings: [
          'Rhythm: Normal Sinus Rhythm',
          'Rate: 72 bpm',
          'Axis: Normal (+45°)',
          'Conduction: Normal AV conduction without block',
        ],
      },
      {
        id: 'rep-3',
        testName: 'Chest Radiograph 2-View (PA & Lateral)',
        category: 'Radiology',
        date: 'March 15, 2026',
        reportingDoctor: 'Dr. David Wilson',
        resultStatus: 'Reviewed',
        summary: 'Lungs are clear of infiltrates or focal consolidation. Cardiothoracic silhouette is within normal physiological limits.',
        findings: [
          'Lung Fields: Clear, no pleural effusion',
          'Cardiac Silhouette: Normal transverse diameter',
          'Bony Thorax: Intact, no fractures',
        ],
      },
    ],
    organDonorStatus: true,
    notes: 'Patient reports good compliance with morning Lisinopril and daily 30-minute cardio walking.',
  };
}

// Fetch Patient Health Profile
export async function fetchPatientHealthProfile(
  userId: string,
  displayName?: string | null,
  email?: string | null
): Promise<PatientHealthProfile> {
  // Check local cache first
  const localKey = `wecare_health_profile_${userId}`;
  try {
    const cached = localStorage.getItem(localKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error reading local health profile:', e);
  }

  // Try Firestore
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.healthProfile) {
        try {
          localStorage.setItem(localKey, JSON.stringify(data.healthProfile));
        } catch (e) {}
        return data.healthProfile as PatientHealthProfile;
      }
    }
  } catch (err) {
    console.warn('Could not read health profile from Firestore:', err);
  }

  // Fallback to rich default profile
  const defaultProf = createDefaultPatientHealthProfile(userId, displayName, email);
  try {
    localStorage.setItem(localKey, JSON.stringify(defaultProf));
  } catch (e) {}
  return defaultProf;
}

// Save Patient Health Profile
export async function savePatientHealthProfile(
  userId: string,
  profile: PatientHealthProfile
): Promise<void> {
  const localKey = `wecare_health_profile_${userId}`;
  // Save locally
  try {
    localStorage.setItem(localKey, JSON.stringify(profile));
  } catch (e) {
    console.error('Error writing local health profile:', e);
  }

  // Save to Firestore
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { healthProfile: profile }, { merge: true });
  } catch (err) {
    console.warn('Could not save health profile to Firestore:', err);
  }
}

