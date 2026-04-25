import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Partidos } from './pages/Partidos';
import { NuevoPartido } from './pages/NuevoPartido';
import { VerPartido } from './pages/VerPartido';
import { Entrenos } from './pages/Entrenos';
import { NuevoEntreno } from './pages/NuevoEntreno';
import { VerEntreno } from './pages/VerEntreno';
import { Gym } from './pages/Gym';
import { NuevaSesionGym } from './pages/NuevaSesionGym';
import { VerSesionGym } from './pages/VerSesionGym';
import { Fisico } from './pages/Fisico';
import { NuevoTest } from './pages/NuevoTest';
import { VerTest } from './pages/VerTest';
import { Lesiones } from './pages/Lesiones';
import { NuevaLesion } from './pages/NuevaLesion';
import { VerLesion } from './pages/VerLesion';
import { Perfil } from './pages/Perfil';
import { NoEncontrado } from './pages/NoEncontrado';

/**
 * Ruteo principal de la app (Hito 2).
 * Todas las rutas comparten el mismo <Layout /> (header + nav).
 * En hitos siguientes se suman subrutas para formularios (ej: /partidos/nuevo).
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="partidos" element={<Partidos />} />
          <Route path="partidos/nuevo" element={<NuevoPartido />} />
          <Route path="partidos/:id" element={<VerPartido />} />
          <Route path="entrenos" element={<Entrenos />} />
          <Route path="entrenos/nuevo" element={<NuevoEntreno />} />
          <Route path="entrenos/:id" element={<VerEntreno />} />
          <Route path="gym" element={<Gym />} />
          <Route path="gym/nuevo" element={<NuevaSesionGym />} />
          <Route path="gym/:id" element={<VerSesionGym />} />
          <Route path="fisico" element={<Fisico />} />
          <Route path="fisico/nuevo" element={<NuevoTest />} />
          <Route path="fisico/:id" element={<VerTest />} />
          <Route path="lesiones" element={<Lesiones />} />
          <Route path="lesiones/nueva" element={<NuevaLesion />} />
          <Route path="lesiones/:id" element={<VerLesion />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
