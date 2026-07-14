import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'db.sqlite'), { readonly: true });

const count = db.prepare('SELECT COUNT(*) as c FROM universities').get();
console.log('Universities:', count);

const sample = db.prepare(`
  SELECT u.uid, u.name, u.address, u.website, u.owner, u.ministry, fd.name as district
  FROM universities u
  JOIN federal_districts fd ON u.fdid = fd.fdid
  LIMIT 5
`).all();
console.log(JSON.stringify(sample, null, 2));

const ugnSample = db.prepare(`
  SELECT u.name, ug.name as specialty, uu.people, uu.year
  FROM uni_ugn uu
  JOIN universities u ON u.uid = uu.uid
  JOIN ugn ug ON ug.ugnid = uu.ugnid
  WHERE uu.year = (SELECT MAX(year) FROM uni_ugn)
  LIMIT 5
`).all();
console.log('UGN:', JSON.stringify(ugnSample, null, 2));

const indicators = db.prepare('SELECT * FROM indicators LIMIT 10').all();
console.log('Indicators:', JSON.stringify(indicators, null, 2));

db.close();
