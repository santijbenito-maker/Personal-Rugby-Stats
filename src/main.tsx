import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { sembrarBibliotecaEjercicios } from './db/seed';
import { ToasterProvider } from './components/Toaster';
import './index.css';

// Registra el Service Worker de la PWA. Con autoUpdate, cuando hay
// nueva versión disponible se descarga y se aplica en la próxima visita.
registerSW({ immediate: true });

// Carga la biblioteca base de ejercicios la primera vez que se abre la app.
// Es idempotente: si ya existe, no hace nada.
sembrarBibliotecaEjercicios().catch((err) =>
  console.error('Error al sembrar biblioteca de ejercicios:', err),
);

// Punto de entrada de la app: monta <App /> dentro del div#root de index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToasterProvider>
      <App />
    </ToasterProvider>
  </StrictMode>,
);
