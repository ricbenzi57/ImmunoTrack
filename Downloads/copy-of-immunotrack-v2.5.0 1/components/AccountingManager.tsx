
import React from 'react';
import { Wallet, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { db } from '../services/db';

export const AccountingManager: React.FC = () => {
  const visits = db.getAllVisits();
  const totalRevenue = visits.reduce((acc, v) => acc + (v.paymentAmount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contabilità & Fatturazione</h2>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <Wallet size={20} /> Totale: €{totalRevenue.toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Paziente</th>
              <th className="px-6 py-4">Importo</th>
              <th className="px-6 py-4">Stato</th>
              <th className="px-6 py-4 text-right">Fattura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visits.map(v => {
              const patient = db.getPatients().find(p => p.id === v.patientId);
              return (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(v.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">€{v.paymentAmount || 0}</td>
                  <td className="px-6 py-4">
                    {v.isPaid ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase">
                        <CheckCircle2 size={14} /> Pagato
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase">
                        <XCircle size={14} /> In Attesa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-500 transition-colors">
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
