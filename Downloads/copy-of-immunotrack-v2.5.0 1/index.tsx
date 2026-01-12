
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { db } from './services/db';

// Inizializza i dati di base se mancano
db.init();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
