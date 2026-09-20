export type PageType = 'home' | 'about' | 'department' | 'doctor' | 'admin' | 'profile';

export interface VitalsSummary {
  bloodPressure: string;
  heartRate: number;
  spO2: number;
  temperature: string;
  respiratoryRate: number;
  bloodGlucose: string;
  bmi: number;
  weightKg: number;
  heightCm: number;
  lastRecordedDate: string;
}

export interface AllergyItem {
  id: string;
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
  reaction: string;
}

export interface ChronicCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  status: 'Active' | 'Controlled' | 'In Remission';
  managingPhysician: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  purpose: string;
  refillsRemaining: number;
}

export interface PastMedicalProcedure {
  id: string;
  procedureName: string;
  date: string;
  hospital: string;
  surgeon: string;
  notes: string;
  outcome: 'Successful' | 'Routine' | 'Follow-up Needed';
}

export interface ImmunizationRecord {
  id: string;
  vaccineName: string;
  administeredDate: string;
  batchNumber: string;
  clinic: string;
  status: 'Completed' | 'Due' | 'Booster Recommended';
}

export interface DiagnosticReport {
  id: string;
  testName: string;
  category: 'Laboratory' | 'Radiology' | 'Cardiology' | 'Pathology';
  date: string;
  reportingDoctor: string;
  resultStatus: 'Normal' | 'Reviewed' | 'Attention Required';
  summary: string;
  findings: string[];
}

export interface PatientHealthProfile {
  mrn: string;
  bloodGroup: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    status: 'Active' | 'Pending Verification';
    validUntil: string;
  };
  primaryCarePhysician: {
    name: string;
    clinic: string;
    phone: string;
  };
  vitals: VitalsSummary;
  allergies: AllergyItem[];
  chronicConditions: ChronicCondition[];
  medications: MedicationItem[];
  pastProcedures: PastMedicalProcedure[];
  immunizations: ImmunizationRecord[];
  diagnosticReports: DiagnosticReport[];
  organDonorStatus: boolean;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  departmentName: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  bio: string;
  specializations: string[];
  education: string[];
  availableDays: string[];
  availableHours: string;
  consultationFee: number;
  contactEmail: string;
}

export interface Department {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  headDoctor: {
    name: string;
    title: string;
    avatarUrl: string;
  };
  keyServices: string[];
  facilities: string[];
  bedCapacity: number;
  stats: {
    label: string;
    value: string;
  }[];
  opdHours: string;
  emergencyAvailable: boolean;
  bannerImage: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  departmentId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'confirmed' | 'pending';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  location: string;
  department: string;
  doctorName: string;
  content: string;
  rating: number;
  date: string;
}

export interface Facility {
  title: string;
  description: string;
  iconName: string;
  highlight: string;
}
