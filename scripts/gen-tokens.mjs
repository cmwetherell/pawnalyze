// app/tokens.css -> lib/theme/tokens.generated.ts (for OG images, viewport themeColor and tests; never for components).
import fs from 'fs';
const css = fs.readFileSync('app/tokens.css', 'utf8'); const at = css.indexOf('\n.dark {');
const grab = s => Object.fromEntries([...s.matchAll(/--([\w-]+):\s*(\d+) (\d+) (\d+);/g)].map(m => [m[1], `rgb(${m[2]}, ${m[3]}, ${m[4]})`]));
const light = grab(css.slice(0, at)), dark = { ...light, ...grab(css.slice(at)) };
fs.mkdirSync('lib/theme', { recursive: true });
fs.writeFileSync('lib/theme/tokens.generated.ts', `// Generated from app/tokens.css by npm run theme. Do not edit.\nexport const TOKENS = ${JSON.stringify({ light, dark }, null, 2)} as const;\nexport type TokenName = keyof typeof TOKENS.dark;\n`);
