
import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, Edit, Trash2, X, Save, ArrowUpDown, Clock, SortAsc } from 'lucide-react';
import { db } from '../services/db';
import { Drug } from '../types';

export const Prontuario: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'alpha' | 'date'>('alpha');

  useEffect(() => {
    setDrugs(db.getDrugs());
    const unsub = db.subscribe(() => setDrugs(db.getDrugs()));
    return unsub;
  }, []);

  const sortedDrugs = [...drugs]
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      return 0; // In questo mockup, l'ordine di array è l'ordine cronologico
    });

  const handleSaveDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDrug) {
      db.saveDrug(editingDrug);
      setIsDrugModalOpen(false);
      setEditingDrug(null);
    }
  };

  const handleDeleteDrug = (id: string) => {
    if (confirm("Rimuovere il farmaco dal prontuario?")) db.deleteDrug(id);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Prontuario Farmaci</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Gestione Posologie e Molecole</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setSortBy('alpha')}
            className={`p-2 rounded-lg transition-all ${sortBy === 'alpha' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}
            title="Ordina A-Z"
          >
            <SortAsc size={18} />
          </button>
          <button 
            onClick={() => setSortBy('date')}
            className={`p-2 rounded-lg transition-all ${sortBy === 'date' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}
            title="Ordina per Inserimento"
          >
            <Clock size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cerca farmaco..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingDrug({id: crypto.randomUUID(), name: '', defaultPosology: '', defaultDuration: ''}); setIsDrugModalOpen(true); }}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
          >
            <Plus size={16} /> Nuovo Farmaco
          </button>
        </div>

        <div className="overflow-y-auto max-h-[600px]">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
              <tr>
                <th className="px-8 py-3">Nome Commerciale / Molecola</th>
                <th className="px-8 py-3">Posologia Proposta</th>
                <th className="px-8 py-3">Durata</th>
                <th className="px-8 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedDrugs.map((drug, idx) => (
                <tr key={drug.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} group hover:bg-teal-50/30 transition-colors`}>
                  <td className="px-8 py-2 font-black text-slate-800 text-sm">{drug.name}</td>
                  <td className="px-8 py-2 text-xs font-bold text-slate-500">{drug.defaultPosology || '---'}</td>
                  <td className="px-8 py-2 text-xs font-bold text-slate-500">{drug.defaultDuration || '---'}</td>
                  <td className="px-8 py-2 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingDrug(drug); setIsDrugModalOpen(true); }} className="p-1.5 text-slate-300 hover:text-indigo-600"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteDrug(drug.id)} className="p-1.5 text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDrugModalOpen && editingDrug && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800 uppercase italic">Editor Record</h3>
              <button onClick={() => setIsDrugModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveDrug} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome</label>
                <input required className="w-full border-slate-200 rounded-xl p-4 bg-slate-50 focus:bg-white transition-all font-black text-sm" value={editingDrug.name} onChange={e => setEditingDrug({...editingDrug, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Posologia Default</label>
                  <input className="w-full border-slate-200 rounded-xl p-4 bg-slate-50 focus:bg-white transition-all font-bold text-slate-600 text-sm" value={editingDrug.defaultPosology} onChange={e => setEditingDrug({...editingDrug, defaultPosology: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Durata Default</label>
                  <input className="w-full border-slate-200 rounded-xl p-4 bg-slate-50 focus:bg-white transition-all font-bold text-slate-600 text-sm" value={editingDrug.defaultDuration} onChange={e => setEditingDrug({...editingDrug, defaultDuration: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <Save size={18} /> Salva nel Prontuario
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
