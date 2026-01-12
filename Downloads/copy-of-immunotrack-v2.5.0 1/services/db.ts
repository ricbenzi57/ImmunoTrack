
import { 
  Patient, Visit, AppSettings, DEFAULT_SETTINGS, 
  FullDatabaseExport, Appointment, PREDEFINED_DIAGNOSES, 
  Drug, INITIAL_DRUGS, Exam 
} from '../types';
import { dropboxService } from './dropboxService';

const STORAGE_KEYS = {
  PATIENTS: 'it_patients',
  VISITS: 'it_visits',
  SETTINGS: 'it_settings',
  APPOINTMENTS: 'it_appointments',
  DIAGNOSES: 'it_diagnoses',
  DRUGS: 'it_drugs',
  EXAMS: 'it_exams',
  LAST_MODIFIED: 'it_last_modified'
};

const listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
  // Auto-sync silente su Dropbox ad ogni cambiamento se il token esiste
  if (dropboxService.getToken()) {
    const data = db.exportDatabase();
    dropboxService.uploadBackup(data).catch(() => console.debug("Auto-sync failed (offline?)"));
  }
};

const updateTimestamp = () => {
  const now = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, now.toString());
  return now;
};

const INITIAL_EXAMS: Omit<Exam, 'id'>[] = [
    {"name": "EMOCROMO CON FORMULA", "group": "Ematologia", "subgroup": null, "test_type": "Emocromo", "target": "Sangue", "method": "Emocromo completo"},
    {"name": "ELETTROFORESI PROTEICA SIERO", "group": "Proteinogramma", "subgroup": "Siero", "test_type": "Elettroforesi", "target": "Proteine sieriche", "method": "Elettroforesi"},
    {"name": "ANA", "group": "Autoanticorpi", "subgroup": "Nucleo", "test_type": "Autoanticorpi", "target": "ANA", "method": "IFI"},
    {"name": "ACE 2", "group": "Disautonomia", "subgroup": "ACE2", "test_type": "Autoanticorpi", "target": "ACE2", "method": "ELISA"}
];

export const db = {
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.DIAGNOSES)) localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(PREDEFINED_DIAGNOSES));
    if (!localStorage.getItem(STORAGE_KEYS.DRUGS)) localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(INITIAL_DRUGS));
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      const withIds = INITIAL_EXAMS.map(e => ({ ...e, id: crypto.randomUUID() }));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(withIds));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  },

  getExams: (): Exam[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]'),
  saveExam: (exam: Exam) => {
    const exams = db.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    index >= 0 ? exams[index] = exam : exams.push(exam);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    notifyListeners();
  },
  deleteExam: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(db.getExams().filter(e => e.id !== id)));
    notifyListeners();
  },

  getDrugs: (): Drug[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.DRUGS) || '[]'),
  saveDrug: (drug: Drug) => {
    const drugs = db.getDrugs();
    const index = drugs.findIndex(d => d.id === drug.id);
    index >= 0 ? drugs[index] = drug : drugs.push(drug);
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
    notifyListeners();
  },
  deleteDrug: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(db.getDrugs().filter(d => d.id !== id)));
    notifyListeners();
  },

  getSettings: (): AppSettings => JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS)),
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    updateTimestamp();
    notifyListeners();
  },

  getDiagnoses: (): string[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.DIAGNOSES) || '[]'),
  addDiagnosis: (name: string) => {
    const current = db.getDiagnoses();
    if (!current.includes(name)) {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify([...current.filter(d => d !== "Altro..."), name, "Altro..."].sort()));
      notifyListeners();
    }
  },

  getPatients: (): Patient[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]'),
  savePatient: (patient: Patient) => {
    const patients = db.getPatients();
    const index = patients.findIndex(p => p.id === patient.id);
    index >= 0 ? patients[index] = patient : patients.push(patient);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    updateTimestamp();
    notifyListeners();
  },

  getVisits: (patientId?: string): Visit[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]') as Visit[];
    return (patientId ? all.filter(v => v.patientId === patientId) : all).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  getAllVisits: (): Visit[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]'),
  saveVisit: (visit: Visit) => {
    const visits = db.getAllVisits();
    const index = visits.findIndex(v => v.id === visit.id);
    index >= 0 ? visits[index] = visit : visits.push(visit);
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    updateTimestamp();
    notifyListeners();
  },

  getAppointments: (date?: string): Appointment[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]') as Appointment[];
    return (date ? all.filter(a => a.date === date) : all).sort((a, b) => (new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
  },
  saveAppointment: (appt: Appointment) => {
    const appts = db.getAppointments();
    const index = appts.findIndex(a => a.id === appt.id);
    index >= 0 ? appts[index] = appt : appts.push(appt);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appts));
    updateTimestamp();
    notifyListeners();
  },
  deleteAppointment: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(db.getAppointments().filter(a => a.id !== id)));
    updateTimestamp();
    notifyListeners();
  },

  checkPassword: (input: string): boolean => db.getSettings().adminPasswordHash === input,

  exportDatabase: (): FullDatabaseExport => ({
    version: '2.5.0',
    exportedAt: new Date().toISOString(),
    lastModified: Date.now(),
    patients: db.getPatients(),
    visits: db.getAllVisits(),
    appointments: db.getAppointments(),
    settings: db.getSettings(),
    drugs: db.getDrugs(),
    exams: db.getExams()
  }),

  importDatabase: (data: FullDatabaseExport): { success: boolean; message: string } => {
    try {
      if (data.patients) localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data.patients));
      if (data.visits) localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(data.visits));
      if (data.appointments) localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.drugs) localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(data.drugs));
      if (data.exams) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data.exams));
      updateTimestamp();
      notifyListeners();
      return { success: true, message: 'Database ripristinato.' };
    } catch (e) {
      return { success: false, message: 'Errore importazione.' };
    }
  }
};
