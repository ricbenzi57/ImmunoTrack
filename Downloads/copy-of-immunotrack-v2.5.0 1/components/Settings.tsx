
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AppSettings, DEFAULT_SETTINGS, ClinicStructure, WorkingDay } from '../types';
import { Save, UserCog, Stethoscope, Building, Clock, MapPin, Plus, Trash2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'clinic' | 'schedule'>('general');

  useEffect(() => {
    setSettings(db.getSettings());
  }, []);

  const handleSave = () => {
    db.saveSettings(settings);
    alert("Impostazioni salvate con successo.");
  };

  const addClinic = () => {
    const newClinic: ClinicStructure = {
      id: crypto.randomUUID(),
      name: 'Nuova Sede',
      address: '',
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setSettings({...settings, clinics: [...settings.clinics, newClinic]});
  };

  const removeClinic = (id: string) => {
    if (settings.clinics.length <= 1) return alert("Deve esserci almeno una sede.");
    setSettings({...settings, clinics: settings.clinics.filter(c => c.id !== id)});
  };

  const updateDay = (dayIndex: number, updates: Partial<WorkingDay>) => {
    const newSchedule = [...settings.schedule];
    const idx = newSchedule.findIndex(d => d.day === dayIndex);
    if (idx > -1) {
      newSchedule[idx] = { ...newSchedule[idx], ...updates };
      setSettings({...settings, schedule: newSchedule});
    }
  };

  const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Pannello <span className="text-teal-600">Configurazione</span></h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Gestione Parametri di Sistema e Operatività</p>
        </div>
        <button onClick={handleSave} className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition-all">
          <Save size={18} /> Applica Modifiche
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'general', label: 'Sicurezza', icon: UserCog },
          { id: 'clinic', label: 'Sedi & Strutture', icon: MapPin },
          { id: 'schedule', label: 'Orari & Palinsesto', icon: Clock }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)} 
            className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeSubTab === tab.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-300">
        {activeSubTab === 'general' && (
          <div className="space-y-6">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2 border-b pb-4"><UserCog size={18} className="text-teal-600"/> Accesso Amministrativo</h3>
            <div className="max-w-md">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password di Sistema</label>
              <input type="password" value={settings.adminPasswordHash} onChange={e => setSettings({...settings, adminPasswordHash: e.target.value})} className="w-full border-slate-200 rounded-xl p-4 bg-slate-50 focus:bg-white transition-all font-bold" />
              <p className="text-[9px] text-slate-400 mt-2 italic font-bold">Questa password verrà richiesta ad ogni avvio dell'applicazione.</p>
            </div>
          </div>
        )}

        {activeSubTab === 'clinic' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2"><MapPin size={18} className="text-teal-600"/> Gestione Sedi Operative</h3>
              <button onClick={addClinic} className="text-teal-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all"><Plus size={16}/> Aggiungi Sede</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {settings.clinics.map((clinic) => (
                <div key={clinic.id} className="flex gap-4 items-end p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Struttura</label>
                        <input value={clinic.name} onChange={e => {
                          const newList = settings.clinics.map(c => c.id === clinic.id ? {...c, name: e.target.value} : c);
                          setSettings({...settings, clinics: newList});
                        }} className="w-full border-slate-200 rounded-xl p-3 bg-white font-bold text-xs" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Indirizzo</label>
                        <input value={clinic.address} onChange={e => {
                          const newList = settings.clinics.map(c => c.id === clinic.id ? {...c, address: e.target.value} : c);
                          setSettings({...settings, clinics: newList});
                        }} className="w-full border-slate-200 rounded-xl p-3 bg-white font-bold text-xs" />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Colore Agenda</label>
                    <input type="color" value={clinic.color} onChange={e => {
                      const newList = settings.clinics.map(c => c.id === clinic.id ? {...c, color: e.target.value} : c);
                      setSettings({...settings, clinics: newList});
                    }} className="h-10 w-16 border-slate-200 rounded-xl bg-white p-1 cursor-pointer" />
                  </div>
                  <button onClick={() => removeClinic(clinic.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'schedule' && (
          <div className="space-y-8">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2 border-b pb-4"><Clock size={18} className="text-teal-600"/> Disponibilità Settimanale</h3>
            <div className="grid grid-cols-1 gap-2">
              {dayNames.map((name, idx) => {
                const config = settings.schedule.find(d => d.day === (idx === 0 ? 0 : idx)) || { day: idx, isEnabled: false, start: '09:00', end: '18:00' };
                return (
                  <div key={idx} className={`flex items-center gap-6 p-4 rounded-2xl border transition-all ${config.isEnabled ? 'bg-white border-teal-100' : 'bg-slate-50 border-transparent opacity-60'}`}>
                    <div className="w-32 flex items-center gap-3">
                      <input type="checkbox" checked={config.isEnabled} onChange={e => updateDay(config.day, { isEnabled: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600">{name}</span>
                    </div>
                    {config.isEnabled && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Dalle</span>
                          <input type="time" value={config.start} onChange={e => updateDay(config.day, { start: e.target.value })} className="border-slate-200 rounded-lg p-2 text-xs font-bold" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Alle</span>
                          <input type="time" value={config.end} onChange={e => updateDay(config.day, { end: e.target.value })} className="border-slate-200 rounded-lg p-2 text-xs font-bold" />
                        </div>
                      </div>
                    )}
                    {!config.isEnabled && <span className="text-[10px] font-black text-slate-300 uppercase italic">Studio Chiuso</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
