import { PlaceholderPage } from '../components/PlaceholderPage';
import { IconoLesiones } from '../components/icons';

export function Lesiones() {
  return (
    <PlaceholderPage
      titulo="Lesiones"
      subtitulo="Registro y recuperación"
      icono={<IconoLesiones size={32} />}
      descripcion="Registrá lesiones con zona, tipo, gravedad, días perdidos y tratamiento. Si estás sano, la sección muestra 'Todo sano' en verde."
      hito="Hito 7"
    />
  );
}
