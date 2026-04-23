import { PlaceholderPage } from '../components/PlaceholderPage';
import { IconoGym } from '../components/icons';

export function Gym() {
  return (
    <PlaceholderPage
      titulo="Gym"
      subtitulo="Gimnasio y fuerza"
      icono={<IconoGym size={32} />}
      descripcion="Registrá sesiones con ejercicios, series, peso, reps y RIR. Detección automática de PRs y gráficos de progresión para sentadilla y press banca."
      hito="Hito 6"
    />
  );
}
