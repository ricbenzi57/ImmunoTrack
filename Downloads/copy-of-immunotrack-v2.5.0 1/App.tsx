
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { Settings } from './components/Settings';
import { DataManagement } from './components/DataManagement';
import { AppointmentManager } from './components/AppointmentManager';
import { Dashboard } from './components/Dashboard';
import { AccountingManager } from './components/AccountingManager';
import { Prontuario } from './components/Prontuario';
import { ExamsManager } from './components/ExamsManager'; // Nuovo
import { DiagnosesManager } from './components/DiagnosesManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Patient } from './types';
import { db } from './services/db';
import { Lock, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('it_auth') === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.checkPassword(passwordInput)) {
      setIsAuthenticated(true);
      setLoginError(false);
      sessionStorage.setItem('it_auth', 'true');
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('it_auth');
    setPasswordInput('');
  };

  const renderContent = () => {
    if (selectedPatient) return <PatientDetail patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'appointments': return <AppointmentManager />;
      case 'patients': return <PatientList onSelectPatient={setSelectedPatient} />;
      case 'exams': return <ExamsManager />;
      case 'drugs': return <Prontuario />;
      case 'diagnoses': return <DiagnosesManager />;
      case 'accounting': return <AccountingManager />;
      case 'import': return <DataManagement />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-slate-200 animate-in fade-in zoom-in duration-300 text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-teal-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-teal-600/30 mb-4">
               <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase italic">ImmunoTrack</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sistemi Digitali Certificati</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <input 
              type="password" 
              autoFocus
              className={`w-full border rounded-2xl p-4 transition-all focus:outline-none focus:ring-4 ${loginError ? 'border-rose-300 ring-rose-100' : 'border-slate-200 focus:ring-teal-100'}`}
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              placeholder="Password di Accesso" 
            />
            {loginError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">Credenziali Errate</p>}
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
              Esegui Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-slate-50 relative">
        <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 z-30 flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
          <span className="font-bold uppercase tracking-tighter">ImmunoTrack</span>
        </div>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setActiveTab(tab); setSelectedPatient(null); }} 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          onLogout={handleLogout} 
        />
        <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0">
          {renderContent()}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
