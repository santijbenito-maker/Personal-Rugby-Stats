import type { Partido } from '../types';
import { ResultadoBadge, tipoResultado } from './ResultadoBadge';
import { formatoCorto } from '../lib/fechas';

type ResumenPartidoProps = {
  partido: Partido;
};

/**
 * Resumen en tiempo real del partido que se está cargando.
 * Aparece al final del formulario y se actualiza a medida que el usuario
 * llena los campos. Muestra porcentajes calculados (ej: pases 8/10 = 80%).
 */
export function ResumenPartido({ partido: p }: ResumenPartidoProps) {
  const tipo = tipoResultado(p);
  const colorScore =
    tipo === 'ganamos'
      ? 'text-azul-principal dark:text-amarillo-acento'
      : tipo === 'perdimos'
        ? 'text-rojo'
        : 'text-slate-500';

  const pctPase =
    p.pasesIntentados > 0
      ? Math.round((p.pasesCompletados / p.pasesIntentados) * 100)
      : null;
  const pctTackles =
    p.tacklesIntentados > 0
      ? Math.round((p.tacklesEfectivos / p.tacklesIntentados) * 100)
      : null;
  const pctKicksPalo =
    p.kicksPaloIntentados > 0
      ? Math.round((p.kicksPaloConvertidos / p.kicksPaloIntentados) * 100)
      : null;
  const pctKicksTouch =
    p.kicksTouchIntentados > 0
      ? Math.round((p.kicksTouchEfectivos / p.kicksTouchIntentados) * 100)
      : null;
  const rolPromedio = ((p.velocidadRuck + p.calidadPase + p.lecturaJuego) / 3).toFixed(1);

  return (
    <section className="bg-gradient-to-br from-azul-principal to-azul-oscuro text-white rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-block w-1 h-5 bg-amarillo-acento rounded-full" />
        <h2 className="font-semibold">Resumen del partido</h2>
      </div>

      {/* Header: torneo · fecha · resultado */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-amarillo-claro/80">
            {p.torneo} · {formatoCorto(p.fecha)} · {p.condicion}
          </p>
          <p className="mt-0.5 font-bold text-lg leading-tight truncate">
            vs {p.rival || <span className="opacity-60 italic">(rival)</span>}{' '}
            <span className={[colorScore, 'ml-1'].join(' ')}>
              {p.puntosPropios}-{p.puntosRival}
            </span>
          </p>
        </div>
        <ResultadoBadge partido={p} />
      </div>

      {/* Meta */}
      <p className="text-xs text-amarillo-claro/80 mb-4">
        {p.clima && `${p.clima} · `}
        {p.posicion} · {p.minutos} min {p.capitan ? '· Capitán' : `· ${p.comoEntre}`}
      </p>

      {/* Líneas de resumen */}
      <ul className="text-sm space-y-1.5 border-t border-white/10 pt-3">
        <LineaResumen
          titulo="Ataque"
          valor={
            [
              `${p.tries} try${p.tries === 1 ? '' : 's'}`,
              `${p.asistencias} asist`,
              `${p.metrosGanados}m`,
              pctPase !== null ? `pases ${p.pasesCompletados}/${p.pasesIntentados} = ${pctPase}%` : null,
              (p.knockOns ?? 0) > 0 ? `${p.knockOns} knock-on${p.knockOns === 1 ? '' : 's'}` : null,
              (p.usoPie ?? 0) > 0 ? `pie ×${p.usoPie}` : null,
            ]
              .filter(Boolean)
              .join(' · ')
          }
        />
        <LineaResumen
          titulo="Defensa"
          valor={
            [
              pctTackles !== null
                ? `tackles ${p.tacklesEfectivos}/${p.tacklesIntentados} = ${pctTackles}%`
                : `${p.tacklesEfectivos} tackles`,
              `${p.turnoversGanados} turnovers`,
              p.intercepciones > 0 ? `${p.intercepciones} intercep.` : null,
              (p.recepcionKicks ?? 0) > 0 ? `${p.recepcionKicks} recepciones` : null,
              `cobertura ${p.coberturas ?? 3}/5`,
              p.kicksDespeje > 0 ? `${p.kicksDespeje} despejes` : null,
            ]
              .filter(Boolean)
              .join(' · ')
          }
        />
        <LineaResumen
          titulo="Kicks"
          valor={
            [
              pctKicksPalo !== null
                ? `palo ${p.kicksPaloConvertidos}/${p.kicksPaloIntentados} = ${pctKicksPalo}%`
                : null,
              pctKicksTouch !== null
                ? `touch ${p.kicksTouchEfectivos}/${p.kicksTouchIntentados} = ${pctKicksTouch}%`
                : null,
              p.drops > 0 ? `${p.drops} drops` : null,
            ]
              .filter(Boolean)
              .join(' · ') || '—'
          }
        />
        <LineaResumen
          titulo="Rol 9/10"
          valor={`promedio ${rolPromedio}/10 (ruck ${p.velocidadRuck} · pase ${p.calidadPase} · lectura ${p.lecturaJuego})`}
        />
        {(p.penalesCometidos > 0 || p.amarillas > 0 || p.rojas > 0) && (
          <LineaResumen
            titulo="Disciplina"
            valor={`${p.penalesCometidos} penales${p.amarillas ? ` · ${p.amarillas} amarilla${p.amarillas === 1 ? '' : 's'}` : ''}${p.rojas ? ` · ${p.rojas} roja${p.rojas === 1 ? '' : 's'}` : ''}`}
          />
        )}
        <LineaResumen
          titulo="Sensaciones"
          valor={`💪 ${p.sensacionFisico}/10 · 🎯 ${p.sensacionTecnico}/10 · ⭐ rating ${p.rating}/10`}
        />
      </ul>
    </section>
  );
}

function LineaResumen({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <li className="flex gap-2 text-xs md:text-sm">
      <span className="font-semibold text-amarillo-acento min-w-[80px]">{titulo}:</span>
      <span className="text-white/90 flex-1">{valor}</span>
    </li>
  );
}
