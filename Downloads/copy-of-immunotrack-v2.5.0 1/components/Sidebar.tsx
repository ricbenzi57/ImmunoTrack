
import React from 'react';
import { LayoutDashboard, Users, Calendar, Wallet, Settings, Database, LogOut, X, Pill, BookOpen, Beaker } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pazienti', icon: Users },
    { id: 'appointments', label: 'Agenda', icon: Calendar },
    { id: 'exams', label: 'Esami', icon: Beaker }, // Nuova voce Esami
    { id: 'drugs', label: 'Farmaci', icon: Pill },
    { id: 'diagnoses', label: 'Patologie', icon: BookOpen },
    { id: 'accounting', label: 'Contabilità', icon: Wallet },
    { id: 'import', label: 'Dati & Cloud', icon: Database },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
    md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}
      <aside className={sidebarClasses}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-teal-400">Immuno<span className="text-white">Track</span></h1>
          <button className="md:hidden" onClick={onClose}><X size={20} /></button>
        </div>
        <nav className="mt-4 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-rose-400 transition-colors"
          >
            <LogOut size={18} />
            Esci dal Sistema
          </button>
        </div>
      </aside>
    </>
  );
};
