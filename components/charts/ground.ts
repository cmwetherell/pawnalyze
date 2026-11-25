/** What a chart sits on: marks and labels are cut out of it with a halo of the same color. */
export type Ground = 'auto' | 'canvas' | 'surface' | 'raised';

/** `auto` follows the page: canvas, surface in a surface SectionGroup or in a Panel, raised in a Panel on one. A Sheet or menu has to say. Full class names, so Tailwind finds them. */
export const groundStroke: Record<Ground, string> = {
  auto: 'stroke-canvas group-data-[panel]/panel:stroke-surface group-data-[ground=surface]/ground:stroke-surface group-data-[ground=surface]/ground:group-data-[panel]/panel:stroke-raised',
  canvas: 'stroke-canvas',
  surface: 'stroke-surface',
  raised: 'stroke-raised',
};
export const groundFill: Record<Ground, string> = {
  auto: 'fill-canvas group-data-[panel]/panel:fill-surface group-data-[ground=surface]/ground:fill-surface group-data-[ground=surface]/ground:group-data-[panel]/panel:fill-raised',
  canvas: 'fill-canvas',
  surface: 'fill-surface',
  raised: 'fill-raised',
};
