// Validates lib/olympiad/tpr.ts against chess-results' own Rp for the 2024 Olympiad.
// Usage: node scripts/validate-tpr.mjs [path-to-chessSim/data/olympiad]
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dataDir = process.argv[2] ?? path.join(process.env.HOME, 'dev/pawnalyze-old-blog/chessSim/data/olympiad');
const tprSrc = readFileSync(new URL('../lib/olympiad/tpr.ts', import.meta.url), 'utf8');
const DP = tprSrc.match(/DP_TABLE[^=]*=\s*\[([^\]]+)\]/)[1].split(',').map(s => s.trim()).filter(Boolean).map(Number);
if (DP.length !== 101) throw new Error(`dp table has ${DP.length} entries`);

// ---- 2024 games from the broadcast PGNs (rounds 1-9), de-duplicated across feeds
const games = new Map(); // key round|white|black
for (const f of readdirSync(path.join(dataDir, 'pgn')).filter(f => /^rd\d+\.pgn$/.test(f))) {
  const text = readFileSync(path.join(dataDir, 'pgn', f), 'utf8').replace(/\r\n?/g, '\n');
  for (const block of text.split(/\n(?=\[Event )/)) {
    const h = k => (block.match(new RegExp(`\\[${k} "([^"]*)"\\]`)) ?? [])[1];
    const round = Number(h('Round')), white = h('White'), black = h('Black'), result = h('Result');
    if (!round || !white || !black || !['1-0', '0-1', '1/2-1/2'].includes(result)) continue;
    const moves = block.split(/\n\n/)[1] ?? '';
    if (!/\d+\./.test(moves)) continue; // unplayed
    games.set(`${round}|${white}|${black}`, { round, white, black, we: Number(h('WhiteElo')) || 0, be: Number(h('BlackElo')) || 0, result });
  }
}
console.log(`games: ${games.size} across rounds ${[...new Set([...games.values()].map(g => g.round))].sort((a, b) => a - b).join(',')}`);

// ---- per-player game lists
const per = new Map();
const add = (name, opp, score) => { (per.get(name) ?? per.set(name, []).get(name)).push({ opp, score }); };
for (const g of games.values()) {
  const ws = g.result === '1-0' ? 1 : g.result === '0-1' ? 0 : 0.5;
  add(g.white, g.be, ws);
  add(g.black, g.we, 1 - ws);
}

// ---- chess-results player list (Rp, w)
const csv = readFileSync(path.join(dataDir, 'players2024.csv'), 'utf8').split('\n').slice(1);
const players = [];
for (const line of csv) {
  const m = line.match(/^\d+,,[A-Z]*,"([^"]+)",(\d+),(\d+),[A-Z]+,[^,]*,\d,(\d+),([\d.]+),(\d+),/);
  if (m) players.push({ name: m[1], rtg: Number(m[3]), rp: Number(m[4]), w: Number(m[5]), we: Number(m[6]) });
}
// FIDE expected-score table (B.02 8.1b) so we can confirm the game set behind each Rp via the list's "we" column
const PD = readFileSync(path.join(dataDir, '..', 'fidePD.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(',').map(Number));
const expected = (own, opp) => {
  const d = Math.min(400, Math.abs(own - opp));
  const P = PD.find(([lim]) => d <= lim)[1];
  return own >= opp ? P : 1 - P;
};
const sameGameSet = (p, gs) => {
  if (!p.rp || gs.some(g => !g.opp)) return gs.reduce((a, g) => a + g.score, 0) === p.w;
  const we = Math.round(gs.reduce((a, g) => a + expected(p.rtg, g.opp), 0) * 100);
  return gs.reduce((a, g) => a + g.score, 0) === p.w && Math.abs(we - p.we) <= 1;
};
console.log(`players with Rp: ${players.length}`);

const variants = {
  'exclude games vs unrated': (gs) => { const r = gs.filter(g => g.opp); if (!r.length) return 0; return Math.round(r.reduce((a, g) => a + g.opp, 0) / r.length) + DP[Math.round((r.reduce((a, g) => a + g.score, 0) / r.length) * 100)]; },
  'round(avg)+dp, unrated=1400': (gs, U) => Math.round(gs.reduce((a, g) => a + (g.opp || U), 0) / gs.length) + DP[Math.round((gs.reduce((a, g) => a + g.score, 0) / gs.length) * 100)],
  'round(avg+dp), unrated=1400': (gs, U) => Math.round(gs.reduce((a, g) => a + (g.opp || U), 0) / gs.length + DP[Math.round((gs.reduce((a, g) => a + g.score, 0) / gs.length) * 100)]),
  'floor(avg)+dp, unrated=1400': (gs, U) => Math.floor(gs.reduce((a, g) => a + (g.opp || U), 0) / gs.length) + DP[Math.round((gs.reduce((a, g) => a + g.score, 0) / gs.length) * 100)],
  'p truncated, round(avg)': (gs, U) => Math.round(gs.reduce((a, g) => a + (g.opp || U), 0) / gs.length) + DP[Math.floor((gs.reduce((a, g) => a + g.score, 0) / gs.length) * 100 + 1e-9)],
};
for (const [label, fn] of Object.entries(variants)) {
  for (const U of [1400, 1000, 1200, 1800]) {
    let n = 0, exact = 0, within2 = 0, maxDev = 0, nUnr = 0, exactUnr = 0;
    for (const p of players) {
      const gs = per.get(p.name);
      if (!gs) continue;
      const score = gs.reduce((a, g) => a + g.score, 0);
      if (score !== p.w || !sameGameSet(p, gs)) continue; // list scraped at another time
      const tpr = fn(gs, U);
      const dev = Math.abs(tpr - p.rp);
      n++; if (dev === 0) exact++; if (dev <= 2) within2++; maxDev = Math.max(maxDev, dev);
      if (gs.some(g => !g.opp)) { nUnr++; if (dev === 0) exactUnr++; }
    }
    console.log(`${label.padEnd(30)} U=${U}: n=${n} exact=${(100 * exact / n).toFixed(1)}% within2=${(100 * within2 / n).toFixed(1)}% maxDev=${maxDev} | with-unrated-opp n=${nUnr} exact=${nUnr ? (100 * exactUnr / nUnr).toFixed(0) : '-'}%`);
    if (!label.includes('unrated')) break;
  }
}
// worst offenders for the default variant
const fn = variants['round(avg)+dp, unrated=1400'];
const bad = [];
for (const p of players) {
  const gs = per.get(p.name); if (!gs) continue;
  if (!sameGameSet(p, gs)) continue;
  const t = fn(gs, 1400); if (t !== p.rp) bad.push(`${p.name}: ours ${t} vs Rp ${p.rp} (${gs.length} games, opps ${gs.map(g => g.opp).join('/')})`);
}
console.log(bad.slice(0, 8).join('\n'));
