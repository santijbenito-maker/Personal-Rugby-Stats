import { PlaceholderPage } from '../components/PlaceholderPage';
import { IconoInicio } from '../components/icons';

export function Dashboard() {
  return (
    <PlaceholderPage
      titulo="Inicio"
      subtitulo="Resumen de tu progreso"
      icono={<IconoInicio size={32} />}
      descripcion="Acá vas a ver las métricas del mes (partidos, tries, tackles, PRs), la evolución de tu rating, tu racha de entrenamiento y las próximas actividades."
      hito="Hito 3"
    />
  );
}
