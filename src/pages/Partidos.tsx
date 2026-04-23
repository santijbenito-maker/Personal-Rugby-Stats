import { PlaceholderPage } from '../components/PlaceholderPage';
import { IconoPartidos } from '../components/icons';

export function Partidos() {
  return (
    <PlaceholderPage
      titulo="Partidos"
      subtitulo="Cargá y revisá cada partido jugado"
      icono={<IconoPartidos size={32} />}
      descripcion="Lista de partidos con resultado, rival, clima, minutos jugados y stats detalladas (tries, tackles, kicks, rol 9/10, sensaciones y notas)."
      hito="Hito 4"
    />
  );
}
