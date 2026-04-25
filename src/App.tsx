import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoadingSkeleton } from './components/LoadingSkeleton';

// Code-splitting: cada página se carga bajo demanda (chunk separado).
// Esto baja el bundle inicial: en el primer render sólo entra Layout + dashboard.
// El resto se descarga la primera vez que tocás un tab.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Partidos = lazy(() => import('./pages/Partidos').then((m) => ({ default: m.Partidos })));
const NuevoPartido = lazy(() =>
  import('./pages/NuevoPartido').then((m) => ({ default: m.NuevoPartido })),
);
const VerPartido = lazy(() => import('./pages/VerPartido').then((m) => ({ default: m.VerPartido })));
const Entrenos = lazy(() => import('./pages/Entrenos').then((m) => ({ default: m.Entrenos })));
const NuevoEntreno = lazy(() =>
  import('./pages/NuevoEntreno').then((m) => ({ default: m.NuevoEntreno })),
);
const VerEntreno = lazy(() => import('./pages/VerEntreno').then((m) => ({ default: m.VerEntreno })));
const Gym = lazy(() => import('./pages/Gym').then((m) => ({ default: m.Gym })));
const NuevaSesionGym = lazy(() =>
  import('./pages/NuevaSesionGym').then((m) => ({ default: m.NuevaSesionGym })),
);
const VerSesionGym = lazy(() =>
  import('./pages/VerSesionGym').then((m) => ({ default: m.VerSesionGym })),
);
const Fisico = lazy(() => import('./pages/Fisico').then((m) => ({ default: m.Fisico })));
const NuevoTest = lazy(() => import('./pages/NuevoTest').then((m) => ({ default: m.NuevoTest })));
const VerTest = lazy(() => import('./pages/VerTest').then((m) => ({ default: m.VerTest })));
const Lesiones = lazy(() => import('./pages/Lesiones').then((m) => ({ default: m.Lesiones })));
const NuevaLesion = lazy(() =>
  import('./pages/NuevaLesion').then((m) => ({ default: m.NuevaLesion })),
);
const VerLesion = lazy(() => import('./pages/VerLesion').then((m) => ({ default: m.VerLesion })));
const Perfil = lazy(() => import('./pages/Perfil').then((m) => ({ default: m.Perfil })));
const NoEncontrado = lazy(() =>
  import('./pages/NoEncontrado').then((m) => ({ default: m.NoEncontrado })),
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="partidos"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Partidos />
              </Suspense>
            }
          />
          <Route
            path="partidos/nuevo"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <NuevoPartido />
              </Suspense>
            }
          />
          <Route
            path="partidos/:id"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <VerPartido />
              </Suspense>
            }
          />
          <Route
            path="entrenos"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Entrenos />
              </Suspense>
            }
          />
          <Route
            path="entrenos/nuevo"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <NuevoEntreno />
              </Suspense>
            }
          />
          <Route
            path="entrenos/:id"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <VerEntreno />
              </Suspense>
            }
          />
          <Route
            path="gym"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Gym />
              </Suspense>
            }
          />
          <Route
            path="gym/nuevo"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <NuevaSesionGym />
              </Suspense>
            }
          />
          <Route
            path="gym/:id"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <VerSesionGym />
              </Suspense>
            }
          />
          <Route
            path="fisico"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Fisico />
              </Suspense>
            }
          />
          <Route
            path="fisico/nuevo"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <NuevoTest />
              </Suspense>
            }
          />
          <Route
            path="fisico/:id"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <VerTest />
              </Suspense>
            }
          />
          <Route
            path="lesiones"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Lesiones />
              </Suspense>
            }
          />
          <Route
            path="lesiones/nueva"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <NuevaLesion />
              </Suspense>
            }
          />
          <Route
            path="lesiones/:id"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <VerLesion />
              </Suspense>
            }
          />
          <Route
            path="perfil"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Perfil />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <NoEncontrado />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
