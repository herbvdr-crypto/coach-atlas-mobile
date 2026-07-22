// kaidenz-rename.js — renames Coach Atlas AND/OR Kaidense -> Kaidenz.
// Works regardless of how far the previous rename got. Run from EACH repo root:
//   node kaidenz-rename.js
// Protected: the live Vercel URL, coach-atlas file paths/imports, the
// CoachAtlas component identifier. Prints every changed file.
const fs = require('fs'); const path = require('path');
const PROT = [['coach-atlas-swart.vercel.app','\u00a7V\u00a7'],['coach-atlas','\u00a7CA\u00a7'],['CoachAtlas','\u00a7CC\u00a7']];
const MAP = [['KAIDENSE','KAIDENZ'],['Kaidense','Kaidenz'],['kaidense','kaidenz'],
             ['COACH ATLAS','KAIDENZ'],['Coach Atlas','Kaidenz'],['ATLAS','KAIDENZ'],['Atlas','Kaidenz'],
             ['coachatlas','kaidenz']];
let n = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (['node_modules','.next','.git','android','ios'].includes(f)) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    if (!/\.(tsx?|json|md)$/.test(f) || f === 'package-lock.json' || f === 'eas.json') continue;
    let s = fs.readFileSync(p, 'utf8'); const o = s;
    for (const [a,b] of PROT) s = s.split(a).join(b);
    for (const [a,b] of MAP)  s = s.split(a).join(b);
    for (const [a,b] of PROT) s = s.split(b).join(a);
    if (s !== o) { fs.writeFileSync(p, s); console.log('renamed:', p); n++; }
  }
}
walk('.');
console.log(n + ' files renamed to Kaidenz.');
console.log('NOTE: eas.json deliberately skipped (URLs flip at domain cutover).');
console.log('MOBILE ONLY: app.json ids are handled by this run too — verify it now shows com.kaidenz.app.');