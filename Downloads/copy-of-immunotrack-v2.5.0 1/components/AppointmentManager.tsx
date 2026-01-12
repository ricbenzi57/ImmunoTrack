
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, Search, Check, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays, CalendarRange, MapPin } from 'lucide-react';
import { db } from '../services/db';
import { Appointment, Patient, AppSettings, ClinicStructure } from '../types';

type ViewMode = 'month' | 'week' | 'day';

export const AppointmentManager: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(db.getAppointments());
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [newAppt, setNewAppt] = useState<Partial<Appointment>>({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    isNewPatient: false,
    notes: '',
    clinicId: settings.clinics[0]?.id
  });

  useEffect(() => {
    setAppointments(db.getAppointments());
    setSettings(db.getSettings());
  }, []);

  const changeDate = (offset: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + offset);
    else if (viewMode === 'week') newDate.setDate(currentDate.getDate() + (offset * 7));
    else newDate.setDate(currentDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const filteredPatients = db.getPatients().filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient && !newAppt.patientName) return alert("Seleziona un paziente");

    const appt: Appointment = {
      ...newAppt as Appointment,
      id: crypto.randomUUID(),
      patientId: selectedPatient?.id || 'manual',
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : newAppt.patientName || '',
      patientPhone: selectedPatient?.phones[0] || ''
    };

    db.saveAppointment(appt);
    setAppointments(db.getAppointments());
    setIsModalOpen(false);
    setSelectedPatient(null);
    setSearchTerm('');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay: firstDay === 0 ? 6 : firstDay - 1, days };
  };

  const renderMonthView = () => {
    const { firstDay, days } = getDaysInMonth(currentDate);
    const dayLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
    const grid = [];
    
    // Header giorni
    dayLabels.forEach(label => grid.push(<div key={label} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b bg-slate-50/50">{label}</div>));
    
    // Vuoti iniziali
    for (let i = 0; i < firstDay; i++) grid.push(<div key={`empty-${i}`} className="p-4 border-b border-r border-slate-100 bg-slate-50/20"></div>);
    
    // Giorni del mese
    for (let d = 1; d <= days; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAppts = appointments.filter(a => a.date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      grid.push(
        <div key={d} className={`min-h-[120px] p-2 border-b border-r border-slate-100 group transition-all hover:bg-slate-50/50 ${isToday ? 'bg-teal-50/30' : ''}`}>
          <div className={`text-xs font-black mb-2 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400'}`}>
            {d}
          </div>
          <div className="space-y-1">
            {dayAppts.slice(0, 3).map(a => {
              const clinic = settings.clinics.find(c => c.id === a.clinicId);
              return (
                <div key={a.id} className="text-[9px] font-bold p-1.5 rounded-lg border border-slate-100 bg-white shadow-sm truncate flex items-center gap-1.5 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: clinic?.color || '#cbd5e1' }} />
                  <span className="text-slate-500 font-black">{a.time}</span>
                  <span className="text-slate-800 uppercase tracking-tighter">{a.patientName.split(' ')[0]}</span>
                </div>
              );
            })}
            {dayAppts.length > 3 && <div className="text-[8px] font-black text-slate-400 uppercase text-center mt-1">+{dayAppts.length - 3} Altri</div>}
          </div>
        </div>
      );
    }
    
    return <div className="grid grid-cols-7 bg-white border-l border-t border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">{grid}</div>;
  };

  const renderWeekView = () => {
    // Implementazione semplificata per brevità: lista raggruppata per giorni della settimana corrente
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const dayAppts = appointments.filter(a => a.date === dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          
          return (
            <div key={dateStr} className={`bg-white rounded-[2rem] border p-5 space-y-4 shadow-sm min-h-[400px] ${isToday ? 'border-teal-500 ring-4 ring-teal-50' : 'border-slate-100'}`}>
              <div className="text-center border-b pb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date.toLocaleDateString('it-IT', { weekday: 'short' })}</div>
                <div className={`text-2xl font-black mt-1 ${isToday ? 'text-teal-600' : 'text-slate-800'}`}>{date.getDate()}</div>
              </div>
              <div className="space-y-2">
                {dayAppts.map(a => {
                  const clinic = settings.clinics.find(c => c.id === a.clinicId);
                  return (
                    <div key={a.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: clinic?.color || '#cbd5e1' }} />
                      <div className="text-[10px] font-black text-indigo-600 flex items-center gap-1"><Clock size={10}/> {a.time}</div>
                      <div className="text-[11px] font-black text-slate-900 uppercase mt-1 leading-tight">{a.patientName}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase mt-1 flex items-center gap-1"><MapPin size={8}/> {clinic?.name || 'Sede N/A'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayAppts = appointments.filter(a => a.date === dateStr);
    
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
           <div className="absolute right-[-5%] top-[-10%] w-32 h-32 bg-teal-400/20 blur-3xl rounded-full" />
           <div className="relative z-10 flex justify-between items-end">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-2">Pianificazione Giornaliera</div>
                <h3 className="text-3xl font-black uppercase italic">{currentDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-teal-400">{dayAppts.length}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Appuntamenti</div>
              </div>
           </div>
        </div>
        <div className="space-y-3">
          {dayAppts.map(a => {
            const clinic = settings.clinics.find(c => c.id === a.clinicId);
            return (
              <div key={a.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className="text-xl font-black text-indigo-600 w-20 shrink-0 text-center border-r border-slate-100">{a.time}</div>
                <div className="flex-1">
                  <div className="font-black text-slate-900 uppercase italic tracking-tight">{a.patientName}</div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={12}/> {clinic?.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock size={12}/> {a.duration} min</span>
                  </div>
                </div>
                <button 
                  onClick={() => { if(confirm("Cancellare?")) { db.deleteAppointment(a.id); setAppointments(db.getAppointments()); } }}
                  className="p-3 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            );
          })}
          {dayAppts.length === 0 && <div className="p-20 text-center text-slate-400 italic bg-white rounded-[2rem] border border-dashed border-slate-200">Nessun appuntamento per questa data.</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Agenda */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-4 w-full lg:w-auto">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Agenda <span className="text-teal-600">Smart</span></h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Pianificazione Flussi Clinici e Sedi</p>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
            {[
              { id: 'month', label: 'Mese', icon: LayoutGrid },
              { id: 'week', label: 'Settimana', icon: CalendarRange },
              { id: 'day', label: 'Giorno', icon: CalendarDays }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <mode.icon size={14} /> {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronLeft size={20} /></button>
            <div className="text-sm font-black text-slate-800 uppercase italic min-w-[150px] text-center">
              {viewMode === 'month' ? currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : 
               viewMode === 'week' ? `Settimana ${Math.ceil(currentDate.getDate() / 7)}` : 
               currentDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronRight size={20} /></button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-black uppercase text-teal-600 hover:text-teal-700">Oggi</button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-teal-700 shadow-xl shadow-teal-600/20 transition-all w-full lg:w-auto justify-center"
          >
            <Plus size={20} /> Prenota Visita
          </button>
        </div>
      </div>

      {/* Area Calendario */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Modale Inserimento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Planning Visita</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Configurazione Slot Temporale</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors"><X size={32}/></button>
            </div>
            <form onSubmit={handleSaveAppt} className="p-10 space-y-6">
              {!selectedPatient ? (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ricerca Paziente Anagrafica</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      className="w-full border-slate-200 rounded-2xl p-4 pl-14 bg-slate-50 focus:bg-white transition-all font-bold outline-none" 
                      placeholder="Nome, Cognome o CF..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {searchTerm && (
                    <div className="mt-2 border border-slate-100 rounded-2xl max-h-40 overflow-y-auto divide-y shadow-inner bg-slate-50">
                      {filteredPatients.map(p => (
                        <div 
                          key={p.id} 
                          className="p-4 hover:bg-white cursor-pointer flex justify-between items-center transition-colors"
                          onClick={() => { setSelectedPatient(p); setSearchTerm(''); }}
                        >
                          <span className="font-black text-slate-800 uppercase text-xs italic">{p.firstName} {p.lastName}</span>
                          <span className="text-[9px] bg-slate-200 px-2 py-0.5 rounded font-black uppercase text-slate-500">{p.taxCode.slice(0,6)}...</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-teal-50 p-6 rounded-[2rem] border border-teal-100 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">Paziente Selezionato</p>
                    <p className="font-black text-teal-900 text-lg uppercase italic leading-none">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-2 bg-white text-teal-400 hover:text-teal-600 rounded-full shadow-sm transition-all"><X size={18}/></button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Visita</label>
                  <input required type="date" className="w-full border-slate-200 rounded-xl p-4 bg-slate-50 font-bold" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orario</label>
                  <input required type="time" className="w-full border-slate-200 rounded-xl p-4 bg-slate-50 font-bold" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Struttura Clinica / Sede</label>
                <select 
                  className="w-full border-slate-200 rounded-xl p-4 bg-slate-50 font-bold"
                  value={newAppt.clinicId}
                  onChange={e => setNewAppt({...newAppt, clinicId: e.target.value})}
                >
                  {settings.clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                <input type="checkbox" id="newPat" checked={newAppt.isNewPatient} onChange={e => setNewAppt({...newAppt, isNewPatient: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-teal-600" />
                <label htmlFor="newPat" className="text-xs font-black uppercase tracking-tight text-slate-600">Nuova Diagnosi / Prima Visita</label>
              </div>

              <button type="submit" className="w-full py-5 font-black bg-slate-900 text-white rounded-3xl hover:bg-slate-800 shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs">
                <Check size={20} /> Conferma Appuntamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
