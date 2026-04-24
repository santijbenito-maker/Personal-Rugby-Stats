import type { Clima } from '../../types';
import { IconoSol, IconoNube, IconoLluvia, IconoFrio } from '../icons';

type WeatherPickerProps = {
  valor?: Clima;
  onChange: (v: Clima | undefined) => void;
};

const opciones: { valor: Clima; label: string; Icono: typeof IconoSol }[] = [
  { valor: 'Soleado', label: 'Soleado', Icono: IconoSol },
  { valor: 'Nublado', label: 'Nublado', Icono: IconoNube },
  { valor: 'Lluvia', label: 'Lluvia', Icono: IconoLluvia },
  { valor: 'Frío', label: 'Frío', Icono: IconoFrio },
];

/**
 * Selector de clima con 4 botones + íconos. Toggle: tocarlo de nuevo deselecciona.
 */
export function WeatherPicker({ valor, onChange }: WeatherPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {opciones.map(({ valor: v, label, Icono }) => {
        const activo = v === valor;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(activo ? undefined : v)}
            className={[
              'flex flex-col items-center justify-center gap-1 rounded-lg p-2 border transition',
              activo
                ? 'bg-azul-principal text-white border-azul-principal shadow'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-azul-principal/50',
            ].join(' ')}
            aria-pressed={activo}
          >
            <Icono size={22} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
