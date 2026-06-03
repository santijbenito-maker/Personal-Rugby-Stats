import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { RivalCard } from '../components/RivalCard';
import { IconoMas, IconoRivales } from '../components/icons';
import { normalizarNombreRival } from '../lib/scouting';

/**
 * Lista de rivales con buscador. La cantidad de partidos y récord vs cada
 * rival se calculan en vivo desde la tabla de partidos.
 */
export function Rivales() {
  const rivales = useLiveQuery(
    () => db.rivales.orderBy('nombre').toArray(),
    [],
    [],
  );
  const partidos = useLiveQuery(() => db.partidos.toArray(), [], []);
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = normalizarNombreRival(busqueda);
    if (!q) return rivales;
    return rivales.filter((r) => normalizarNombreRival(r.nombre).includes(q));
  }, [rivales, busqueda]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-7 bg-amarillo-acento rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rivales</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 ml-4">
          Scouting de equipos que enfrentaste o vas a enfrentar
        </p>
      </div>

      {/* Buscador */}
      {rivales.length > 0 && (
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar rival…"
          className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-azul-principal focus:outline-none focus:ring-2 focus:ring-azul-principal/20"
        />
      )}

      {/* Botón cargar */}
      <Link
        to="/rivales/nuevo"
        className="flex items-center justify-center gap-2 w-full bg-amarillo-acento hover:brightness-95 text-azul-oscuro font-bold rounded-xl px-4 py-3.5 shadow-tarjeta transition"
      >
        <IconoMas size={22} strokeWidth={2.5} />
        Nuevo rival
      </Link>

      {/* Lista o empty */}
      {rivales.length === 0 ? (
        <EmptyState />
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-8">
          Ningún rival matchea "{busqueda}".
        </p>
      ) : (
        <div className="space-y-3">
          {filtrados.map((r) => (
            <RivalCard key={r.id} rival={r} partidos={partidos} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amarillo-claro dark:bg-amarillo-acento/10 text-azul-principal dark:text-amarillo-acento">
        <IconoRivales size={28} />
      </div>
      <h2 className="mt-3 font-semibold">Todavía no cargaste rivales</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
        Cargá los equipos que enfrentás para llevar fichas de su forma de jugar y de sus jugadores clave.
        El récord (W-L-E) y los promedios se calculan solos desde tus partidos.
      </p>
    </div>
  );
}
