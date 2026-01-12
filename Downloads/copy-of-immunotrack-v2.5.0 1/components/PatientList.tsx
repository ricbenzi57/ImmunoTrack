
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Patient, TITLES, PREDEFINED_DIAGNOSES } from '../types';
import { Search, UserPlus, Edit, X, MapPin, Phone, Mail, GraduationCap } from 'lucide-react';

interface PatientListProps {
  onSelectPatient: (p: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  
  const initialPatientState: Partial<Patient> = {
    title: 'Sig.',
    firstName: '',
    lastName: '',
    taxCode: '',
    birthPlace: '',
    birthDate: '',
    gender: 'M',
    emails: ['', ''],
    phones: ['', ''],
    residence: { street: '', city: '', zip: '', province: '' },
    accessDiagnosis: PREDEFINED_DIAGNOSES[0]
  };

  const [formPatient, setFormPatient] = useState<Partial<Patient>>(initialPatientState);

  useEffect(() => {
    setDiagnoses(db.getDiagnoses());
  }, [isModalOpen]);

  const calculateAge = (dateString: string) => {
    if (!dateString) return '--';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getPrimaryPhone = (p: Patient) => {
    // Priorità: Cellulare (index 1) poi Fisso (index 0)
    return p.phones[1] || p.phones[0] || '---';
  };

  const handleZipChange = (zip: string) => {
    const residence = { ...formPatient.residence!, zip };
    // Simulazione lookup CAP (estendibile con DB comuni)
    if (zip === '00100') { residence.city = 'Roma'; residence.province = 'RM'; }
    if (zip === '20100') { residence.city = 'Milano'; residence.province = 'MI'; }
    if (zip === '10100') { residence.city = 'Torino'; residence.province = 'TO'; }
    if (zip === '80100') { residence.city = 'Napoli'; residence.province = 'NA'; }
    setFormPatient({ ...formPatient, residence });
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const patient: Patient = {
      ...formPatient as Patient,
      id: editingPatientId || crypto.randomUUID(),
      createdAt: formPatient.createdAt || new Date().toISOString(),
      domicile: formPatient.residence!
    };
    db.savePatient(patient);
    setIsModalOpen(false);
    setEditingPatientId(null);
    setFormPatient(initialPatientState);
  };

  const handleEditClick = (e: React.MouseEvent, p: Patient) => {
    e.stopPropagation(); 
    setEditingPatientId(p.id);
    setFormPatient({ ...p });
    setIsModalOpen(true);
  };

  const handleDiagnosisChange = (val: string) => {
    if (val === "Altro...") {
      const custom = prompt("Inserisci nuova patologia:");
      if (custom) {
        db.addDiagnosis(custom);
        setDiagnoses(db.getDiagnoses());
        setFormPatient({ ...formPatient, accessDiagnosis: custom });
      }
    } else {
      setFormPatient({ ...formPatient, accessDiagnosis: val });
    }
  };

  const patients = db.getPatients().filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.taxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.residence.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Anagrafica Pazienti</h2>
        <button 
          onClick={() => { setEditingPatientId(null); setFormPatient(initialPatientState); setIsModalOpen(true); }}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 font-semibold"
        >
          <UserPlus size={20} /> Nuovo Paziente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cerca per nome, cognome, città o CF..." 
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 bg-white shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">Paziente</th>
              <th className="px-6 py-5">Città</th>
              <th className="px-6 py-5">Recapito</th>
              <th className="px-6 py-5">Età</th>
              <th className="px-6 py-5">Diagnosi Accesso</th>
              <th className="px-6 py-5 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map(p => (
              <tr 
                key={p.id} 
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                onClick={() => onSelectPatient(p)}
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{p.title} {p.firstName} {p.lastName}</div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">{p.taxCode}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 font-medium flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-300" />
                    {p.residence.city} ({p.residence.province})
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 font-semibold flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-300" />
                    {getPrimaryPhone(p)}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-semibold text-sm">{calculateAge(p.birthDate)} <span className="text-[10px] font-normal text-slate-400 uppercase ml-1">Anni</span></td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                    {p.accessDiagnosis}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                    onClick={(e) => handleEditClick(e, p)}
                    title="Modifica Anagrafica"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && (
          <div className="p-20 text-center text-slate-400 italic">Nessun paziente trovato con i parametri di ricerca.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingPatientId ? 'Modifica Anagrafica' : 'Nuova Scheda Anagrafica'}</h3>
                <p className="text-slate-500 text-sm">Inserisci o aggiorna i dati del paziente per la cartella clinica.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingPatientId(null); }} className="bg-slate-100 text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSavePatient} className="p-8 overflow-y-auto space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest">
                  <GraduationCap size={16} /> Identità e Nascita
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Titolo</label>
                    <select className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.title} onChange={e => setFormPatient({...formPatient, title: e.target.value})}>
                      {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nome</label>
                    <input required className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.firstName} onChange={e => setFormPatient({...formPatient, firstName: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Cognome</label>
                    <input required className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.lastName} onChange={e => setFormPatient({...formPatient, lastName: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nato a</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.birthPlace} onChange={e => setFormPatient({...formPatient, birthPlace: e.target.value})} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Il (Data)</label>
                    <input type="date" className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.birthDate} onChange={e => setFormPatient({...formPatient, birthDate: e.target.value})} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Codice Fiscale</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all font-mono" value={formPatient.taxCode} onChange={e => setFormPatient({...formPatient, taxCode: e.target.value.toUpperCase()})} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest pt-4">
                  <MapPin size={16} /> Residenza
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Via / Piazza</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.residence?.street} onChange={e => setFormPatient({...formPatient, residence: {...formPatient.residence!, street: e.target.value}})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">C.A.P.</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.residence?.zip} onChange={e => handleZipChange(e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Città</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.residence?.city} onChange={e => setFormPatient({...formPatient, residence: {...formPatient.residence!, city: e.target.value}})} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Prov.</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all uppercase" maxLength={2} value={formPatient.residence?.province} onChange={e => setFormPatient({...formPatient, residence: {...formPatient.residence!, province: e.target.value}})} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase tracking-widest pt-4">
                  <Phone size={16} /> Contatti
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tel. Casa</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.phones?.[0]} onChange={e => setFormPatient({...formPatient, phones: [e.target.value, formPatient.phones![1]]})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Mob. (Cellulare)</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.phones?.[1]} onChange={e => setFormPatient({...formPatient, phones: [formPatient.phones![0], e.target.value]})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email 1</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.emails?.[0]} onChange={e => setFormPatient({...formPatient, emails: [e.target.value, formPatient.emails![1]]})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email 2</label>
                    <input className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white transition-all" value={formPatient.emails?.[1]} onChange={e => setFormPatient({...formPatient, emails: [formPatient.emails![0], e.target.value]})} />
                  </div>
                </div>
              </section>

              <section className="bg-slate-50 p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-indigo-600 font-black text-xs uppercase tracking-widest">Inquadramento Diagnostico</div>
                  <div className="text-sm font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-lg">
                    Età Calcolata: {calculateAge(formPatient.birthDate!)} anni
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Diagnosi di Accesso</label>
                  <select 
                    className="w-full border-slate-200 rounded-xl p-3.5 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold"
                    value={formPatient.accessDiagnosis}
                    onChange={e => handleDiagnosisChange(e.target.value)}
                  >
                    {diagnoses.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </section>

              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingPatientId(null); }} className="px-8 py-3.5 font-bold text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">Annulla</button>
                <button type="submit" className="px-10 py-3.5 font-bold bg-teal-600 text-white rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition-all">
                  {editingPatientId ? 'Aggiorna Dati' : 'Salva Anagrafica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
