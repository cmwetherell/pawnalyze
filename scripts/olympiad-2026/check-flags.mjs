// Read-only: asserts every fed_code in the Olympiad tables maps to a flag-icons flag.
// Usage: node --env-file=.env.local scripts/olympiad-2026/check-flags.mjs
import { readFileSync, existsSync } from 'node:fs';
import { sql } from '@vercel/postgres';

const src = readFileSync(new URL('../../lib/olympiad/fedToIso.ts', import.meta.url), 'utf8');
const map = Object.fromEntries([...src.matchAll(/\b([A-Z]{3}):\s*'([a-z-]+)'/g)].map(m => [m[1], m[2]]));
const KNOWN_NO_FLAG = new Set(['FID', 'IBCA', 'IPCA', 'ICSC']);

const { rows } = await sql`SELECT DISTINCT fed_code FROM olympiad_2026_teams ORDER BY 1`;
let bad = 0;
for (const { fed_code } of rows) {
  const iso = map[fed_code];
  if (!iso) {
    if (!KNOWN_NO_FLAG.has(fed_code)) { console.log(`MISSING map: ${fed_code}`); bad++; }
    continue;
  }
  const file = new URL(`../../node_modules/flag-icons/flags/4x3/${iso}.svg`, import.meta.url);
  if (!existsSync(file)) { console.log(`MISSING svg: ${fed_code} -> ${iso}`); bad++; }
}
console.log(`${rows.length} federation codes checked, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
