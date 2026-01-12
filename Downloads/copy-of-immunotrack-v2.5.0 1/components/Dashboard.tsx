
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Activity, TrendingUp, Search, Clock, ArrowRight } from 'lucide-react';
import { db } from '../services/db';

export const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState(db.getAppointments(new Date().toISOString().split('T')[0]));
  const patientCount = db.getPatients().length;
  const visitCount = db.getAllVisits().length;

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAppointments(db.getAppointments(new Date().toISOString().split('T')[0]));
    });
    return unsub;
  }, []);

  const stats = [
    { label: 'Pazienti Totali', value: patientCount, icon: Users, color: 'bg-blue-600' },
    { label: 'Visite Effettuate', value: visitCount, icon: Activity, color: 'bg-purple-600' },
    { label: 'Agenda Oggi', value: appointments.length, icon: Calendar, color: 'bg-teal-600' },
    { label: 'Tasso Crescita', value: '+5%', icon: TrendingUp, color: 'bg-emerald-600' },
  ];

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">ImmunoTrack <span className="text-teal-500">v2.5.0</span></h2>
          <p className="text-slate-400 font-medium mt-1 uppercase text-xs tracking-[0.3em]">Clinical Intelligence Dashboard</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessione Attiva</div>
          <div className="text-lg font-black text-slate-800">{new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-default">
              <div className={`${stat.color} w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg shrink-0`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3"><Clock className="text-indigo-600" size={20} /> Appuntamenti Odierni</h3>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-400 border border-slate-200 uppercase">{appointments.length} Slot</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {appointments.map(appt => (
              <div key={appt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-black text-indigo-600 bg-white w-14 py-2 rounded-xl text-center shadow-sm border border-slate-100">{appt.time}</div>
                  <div>
                    <div className="font-black text-slate-900 text-sm uppercase">{appt.patientName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{appt.isNewPatient ? 'Prima Visita' : 'Controllo'}</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20">
                Nessun impegno registrato per oggi.
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden h-[400px]">
          <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-teal-400/20 blur-[100px] rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
             <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">ImmunoTrack AI Assistant</span>
                </div>
                <h3 className="text-3xl font-black mb-4 leading-tight italic">Analisi dei Trend di <br/>Sottopopolazione</h3>
                <p className="text-indigo-200 text-sm font-medium leading-relaxed max-w-sm">I dati recenti mostrano una stabilità terapeutica nel 78% dei pazienti trattati con Immunoglobuline EV.</p>
             </div>
             <button className="bg-white text-indigo-900 font-black uppercase tracking-[0.2em] text-[10px] px-8 py-4 rounded-2xl w-fit shadow-xl hover:bg-indigo-50 transition-all">Genera Analitica Avanzata</button>
          </div>
        </div>
      </div>
    </div>
  );
};
