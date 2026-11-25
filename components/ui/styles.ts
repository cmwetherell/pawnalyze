/**
 * Class strings two or more components share. Only the library (components/ui, layout, charts, chess) imports these: pages use the components.
 * `group/ground` is a SectionGroup, `group/panel` a Panel, Sheet or menu: on those the canvas-level tint would not show.
 */

/** Hover ground of a row or cell that does something. */
export const hoverGround =
  'hover:bg-surface group-data-[ground=surface]/ground:hover:bg-sunken group-data-[panel]/panel:hover:bg-sunken';

/** Same tint at rest: the selected row. */
export const selectedGround =
  'bg-surface group-data-[ground=surface]/ground:bg-sunken group-data-[panel]/panel:bg-sunken';

/**
 * The ground of a table row (or of the sticky head) runs 12px past its rules on both sides, so words never touch its edge.
 * Every cell paints 12px each side behind the row, and only the outer two show: which cell is first or last depends on the
 * column priorities. Needs a stacking context around the table.
 */
export const rowBleed =
  "[&>*]:relative [&>*]:bg-inherit [&>*]:before:pointer-events-none [&>*]:before:absolute [&>*]:before:-inset-x-3 [&>*]:before:inset-y-0 [&>*]:before:-z-10 [&>*]:before:bg-inherit [&>*]:before:content-['']";

/** Track of a bar. One step darker on a row that is itself tinted, where `sunken` would disappear. */
export const trackGround =
  'bg-sunken group-hover/tr:bg-line group-data-[selected]/tr:bg-line group-hover/row:bg-line group-data-[selected]/row:bg-line';

/** The gold hairline itself. Add `underline`, or a hover that does: `hover:underline`, `group-hover/row:underline`. */
export const goldLine = 'decoration-brand-mark decoration-1 underline-offset-4';

/** A link in running text: 1px at rest, 2px under the pointer. */
export const linkLine = `underline ${goldLine} transition-[color,text-decoration-thickness] duration-in hover:decoration-2`;

/** The same for every link inside a block of words. */
export const proseLinks = '[&_a]:text-ink [&_a]:underline [&_a]:decoration-brand-mark [&_a]:decoration-1 [&_a]:underline-offset-4 [&_a:hover]:decoration-2';

/** The same for a link that is the direct child of a cell: the line shows when the cell or its table row is pointed at. */
export const cellLink = '[&>a]:decoration-brand-mark [&>a]:decoration-1 [&>a]:underline-offset-4 hover:[&>a]:underline group-hover/tr:[&>a]:underline';

/** Edge and ground of everything you type in or choose from. 16px text, so iOS does not zoom on focus. */
export const controlClass =
  'w-full min-w-0 appearance-none rounded-sm border border-control bg-raised px-3 type-body text-ink transition-colors duration-in hover:border-ink-3 focus-visible:border-focus focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-control aria-[invalid=true]:border-negative';

export const isExternal = (href: string) => /^https?:/.test(href);
