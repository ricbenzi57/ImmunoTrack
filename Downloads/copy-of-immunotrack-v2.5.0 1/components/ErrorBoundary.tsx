
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Ops! Qualcosa è andato storto</h1>
            <p className="text-slate-500 mb-6">Si è verificato un errore critico nell'applicazione. Prova a ricaricare la pagina.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Ricarica Applicazione
            </button>
          </div>
        </div>
      );
    }
    // Fix: Access props using this.props.children
    return this.props.children;
  }
}
