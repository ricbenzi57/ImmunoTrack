
import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Trash2, ArrowUpDown, Clock, SortAsc } from 'lucide-react';
import { db } from '../services/db';

export const DiagnosesManager: React.FC = () => {
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'date'>('alpha');

  useEffect(() => {
    setDiagnoses(db.getDiagnoses());
    const unsub = db.subscribe(() => setDiagnoses(db.getDiagnoses()));
    return unsub;
  }, []);

  const sortedDiagnoses = [...diagnoses]
    .filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a === "Altro...") return 1;
      if (b === "Altro...") return -1;
      if (sortBy === 'alpha') return a.localeCompare(b);
      // In assenza di data di creazione esplicita nel DB semplice attuale, 
      // l'ordine del DB riflette l'ordine di inserimento.
      return 0; 
    });

  const handleAdd = () => {
    const name = prompt("Inserisci il nome della nuova patologia:");
    if (name) db.addDiagnosis(name);
  };

  const handleDelete = (name: string) => {
    if (name === "Altro...") return;
    if (confirm(`Eliminare "${name}" dall'elenco delle patologie?`)) {
      const current = db.getDiagnoses().filter(d => d !== name);
      localStorage.setItem('it_diagnoses', JSON.stringify(current));
      db.subscribe(() => {})(); // Trigger notify
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Archivio Patologie</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Classificazione Diagnostica Interna</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setSortBy('alpha')}
            className={`p-2 rounded-lg transition-all ${sortBy === 'alpha' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            title="Ordina A-Z"
          >
            <SortAsc size={18} />
          </button>
          <button 
            onClick={() => setSortBy('date')}
            className={`p-2 rounded-lg transition-all ${sortBy === 'date' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
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
              placeholder="Filtra patologie..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} /> Nuova
          </button>
        </div>

        <div className="overflow-y-auto max-h-[600px]">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
              <tr>
                <th className="px-8 py-3 w-12">#</th>
                <th className="px-8 py-3">Nome Patologia</th>
                <th className="px-8 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedDiagnoses.map((diag, idx) => (
                <tr key={diag} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} group hover:bg-indigo-50/30 transition-colors`}>
                  <td className="px-8 py-2 text-xs font-bold text-slate-300">{idx + 1}</td>
                  <td className="px-8 py-2 font-bold text-slate-800 text-sm">{diag}</td>
                  <td className="px-8 py-2 text-right">
                    {diag !== "Altro..." && (
                      <button onClick={() => handleDelete(diag)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
