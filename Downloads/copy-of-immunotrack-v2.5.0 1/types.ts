
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

export const PREDEFINED_DIAGNOSES = [
  "Artrite reumatoide",
  "Lupus eritematoso sistemico",
  "Tiroidite di Hashimoto",
  "Diabete mellito di tipo 1",
  "Sclerosi multipla",
  "Malattia di Graves",
  "Immunodeficienza comune variabile (CVID)",
  "Deficit selettivo di IgA",
  "Agammaglobulinemia di Bruton",
  "Immunodeficienza combinata grave (SCID)",
  "Iper-IgM sindrome",
  "Sindrome di DiGeorge",
  "Rinite allergica",
  "Asma allergica",
  "Orticaria cronica",
  "Dermatite atopica",
  "Anafilassi",
  "Allergie alimentari",
  "Sindrome autoimmune linfoproliferativa (ALPS)",
  "Linfoproliferazione in CVID",
  "Mieloma multiplo",
  "Macroglobulinemia di Waldenstrom",
  "Malattia da deposizione catene leggere",
  "Linfomi in immunodeficienze",
  "Altro..."
];

export const INITIAL_DRUGS: Drug[] = [
  { id: '1', name: "Metotrexato", defaultPosology: "15mg/settimana", defaultDuration: "continuativa" },
  { id: '2', name: "Idrossiclorochina", defaultPosology: "200mg x 2/die", defaultDuration: "continuativa" },
  { id: '3', name: "Levotiroxina", defaultPosology: "100mcg/die", defaultDuration: "continuativa" },
  { id: '4', name: "Insulina", defaultPosology: "secondo schema", defaultDuration: "continuativa" },
  { id: '5', name: "Rituximab", defaultPosology: "1g EV (ciclo)", defaultDuration: "6 mesi" },
  { id: '6', name: "Ocrelizumab", defaultPosology: "300mg/600mg EV", defaultDuration: "6 mesi" },
  { id: '7', name: "Metimazolo", defaultPosology: "5mg x 2/die", defaultDuration: "3 mesi" },
  { id: '8', name: "Immunoglobuline EV", defaultPosology: "0.4g/kg/mese", defaultDuration: "ciclica" },
  { id: '9', name: "Fexofenadina", defaultPosology: "120mg/die", defaultDuration: "30 giorni" },
  { id: '10', name: "Mometasone spray", defaultPosology: "2 spruzzi/narice/die", defaultDuration: "30 giorni" },
  { id: '11', name: "Budesonide", defaultPosology: "400mcg x 2/die", defaultDuration: "continuativa" },
  { id: '12', name: "Formoterolo", defaultPosology: "12mcg x 2/die", defaultDuration: "continuativa" },
  { id: '13', name: "Omalizumab", defaultPosology: "300mg/mese SC", defaultDuration: "6 mesi" },
  { id: '14', name: "Dupilumab", defaultPosology: "300mg/15gg SC", defaultDuration: "continuativa" },
  { id: '15', name: "Adrenalina autoiniettore", defaultPosology: "al bisogno", defaultDuration: "---" },
  { id: '16', name: "Sirolimus", defaultPosology: "2mg/die", defaultDuration: "continuativa" },
  { id: '17', name: "Bortezomib", defaultPosology: "secondo schema", defaultDuration: "ciclo" },
  { id: '18', name: "Desametasone", defaultPosology: "4mg/die", defaultDuration: "10 giorni" },
  { id: '19', name: "Zanubrutinib", defaultPosology: "160mg x 2/die", defaultDuration: "continuativa" }
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
  knownDiagnoses: PREDEFINED_DIAGNOSES,
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
