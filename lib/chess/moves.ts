/** Words and axis for the positions of a game. `ply` 0 is the start; `ply` n follows the nth half-move. */

/** "12. Nf3", "12… Nc6", "Start". */
export function moveLabel(p: { ply: number; san: string | null }): string {
  if (p.ply === 0) return 'Start';
  const no = Math.ceil(p.ply / 2);
  if (!p.san) return `Move ${no}, ${p.ply % 2 ? 'White' : 'Black'}`;
  return `${no}${p.ply % 2 ? '.' : '…'} ${p.san}`;
}

/** An x axis of `plies + 1` positions that names every 5th, 10th or 20th move. */
export function moveAxis(plies: number): { labels: string[]; every: { desktop: number; phone: number } } {
  const step = plies > 120 ? 40 : plies > 60 ? 20 : 10;
  return {
    labels: Array.from({ length: plies + 1 }, (_, i) => (i === 0 ? 'Start' : i % 2 ? '' : String(i / 2))),
    every: { desktop: step, phone: plies > 160 ? 80 : Math.max(20, step) },
  };
}
