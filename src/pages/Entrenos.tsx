import { PlaceholderPage } from '../components/PlaceholderPage';
import { IconoEntrenos } from '../components/icons';

export function Entrenos() {
  return (
    <PlaceholderPage
      titulo="Entrenos"
      subtitulo="Entrenamientos de rugby"
      icono={<IconoEntrenos size={32} />}
      descripcion="Registrá cada sesión con su tipo (técnico, físico, táctico, partido práctica), esfuerzo (RPE), sensaciones y ejercicios trabajados. Tu racha se calcula automáticamente."
      hito="Hito 5"
    />
  );
}
