import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { sembrarBibliotecaEjercicios } from './db/seed';
import './index.css';

// Carga la biblioteca base de ejercicios la primera vez que se abre la app.
// Es idempotente: si ya existe, no hace nada.
sembrarBibliotecaEjercicios().catch((err) =>
  console.error('Error al sembrar biblioteca de ejercicios:', err),
);

// Punto de entrada de la app: monta <App /> dentro del div#root de index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
