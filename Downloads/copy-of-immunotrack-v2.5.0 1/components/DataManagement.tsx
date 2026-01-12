
import React, { useRef, useState } from 'react';
import { Download, Upload, Cloud, RefreshCw, AlertCircle, CheckCircle2, FileJson } from 'lucide-react';
import { db } from '../services/db';
import { FullDatabaseExport } from '../types';

export const DataManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const data = db.exportDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `immuno_track_backup_${dateStr}.json`;
    a.click();
    
    setStatus({ type: 'success', msg: 'Backup generato e scaricato correttamente.' });
    setTimeout(() => setStatus({ type: null, msg: '' }), 4000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as FullDatabaseExport;
        const result = db.importDatabase(json);
        
        if (result.success) {
          setStatus({ type: 'success', msg: result.message });
        } else {
          setStatus({ type: 'error', msg: result.message });
        }
      } catch (err) {
        setStatus({ type: 'error', msg: "Errore durante la lettura del file. Assicurati che sia un file JSON valido." });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestione Dati & Cloud Sync</h2>
          <p className="text-slate-500 font-medium mt-1">Esporta i tuoi dati clinici localmente o effettua il ripristino da un backup.</p>
        </div>
        {status.type && (
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold">{status.msg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Box Esportazione */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 group hover:border-teal-200 transition-all">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Download size={32} />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900">Backup Completo</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">Scarica un archivio protetto contenente l'intera anagrafica pazienti, lo storico delle visite, la contabilità e l'agenda.</p>
          </div>
          <button 
            onClick={handleExport}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
          >
            Genera file di Backup (.json)
          </button>
        </div>

        {/* Box Importazione */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 group hover:border-indigo-200 transition-all">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900">Ripristino Dati</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">Seleziona un file di backup precedentemente creato per importare o aggiornare i dati nel sistema attuale.</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/10 disabled:opacity-50"
          >
            {isImporting ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <FileJson size={20} />
            )}
            {isImporting ? 'Elaborazione...' : 'Ripristina da File'}
          </button>
        </div>
      </div>

      {/* Sezione Cloud (Placeholder per futura espansione) */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">Feature Premium</div>
              <h3 className="text-2xl font-black">Sincronizzazione Cloud</h3>
            </div>
            <p className="text-slate-400 max-w-md font-medium">Attiva la sincronizzazione automatica per accedere ai tuoi dati clinici in tempo reale da qualsiasi postazione autorizzata.</p>
          </div>
          <button className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all flex items-center gap-3 whitespace-nowrap">
            <Cloud size={20} /> Attiva Servizio Cloud
          </button>
        </div>
      </div>
    </div>
  );
};
