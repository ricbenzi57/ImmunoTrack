
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, History, Beaker, BrainCircuit, Edit3, X, Save, CheckCircle2, AlertCircle, Mail, Pill, ClipboardList, Stethoscope, FileText, Calendar, Printer, TrendingUp, Sparkles, Send, Activity, Trash2, ChevronRight, Table } from 'lucide-react';
import { Patient, Visit, VISIT_TYPES, TherapyEntry, Drug, Exam, ExamResult } from '../types';
import { db } from '../services/db';
import { analyzePatientHistory } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
}

type VisitTab = 'anamnesi' | 'osservazioni' | 'exams' | 'therapy' | 'conclusioni';

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack }) => {
  const [visits, setVisits] = useState<Visit[]>(db.getVisits(patient.id));
  const [drugs, setDrugs] = useState<Drug[]>(db.getDrugs());
  const [availableExams, setAvailableExams] = useState<Exam[]>(db.getExams());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<VisitTab>('anamnesi');
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const initialVisitState: Partial<Visit> = {
    date: new Date().toISOString().split('T')[0],
    visitType: VISIT_TYPES[0],
    reason: '',
    diagnosis: '',
    therapy: Array(6).fill(null).map(() => ({ drug: '', posology: '', duration: '' })),
    doctorNote1: '',
    doctorNote2: '',
    doctorNote3: '',
    conclusionNote: '',
    exams: [],
    paymentAmount: 0,
    isPaid: true
  };

  const [formVisit, setFormVisit] = useState<Partial<Visit>>(initialVisitState);

  useEffect(() => {
    setDrugs(db.getDrugs());
    setAvailableExams(db.getExams());
  }, [isModalOpen]);

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const visit: Visit = {
      ...formVisit as Visit,
      id: editingVisit ? editingVisit.id : crypto.randomUUID(),
      patientId: patient.id,
      customValues: formVisit.customValues || {}
    };
    db.saveVisit(visit);
    setVisits(db.getVisits(patient.id));
    setIsModalOpen(false);
    setEditingVisit(null);
    setFormVisit(initialVisitState);
    setActiveTab('anamnesi');
  };

  const openEdit = (visit: Visit) => {
    setEditingVisit(visit);
    setFormVisit({ ...visit });
    setIsModalOpen(true);
    setActiveTab('anamnesi');
  };

  // Logica Esami Dinamici
  const addExamRow = () => {
    const newExams = [...(formVisit.exams || []), { examId: '', examName: '', group: '', value: '', date: formVisit.date || '' }];
    setFormVisit({ ...formVisit, exams: newExams });
  };

  const removeExamRow = (index: number) => {
    const newExams = [...(formVisit.exams || [])];
    newExams.splice(index, 1);
    setFormVisit({ ...formVisit, exams: newExams });
  };

  const updateExamRow = (index: number, field: keyof ExamResult, value: string) => {
    const newExams = [...(formVisit.exams || [])];
    if (field === 'examId') {
      const examDef = availableExams.find(e => e.id === value);
      if (examDef) {
        newExams[index] = { ...newExams[index], examId: value, examName: examDef.name, group: examDef.group };
      }
    } else {
      newExams[index] = { ...newExams[index], [field]: value };
    }
    setFormVisit({ ...formVisit, exams: newExams });
  };

  const updateTherapyField = (index: number, field: keyof TherapyEntry, value: string) => {
    const newTherapy = [...(formVisit.therapy || [])];
    if (field === 'drug' && value === "Altro...") {
      const custom = prompt("Nuovo farmaco:");
      if (custom) {
        db.saveDrug({ id: crypto.randomUUID(), name: custom, defaultPosology: '', defaultDuration: '' });
        newTherapy[index] = { drug: custom, posology: '', duration: '' };
      }
    } else if (field === 'drug') {
      const d = drugs.find(x => x.name === value);
      newTherapy[index] = { drug: value, posology: d?.defaultPosology || '', duration: d?.defaultDuration || '' };
    } else {
      newTherapy[index] = { ...newTherapy[index], [field]: value };
    }
    setFormVisit({ ...formVisit, therapy: newTherapy });
  };

  // Funzione per raggruppare tutti gli esami del paziente per visualizzazione a colonne
  const getExamHistory = () => {
    const history: Record<string, Record<string, string>> = {};
    const dates = visits.map(v => v.date).sort();
    
    visits.forEach(v => {
      v.exams?.forEach(e => {
        if (!history[e.examName]) history[e.examName] = {};
        history[e.examName][v.date] = e.value;
      });
    });
    return { history, dates };
  };

  const { history: examHistory, dates: examDates } = getExamHistory();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900">{patient.title} {patient.firstName} {patient.lastName}</h2>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Cartella Clinica</span>
            </div>
            <p className="text-xs text-slate-400 uppercase font-black tracking-[0.2em]">{patient.taxCode}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTrend(!showTrend)}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all border ${showTrend ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Table size={20} /> Trend Esami
          </button>
          <button 
            onClick={() => { setEditingVisit(null); setFormVisit(initialVisitState); setIsModalOpen(true); }}
            className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20"
          >
            <Plus size={20} /> Nuova Visita
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {showTrend && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-indigo-100 overflow-hidden animate-in slide-in-from-top duration-300">
            <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <h3 className="font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={20} /> Storico Comparativo Esami
              </h3>
              <button onClick={() => setShowTrend(false)} className="text-indigo-400 hover:text-indigo-600"><X size={20}/></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 sticky left-0 bg-slate-50 z-10">Parametro</th>
                    {examDates.map(d => (
                      <th key={d} className="p-4 text-[10px] font-black text-slate-600 uppercase border-b border-slate-100 text-center min-w-[120px]">
                        {new Date(d).toLocaleDateString()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Object.entries(examHistory).map(([name, vals]) => (
                    <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-700 text-xs border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50">{name}</td>
                      {examDates.map(d => (
                        <td key={d} className="p-4 text-center text-xs font-mono text-slate-600 italic">
                          {vals[d] || '---'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {Object.keys(examHistory).length === 0 && (
                <div className="p-20 text-center text-slate-400 italic">Nessun dato analitico registrato.</div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl text-white col-span-3">
              <h3 className="font-black text-indigo-200 text-[10px] uppercase tracking-widest mb-4">Inquadramento Patologico</h3>
              <div className="text-3xl font-black mb-2 leading-tight uppercase italic">{patient.accessDiagnosis}</div>
           </div>
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Visite Eseguite</p>
              <p className="text-4xl font-black text-teal-600">{visits.length}</p>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-slate-100 font-black text-slate-800 flex items-center justify-between">
            <span className="uppercase tracking-tight">Registro Clinico</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Data</th>
                <th className="px-8 py-6">Tipo</th>
                <th className="px-8 py-6">Diagnosi / Note</th>
                <th className="px-8 py-6 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visits.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-900">{new Date(v.date).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{v.visitType}</span>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium italic text-sm truncate max-w-xs">{v.conclusionNote || '---'}</td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => openEdit(v)} className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-[95vw] h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{editingVisit ? 'Modifica Visita' : 'Nuova Sessione'}</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cartella: {patient.lastName} {patient.firstName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-400 hover:text-slate-600 p-3 rounded-full transition-colors"><X size={28}/></button>
            </div>

            <div className="px-8 flex gap-2 border-b border-slate-100 bg-slate-50 shrink-0 overflow-x-auto">
              {[
                { id: 'anamnesi', label: '1. Anamnesi', icon: ClipboardList },
                { id: 'osservazioni', label: '2. Osservazioni', icon: Edit3 },
                { id: 'exams', label: '3. Esami Lab', icon: Stethoscope },
                { id: 'therapy', label: '4. Terapia', icon: Pill },
                { id: 'conclusioni', label: '5. Conclusioni', icon: FileText }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as VisitTab)}
                  className={`flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all ${
                    activeTab === tab.id ? 'border-teal-500 text-teal-600 bg-white' : 'border-transparent text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveVisit} className="flex-1 overflow-y-auto p-10 bg-white">
              {activeTab === 'anamnesi' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                      <input type="date" className="w-full border-slate-200 rounded-xl p-3 bg-slate-50" value={formVisit.date} onChange={e => setFormVisit({...formVisit, date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                      <select className="w-full border-slate-200 rounded-xl p-3 bg-slate-50" value={formVisit.visitType} onChange={e => setFormVisit({...formVisit, visitType: e.target.value})}>
                        {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Anamnesi Prossima</label>
                    <textarea rows={12} className="w-full border-slate-200 rounded-2xl p-6 bg-slate-50 focus:bg-white transition-all shadow-inner" value={formVisit.doctorNote1} onChange={e => setFormVisit({...formVisit, doctorNote1: e.target.value})} />
                  </div>
                </div>
              )}

              {activeTab === 'osservazioni' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Osservazioni Cliniche</label>
                    <textarea rows={6} className="w-full border-slate-200 rounded-2xl p-6 bg-slate-50 focus:bg-white transition-all shadow-inner" value={formVisit.doctorNote2} onChange={e => setFormVisit({...formVisit, doctorNote2: e.target.value})} placeholder="Esame obiettivo, sintomi attuali..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Note Libere</label>
                    <textarea rows={6} className="w-full border-slate-200 rounded-2xl p-6 bg-slate-50 focus:bg-white transition-all shadow-inner" value={formVisit.doctorNote3} onChange={e => setFormVisit({...formVisit, doctorNote3: e.target.value})} placeholder="Annotazioni temporanee o dettagli aggiuntivi..." />
                  </div>
                </div>
              )}

              {activeTab === 'exams' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Portal Esami di Laboratorio</h4>
                    <button type="button" onClick={addExamRow} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-100 transition-all">
                      <Plus size={14} /> Aggiungi Riga
                    </button>
                  </div>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="p-4 text-left w-1/4">Gruppo</th>
                          <th className="p-4 text-left w-1/3">Esame</th>
                          <th className="p-4 text-left">Risultato / Esito</th>
                          <th className="p-4 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {formVisit.exams?.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-2">
                              <select 
                                className="w-full border-transparent bg-transparent p-2 text-xs font-bold text-slate-600"
                                value={row.group}
                                onChange={(e) => {
                                  // Solo per filtraggio visivo se necessario, ma di solito cambiamo l'esame direttamente
                                  updateExamRow(i, 'group', e.target.value);
                                }}
                              >
                                <option value="">Scegli Gruppo...</option>
                                {Array.from(new Set(availableExams.map(e => e.group))).map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                            </td>
                            <td className="p-2">
                              <select 
                                className="w-full border-transparent bg-transparent p-2 text-xs font-black text-slate-900"
                                value={row.examId}
                                onChange={(e) => updateExamRow(i, 'examId', e.target.value)}
                              >
                                <option value="">Scegli Esame...</option>
                                {availableExams.filter(e => !row.group || e.group === row.group).map(e => (
                                  <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <input 
                                className="w-full border-slate-200 border rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-100 outline-none"
                                value={row.value}
                                placeholder="Inserisci valore..."
                                onChange={(e) => updateExamRow(i, 'value', e.target.value)}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => removeExamRow(i)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(formVisit.exams?.length === 0) && (
                      <div className="p-10 text-center text-slate-400 italic text-xs">Nessun esame aggiunto a questa visita.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'therapy' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-4">
                    Impostazione Farmacologica Consigliata
                  </div>
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400">
                      <tr><th className="p-4 text-left">Farmaco</th><th className="p-4 text-left">Posologia</th><th className="p-4 text-left">Durata</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formVisit.therapy?.map((t, i) => (
                        <tr key={i}>
                          <td className="p-2">
                            <select className="w-full border-transparent bg-transparent p-2 text-sm font-bold" value={t.drug} onChange={e => updateTherapyField(i, 'drug', e.target.value)}>
                              <option value="">-- Seleziona --</option>
                              {drugs.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                              <option value="Altro...">+ Nuovo</option>
                            </select>
                          </td>
                          <td className="p-2"><input className="w-full border-transparent bg-transparent p-2 text-sm" value={t.posology} onChange={e => updateTherapyField(i, 'posology', e.target.value)} /></td>
                          <td className="p-2"><input className="w-full border-transparent bg-transparent p-2 text-sm" value={t.duration} onChange={e => updateTherapyField(i, 'duration', e.target.value)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'conclusioni' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Sintesi Finale e Piano Terapeutico</label>
                  <textarea rows={12} className="w-full border-slate-200 rounded-[2.5rem] p-8 bg-slate-50 shadow-inner focus:bg-white transition-all outline-none" value={formVisit.conclusionNote} onChange={e => setFormVisit({...formVisit, conclusionNote: e.target.value})} placeholder="Concludi la visita definendo i passi successivi e le tempistiche di controllo..." />
                </div>
              )}
            </form>

            <div className="p-8 border-t border-slate-100 bg-white flex justify-end gap-6 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 font-black text-slate-400 hover:bg-slate-100 rounded-2xl transition-all uppercase text-[10px]">Annulla</button>
              <button onClick={handleSaveVisit} className="px-16 py-5 font-black bg-teal-600 text-white rounded-2xl hover:bg-teal-700 shadow-2xl shadow-teal-600/30 flex items-center gap-3 transition-all uppercase text-[10px]">
                <Save size={24} /> Registra Visita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
