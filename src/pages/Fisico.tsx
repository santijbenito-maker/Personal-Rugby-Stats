import { PlaceholderPage } from '../components/PlaceholderPage';
import { IconoFisico } from '../components/icons';

export function Fisico() {
  return (
    <PlaceholderPage
      titulo="Físico"
      subtitulo="Tests y evolución corporal"
      icono={<IconoFisico size={32} />}
      descripcion="Peso corporal, altura, velocidad en 40m, beep test, flexiones, abdominales. Gráfico de evolución del peso en el tiempo."
      hito="Hito 7"
    />
  );
}
