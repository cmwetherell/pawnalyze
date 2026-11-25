// Drift gate: node scripts/check-drift.mjs [root]. Exit 1 on any hit. Runs in npm run lint and before every build.
import fs from 'fs'; import path from 'path';
const root = process.argv[2] || process.cwd();
const walk = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['node_modules', '.next'].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]) : [];
const files = ['app', 'components', 'lib', 'hooks'].flatMap(d => walk(path.join(root, d))).filter(f => /\.(tsx?|css)$/.test(f)).map(f => path.relative(root, f));
const UI = /^components\/(ui|layout|charts|chess)\//;
const RULES = [
  { id: 'raw-color', re: /(?<![&\w/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?!["'`]?\s*\)?\s*\.(?:test|match))|\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/, skip: /^(app\/tokens\.css|lib\/theme\/)/, msg: 'color literal; use a token class, or token() from lib/theme/css' },
  { id: 'default-palette', re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|accent|decoration|outline|divide|placeholder|shadow)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/, msg: 'default Tailwind palette does not exist here' },
  { id: 'arbitrary-color', re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|accent|decoration|outline|divide|shadow|caret)-\[(?:#|var\(--|rgb|hsl|color:)/, msg: 'arbitrary color value' },
  { id: 'arbitrary-type', re: /\b(?:text|leading|tracking|font)-\[[^\]]+\]|\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/, msg: 'use a type-* style' },
  { id: 'tracked-caps', re: /\buppercase\b(?=[^;]*["'`])|\btracking-(?:wide|wider|widest)\b|textTransform/, msg: 'sentence case only' },
  { id: 'raw-element', re: /<(?:button|table|thead|tbody|input|select|textarea|details|summary|dialog)[\s>]/, skip: UI, msg: 'use the component in components/ui' },
  { id: 'raw-svg', re: /<svg[\s>]/, skip: UI, msg: 'use <Icon>, a chart, or a chess component' },
  { id: 'ad-hoc-card', re: /\bsurface-card\b|\brounded-(?:lg|xl|2xl|3xl)\b[^"'`]*\bborder\b|\bborder\b[^"'`]*\brounded-(?:lg|xl|2xl|3xl)\b/, skip: UI, msg: 'use <Panel>, <Callout> or rules' },
  { id: 'own-width', re: /\bmax-w-(?:xl|[2-7]xl|screen-\w+|\[\d+(?:px|rem)\])/, skip: UI, msg: 'use <Container>' },
  { id: 'own-scroller', re: /\boverflow-(?:x-|y-)?(?:auto|scroll)\b/, skip: UI, msg: 'use <ScrollRow> or <ScrollArea> (always position:relative)' },
  { id: 'gradient-glow', re: /\bbg-gradient-|\bblur-(?:2xl|3xl)\b|conic-gradient|radial-gradient|\bbackdrop-blur/, msg: 'no gradients, glows or glass' },
  { id: 'chart-lib', re: /from ['"](?:chart\.js|react-chartjs-2|recharts|chartjs-plugin-datalabels)/, msg: 'charts come from components/charts' },
  { id: 'old-token', re: /--(?:bg-base|bg-surface-\d|text-(?:primary|secondary|muted)|border|gold-ink-rgb|wcc-\w+|header-\w+|chart-\w+)\b|chess-gold|gold-ink|gold-gradient|medal-(?:gold|silver|bronze)\b/, msg: 'token from the old theme' },
  { id: 'emoji-glyph', re: /[\u{1F300}-\u{1FAFF}]|[⏮⏭◀▶⇅]/u, msg: 'use <Icon>' },
  { id: 'british', re: /\b(?!by_colour\b)\w*(?:colour|favour|behaviour|neighbour|honour|labour|catalogue|licence|cancelled|cancelling|normalis|organis|recognis|optimis(?!t)|minimis|maximis|visualis|summaris|emphasis(?=[ei][dns])|defence|grey)\w*|\bcentre[ds]?\b|\b(?:un)?labelled\b(?!by)|\b\d{1,2} (?:Jan(?:uary)?|Feb(?:ruary)?|Mar|Apr(?:il)?|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b|en-GB/i, msg: 'American English: spelling, and dates as Nov 22' },
  { id: 'inline-color', re: /style=\{\{[^}]*\b(?:color|background(?:Color)?|borderColor|fill|stroke|boxShadow)\s*:/, skip: UI, msg: 'color belongs in a class or a tone prop' },
];
const n = {}; let bad = 0;
for (const f of files) {
  const og = /ogImage\.tsx$|^lib\/og/.test(f);
  fs.readFileSync(path.join(root, f), 'utf8').split('\n').forEach((line, i) => {
    if (/drift-ok:/.test(line)) return;
    for (const r of RULES) {
      if (r.skip?.test(f)) continue;
      if (og && ['inline-color', 'raw-svg'].includes(r.id)) continue;
      if (f.endsWith('.css') && !['raw-color', 'old-token', 'gradient-glow'].includes(r.id)) continue;
      if (r.id === 'raw-color' && /href=["'`{]|useHash|setHash|\.href\b/.test(line) && !/rgba?\(|style|className/.test(line)) continue;
      if (r.re.test(line)) { n[r.id] = (n[r.id] || 0) + 1; bad++; if (!process.env.COUNT) console.log(`${f}:${i + 1}  ${r.id}: ${r.msg}`); }
    }
  });
}
console.log(Object.entries(n).map(([k, v]) => `${k} ${v}`).join(', ') || 'no drift'); console.log(`${files.length} files, ${bad} findings`); process.exit(bad ? 1 : 0);
