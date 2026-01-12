
export interface Address {
  street: string;
  civicNumber?: string;
  city: string;
  zip: string;
  hamlet?: string;
  province: string;
  nation?: string;
}

export interface ClinicStructure {
  id: string;
  name: string;
  address: string;
  color: string;
}

export interface WorkingDay {
  day: number; // 0-6 (Dom-Sab)
  isEnabled: boolean;
  start: string;
  end: string;
}

export interface Patient {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  taxCode: string;
  birthPlace: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Other';
  referrer?: string;
  emails: string[];
  phones: string[];
  residence: Address;
  domicile: Address;
  accessDiagnosis: string;
  createdAt: string;
}

export interface Drug {
  id: string;
  name: string;
  defaultPosology: string;
  defaultDuration: string;
}

export interface Exam {
  id: string;
  name: string;
  group: string;
  subgroup: string | null;
  test_type: string;
  target: string;
  method: string | null;
}

export interface ExamResult {
  examId: string;
  examName: string;
  group: string;
  value: string;
  date: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  visitType: string;
  reason?: string;
  diagnosis?: string;
  therapy: TherapyEntry[];
  doctorNote1: string;
  doctorNote2: string;
  doctorNote3: string;
  conclusionNote: string;
  exams: ExamResult[];
  customValues: any;
  paymentAmount?: number;
  isPaid?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string; 
  patientName: string;
  patientPhone?: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  isNewPatient: boolean;
  clinicId?: string;
}

export interface AppSettings {
  adminPasswordHash: string;
  customFields: any[];
  schedule: WorkingDay[];
  clinics: ClinicStructure[];
  knownDiagnoses: string[];
  priceList: any[];
  clinicDetails: any;
}

// Added missing interfaces for Gemini service
export interface Attachment {
  mimeType: string;
  base64: string;
}

export interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  error?: boolean;
}

export const TITLES = ["Sig.", "Sig.ra", "Dott.", "Dott.ssa", "Prof.", "Prof.ssa", "Altro..."];
export const VISIT_TYPES = ["Prima Visita", "Verifica Terapia", "Controllo", "Urgenza", "Altro..."];
export interface TherapyEntry { drug: string; posology: string; duration: string; }

// Added missing initial data constants
export const PREDEFINED_DIAGNOSES = [
  "Immunodeficienza Comune Variabile (CVID)",
  "Deficit Selettivo di IgA",
  "Sindrome di DiGeorge",
  "Agammaglobulinemia legata all'X (XLA)",
  "Ipogammaglobulinemia",
  "Altro..."
];

export const INITIAL_DRUGS: Drug[] = [
  { id: '1', name: 'Privigen 10%', defaultPosology: '0.4g/kg ogni 21gg', defaultDuration: 'Cronica' },
  { id: '2', name: 'Hizentra 20%', defaultPosology: '0.1g/kg ogni settimana', defaultDuration: 'Cronica' },
  { id: '3', name: 'Cuvatru 15%', defaultPosology: '0.2g/kg ogni 14gg', defaultDuration: 'Cronica' }
];

export const INITIAL_SCHEDULE: WorkingDay[] = [
  { day: 1, isEnabled: true, start: '09:00', end: '18:00' },
  { day: 2, isEnabled: true, start: '09:00', end: '18:00' },
  { day: 3, isEnabled: true, start: '09:00', end: '18:00' },
  { day: 4, isEnabled: true, start: '09:00', end: '18:00' },
  { day: 5, isEnabled: true, start: '09:00', end: '14:00' },
  { day: 6, isEnabled: false, start: '09:00', end: '13:00' },
  { day: 0, isEnabled: false, start: '09:00', end: '13:00' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  adminPasswordHash: 'admin',
  customFields: [],
  schedule: INITIAL_SCHEDULE,
  clinics: [{ id: '1', name: 'Studio Principale', address: '', color: '#0d9488' }],
  knownDiagnoses: [],
  priceList: [],
  clinicDetails: { name: '', address: '', piva: '', phone: '', email: '' }
};

export interface FullDatabaseExport {
  version: string;
  exportedAt: string;
  lastModified: number;
  patients: Patient[];
  visits: Visit[];
  appointments: Appointment[];
  settings: AppSettings;
  drugs: Drug[];
  exams?: Exam[];
}