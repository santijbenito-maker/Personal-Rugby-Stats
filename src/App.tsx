import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Partidos } from './pages/Partidos';
import { Entrenos } from './pages/Entrenos';
import { Gym } from './pages/Gym';
import { Fisico } from './pages/Fisico';
import { Lesiones } from './pages/Lesiones';
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
          <Route path="entrenos" element={<Entrenos />} />
          <Route path="gym" element={<Gym />} />
          <Route path="fisico" element={<Fisico />} />
          <Route path="lesiones" element={<Lesiones />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
