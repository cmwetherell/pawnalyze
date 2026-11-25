// Contrast gate: parses tokens.css, checks every text/surface and UI pair in both themes. Exit 1 on failure.
import fs from 'fs';
const css=fs.readFileSync(process.argv[2]||new URL('../tokens.css',import.meta.url),'utf8');
const at=css.indexOf('\n.dark {');
const grab=s=>Object.fromEntries([...s.matchAll(/--([\w-]+):\s*(\d+) (\d+) (\d+);/g)].map(m=>[m[1],[+m[2],+m[3],+m[4]]]));
const light=grab(css.slice(0,at)), dark={...light,...grab(css.slice(at))};
const lum=c=>{const v=c.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};
const cr=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return(x+.05)/(y+.05)};
const T=[],U=[],L7=[];
const grounds=['canvas','surface','raised'];
for(const g of [...grounds,'sunken']) T.push(['ink',g],['ink-2',g],['ink-3',g]);
for(const g of grounds) L7.push(['ink',g],['ink-2',g]);
for(const k of ['brand','positive','negative','warning','live','p1-ink','p2-ink']) for(const g of grounds) T.push([k,g]);
for(const k of ['positive','negative','warning','live','brand']) T.push([k,k+'-wash'],['ink',k+'-wash'],['ink-2',k+'-wash']);
for(const k of ['p1','p2']) T.push([k+'-ink',k+'-wash'],['ink',k+'-wash'],['ink-2',k+'-wash'],['on-field',k+'-field'],['on-'+k,k]);
T.push(['on-action','action'],['on-action','action-hover'],['on-live','live'],['ink-inverse','ink'],['on-gold','gold'],['on-silver','silver'],['on-bronze','bronze'],['board-ink','board-light'],['board-ink','board-dark'],['piece-black','eval-white'],['eval-white','eval-black']);
// large/bold glyphs on mid grey: draw pick label is 15px/600, so 4.5 would be ideal; we require it
T.push(['on-draw','draw']);
// Every fillClass/onClass pair of lib/theme/tones.ts (initials, pips, bar labels, picks). A transparent or hatched fill shows the ground.
const tones=fs.readFileSync(new URL('../lib/theme/tones.ts',import.meta.url),'utf8');
const classes=name=>{const body=tones.match(new RegExp(`const ${name}[^=]*= \\{([\\s\\S]*?)\\n\\};`))?.[1]??'';return Object.fromEntries([...body.matchAll(/'?([\w-]+)'?: '([^']*)'/g)].map(m=>[m[1],m[2]]))};
const fills=classes('fillClass'),ons=classes('onClass');
if(Object.keys(fills).length<20||Object.keys(fills).join()!==Object.keys(ons).join()){console.log('FAIL cannot read fillClass/onClass in lib/theme/tones.ts');process.exit(1)}
for(const[tone,fill]of Object.entries(fills)){const on=ons[tone].match(/text-([\w-]+)/)[1],bg=fill.match(/\bbg-([\w-]+)/)?.[1];if(bg&&bg!=='transparent')T.push([on,bg]);else for(const g of grounds)T.push([on,g])}
for(const k of ['control','focus','rule','action','brand-mark','p1','p2','draw','gold','silver','bronze','live','context','axis','series-1','series-2','series-3','series-4','series-5','series-6','series-7','series-8','cx-1','cx-2','cx-3','cx-4']) for(const g of ['canvas','surface','raised']) U.push([k,g]);
for(const k of ['control','focus','p1','p2','gold','bronze','ink']) U.push([k,'sunken']);
U.push(['board-mark','board-ink'],['control','piece-white'],['p1-field','canvas'],['p2-field','canvas']);
let bad=0;
for(const[n,m]of[['light',light],['dark',dark]]){let min=[9,''];
 for(const[L,req]of[[T,4.5],[U,3],[L7,7]])for(const[a,b]of L){if(!m[a]||!m[b]){console.log('MISSING',a,b);bad++;continue}const r=cr(m[a],m[b]);if(r/req<min[0])min=[r/req,`${a} on ${b} ${r.toFixed(2)}/${req}`];if(r<req){bad++;console.log('FAIL',n,a,'on',b,r.toFixed(2),'need',req)}}
 console.log(n,T.length+U.length+L7.length,'pairs; tightest',min[1])}
for(const k of Object.keys(light)){if(!(k in grab(css.slice(at)))){console.log('MISSING in .dark',k);bad++}}
console.log(bad?bad+' failures':'all pass');process.exit(bad?1:0);
