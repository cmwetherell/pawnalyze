'use client';

import { useEffect, useRef, useState } from 'react';

import type { EventTable, SimulationRow } from '@/lib/simulations';
import type { Game } from '@/types';

const LIMIT = 10000;

/** "Sin|Esi:1,…", sorted so equal scenarios share one cached response. */
const filterParam = (picks: Game[]): string =>
  picks
    .map(g => `${g.whitePlayer.slice(0, 3)}|${g.blackPlayer.slice(0, 3)}:${g.outcome === 'white' ? 1 : g.outcome === 'draw' ? 0.5 : 0}`)
    .sort()
    .join(',');

async function fetchRows(eventTable: EventTable, filters: string): Promise<SimulationRow[]> {
  const res = await fetch(`/api/sims?eventTable=${eventTable}&limit=${LIMIT}&filters=${encodeURIComponent(filters)}`);
  if (!res.ok) throw new Error(`Simulations: ${res.status}`);
  return res.json();
}

type Status = 'idle' | 'loading' | 'error';

/** The stored simulations of an event, and those that match a scenario. `initialData` is the unfiltered set, when the server has it. */
export function useSimulations(eventTable: EventTable, initialData?: SimulationRow[]) {
  const [rows, setRows] = useState<SimulationRow[] | null>(initialData ?? null);
  const [status, setStatus] = useState<Status>(initialData ? 'idle' : 'loading');
  /** The rows on show answer a scenario. */
  const [filtered, setFiltered] = useState(false);
  const cache = useRef(new Map<string, SimulationRow[]>());
  const latest = useRef(0);

  const show = (key: string, data: SimulationRow[]) => {
    setRows(data);
    setFiltered(key !== '');
    setStatus('idle');
  };

  useEffect(() => {
    if (initialData) return;
    const run = ++latest.current;
    let here = true;
    const current = () => here && run === latest.current;
    fetchRows(eventTable, '').then(
      data => {
        if (!current()) return;
        cache.current.set('', data);
        setRows(data);
        setStatus('idle');
      },
      error => { console.error('Failed to fetch:', error); if (current()) setStatus('error'); },
    );
    return () => { here = false; };
  }, [eventTable, initialData]);

  const load = async (picks: Game[]) => {
    const run = ++latest.current;
    const key = filterParam(picks);
    const known = key === '' && initialData ? initialData : cache.current.get(key);
    if (known) { show(key, known); return; }
    setStatus('loading');
    try {
      const data = await fetchRows(eventTable, key);
      cache.current.set(key, data);
      if (run === latest.current) show(key, data);
    } catch (error) {
      console.error('Failed to fetch:', error);
      if (run === latest.current) setStatus('error');
    }
  };

  return { rows, status, filtered, load };
}
