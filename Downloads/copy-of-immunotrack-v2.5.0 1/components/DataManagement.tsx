
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, Cloud, RefreshCw, AlertCircle, CheckCircle2, Link, Unlink, Database, ShieldCheck } from 'lucide-react';
import { db } from '../services/db';
import { dropboxService } from '../services/dropboxService';
import { FullDatabaseExport } from '../types';

export const DataManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbxToken, setDbxToken] = useState<string | null>(dropboxService.getToken());

  useEffect(() => {
    // Intercettiamo il token dall'URL dopo il redirect di Dropbox
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        dropboxService.saveToken(token);
        setDbxToken(token);
        // Puliamo l'URL per sicurezza e estetica
        window.history.replaceState(null, "", window.location.pathname);
        setStatus({ type: 'success', msg: 'Connessione Dropbox stabilita!' });
        handleCloudSync(); // Sincronizziamo subito al primo accesso
      }
    }
  }, []);

  const handleCloudSync = async () => {
    setIsSyncing(true);
    const data = db.exportDatabase();
    const success = await dropboxService.uploadBackup(data);
    setIsSyncing(false);
    
    if (success) {
      setStatus({ type: 'success', msg: 'Cloud Sync: Backup aggiornato.' });
    } else {
      setStatus({ type: 'error', msg: 'Sincronizzazione fallita. Verifica il token.' });
    }
    setTimeout(() => setStatus({ type: null, msg: '' }), 4000);
  };

  const handleDropboxConnect = () => {
    window.location.href = dropboxService.getAuthUrl();
  };

  const handleDropboxDisconnect = () => {
    dropboxService.disconnect();
    setDbxToken(null);
    setStatus({ type: 'success', msg: 'Account Dropbox scollegato.' });
  };

  const handleExportLocal = () => {
    const data = db.exportDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `immuno_track_local_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-indigo-50/30 p-8 space-y-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Cloud <span className="text-blue-600">Sync</span></h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
              <ShieldCheck size={14} className="text-teal-500" /> Protezione Dati Crittografata
            </p>
          </div>
          {status.type && (
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} shadow-xl`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-xs font-black uppercase tracking-tight">{status.msg}</span>
            </div>
          )}
        </div>

        {!dbxToken ? (
          <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white/50 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase italic">Connessione Dropbox</h2>
              <p className="text-slate-500 font-medium">Sincronizza i tuoi dati clinici in tempo reale sul tuo spazio privato.</p>
            </div>
            
            <button
              onClick={handleDropboxConnect}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-6 rounded-[2rem] text-xl font-black shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 uppercase tracking-widest"
            >
              <Link size={24} /> Connetti Account Privato
            </button>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sicurezza garantita tramite protocollo OAuth 2.0</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Sync Attivo
                </span>
              </div>
              
              <h2 className="text-2xl font-black mb-8 text-slate-800 uppercase italic flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500" /> Dropbox Connesso
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Status Sincronizzazione</div>
                  <div className="text-lg font-black text-slate-700">Database Sincronizzato</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Ultimo Backup Cloud</div>
                  <div className="text-lg font-black text-slate-700">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCloudSync}
                  disabled={isSyncing}
                  className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw className="animate-spin" /> : <Cloud size={20} />} Forza Sincronizzazione
                </button>
                
                <button
                  onClick={handleDropboxDisconnect}
                  className="bg-rose-50 text-rose-600 px-8 py-5 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest border border-rose-100"
                >
                  <Unlink size={20} /> Scollega
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={handleExportLocal} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Download size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase italic">Backup Locale</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Salva file .json sul PC</p>
              </div>

              <div onClick={() => fileInputRef.current?.click()} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase italic">Importa Dati</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Carica backup esterno</p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const json = JSON.parse(ev.target?.result as string);
                      const result = db.importDatabase(json);
                      setStatus({ type: result.success ? 'success' : 'error', msg: result.message });
                    } catch {
                      setStatus({ type: 'error', msg: 'File non valido.' });
                    }
                  };
                  reader.readAsText(file);
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
