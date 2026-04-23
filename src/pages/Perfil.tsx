import { PlaceholderPage } from '../components/PlaceholderPage';
import { IconoPerfil } from '../components/icons';

export function Perfil() {
  return (
    <PlaceholderPage
      titulo="Perfil"
      subtitulo="Tus datos, export e import"
      icono={<IconoPerfil size={32} />}
      descripcion="Datos personales (nombre, edad, club, división, posición), exportar todos tus datos a JSON, importar un backup, o borrar todo con confirmación doble."
      hito="Hito 8"
    />
  );
}
