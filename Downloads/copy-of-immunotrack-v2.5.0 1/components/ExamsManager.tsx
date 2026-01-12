
import React, { useState, useEffect } from 'react';
import { Beaker, Plus, Search, Edit, Trash2, X, Save, Filter, ChevronRight } from 'lucide-react';
import { db } from '../services/db';
import { Exam } from '../types';

export const ExamsManager: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Tutti');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  useEffect(() => {
    setExams(db.getExams());
    const unsub = db.subscribe(() => setExams(db.getExams()));
    return unsub;
  }, []);

  const groups = ['Tutti', ...Array.from(new Set(exams.map(e => e.group)))];

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'Tutti' || e.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExam) {
      db.saveExam(editingExam);
      setIsModalOpen(false);
      setEditingExam(null);
    }
  };

  const handleDeleteExam = (id: string) => {
    if (confirm("Rimuovere definitivamente questo esame dal database?")) {
      db.deleteExam(id);
    }
  };

  const openNewModal = () => {
    setEditingExam({
      id: crypto.randomUUID(),
      name: '',
      group: selectedGroup !== 'Tutti' ? selectedGroup : '',
      subgroup: '',
      test_type: '',
      target: '',
      method: ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Database <span className="text-teal-600">Esami</span></h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2">Pannello Analisi Cliniche e Diagnostiche</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-teal-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition-all"
        >
          <Plus size={20} /> Aggiungi Esame
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filtri */}
        <div className="w-full lg:w-64 space-y-4 shrink-0">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Filter size={14} /> Filtra per Gruppo
            </h3>
            <div className="space-y-1">
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGroup(g)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    selectedGroup === g ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Elenco Esami */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cerca esame, target o molecola..." 
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-teal-500/10 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Esame / Parametro</th>
                  <th className="px-8 py-5">Gruppo</th>
                  <th className="px-8 py-5">Tipo & Target</th>
                  <th className="px-8 py-5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExams.map(exam => (
                  <tr key={exam.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-800 text-sm">{exam.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{exam.method || 'Metodo standard'}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                        {exam.group} {exam.subgroup ? `/ ${exam.subgroup}` : ''}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-bold text-slate-600">{exam.test_type}</div>
                      <div className="text-[10px] text-teal-600 font-black uppercase">{exam.target}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingExam(exam); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm"><Edit size={18}/></button>
                        <button onClick={() => handleDeleteExam(exam.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExams.length === 0 && (
              <div className="p-20 text-center text-slate-400 italic">Nessun esame trovato nei criteri selezionati.</div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && editingExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Editor Parametro</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Configurazione Database Analitico</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full"><X size={32}/></button>
            </div>
            <form onSubmit={handleSaveExam} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome Esame Completo</label>
                  <input required className="w-full border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white transition-all font-black text-lg" value={editingExam.name} onChange={e => setEditingExam({...editingExam, name: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gruppo Principale</label>
                  <input required className="w-full border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white transition-all font-bold" value={editingExam.group} onChange={e => setEditingExam({...editingExam, group: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sottogruppo</label>
                  <input className="w-full border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white transition-all font-bold" value={editingExam.subgroup || ''} onChange={e => setEditingExam({...editingExam, subgroup: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo di Test</label>
                  <input className="w-full border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white transition-all font-bold" value={editingExam.test_type} onChange={e => setEditingExam({...editingExam, test_type: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target / Analita</label>
                  <input className="w-full border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white transition-all font-bold" value={editingExam.target} onChange={e => setEditingExam({...editingExam, target: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Metodologia</label>
                  <input className="w-full border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white transition-all font-bold" value={editingExam.method || ''} onChange={e => setEditingExam({...editingExam, method: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl hover:bg-teal-700 shadow-2xl shadow-teal-600/30 uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all">
                <Save size={24} /> Registra nel Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
