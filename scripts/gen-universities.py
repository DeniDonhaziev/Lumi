# -*- coding: utf-8 -*-
import sqlite3, re, json, sys

DB = 'db.sqlite'
db = sqlite3.connect(DB)
c = db.cursor()

LATEST = 2022

# ---- preload indicator data (latest available per uid) ----
def latest_map(iid):
    m = {}
    for uid, year, val in c.execute(
        'SELECT uid, year, value FROM data WHERE iid=? ORDER BY year', (iid,)):
        if val is None:
            continue
        m[uid] = val  # later years overwrite -> keeps latest
    return m

students_m = latest_map(1)     # общая численность студентов
ege_m      = latest_map(5)     # средний балл ЕГЭ (бюджет)
dorm_m     = latest_map(45)    # площадь общежитий

# ---- specialties per uni (latest year, top by people) ----
spec = {}
for uid, gname, people in c.execute(
    '''SELECT uu.uid, g.name, uu.people
       FROM uni_ugn uu JOIN ugn g ON g.ugnid=uu.ugnid
       WHERE uu.year=(SELECT MAX(year) FROM uni_ugn)
       ORDER BY uu.people DESC'''):
    clean = re.sub(r'^\s*[\d.]+\s*-\s*', '', gname).strip()
    spec.setdefault(uid, [])
    if clean and clean not in spec[uid] and len(spec[uid]) < 6:
        spec[uid].append(clean)

REGION_FIX = {'Р Республика': 'Республика'}

def parse_region_city(addr):
    if not addr:
        return '', ''
    addr = addr.replace('\xa0', ' ')
    parts = [p.strip() for p in addr.split(',') if p.strip()]
    region = parts[0] if parts else ''
    region = re.sub(r'^Р\s+Республика', 'Республика', region)
    region = re.sub(r'\s+', ' ', region).strip()
    # city: find token with г. / город
    city = ''
    m = re.search(r'\bг\.?\s*([А-ЯЁ][А-Яа-яЁё\-\s]+)', addr)
    if m:
        city = m.group(1).strip()
        city = re.split(r'\s+(ул|пр|пер|пл|наб|б-р|проспект|улица|шоссе|д\b)', city)[0].strip()
        city = city.strip(' .')
    # strip leading "г."/"город" from region (federal cities: Москва/СПб/Севастополь)
    region = re.sub(r'^(г\.?|город)\s*', '', region).strip()
    if not city and region:
        city = region
    return region, city

STOP = {'и','в','на','по','имени','им','для','с','к','о','об','при',
        'высшего','высшее','образования','образование','образовательное','образовательная',
        'учреждение','федеральное','федеральный','бюджетное','автономное','автономная',
        'профессионального','профессиональное','негосударственное','частное','частная',
        'некоммерческая','некоммерческое','организация','общеобразовательная'}

def make_short(name):
    # 1) parenthesized acronym like (МЭСИ), (МГУ)
    for m in re.finditer(r'\(([^)]+)\)', name):
        t = m.group(1).strip()
        if re.fullmatch(r'[А-ЯЁA-Z][А-ЯЁA-Zа-яёa-z\-]{1,11}', t) and sum(ch.isupper() for ch in t) >= 2:
            return t
    inner = None
    m = re.search(r'[«"]([^»"]+)[»"]', name)
    if m:
        inner = m.group(1).strip()
        if 3 <= len(inner) <= 30:
            return inner
    base = inner or name
    words = re.findall(r'[А-Яа-яЁёA-Za-z]{2,}', base)
    letters = [w[0].upper() for w in words if w.lower() not in STOP]
    acro = ''.join(letters)
    if len(acro) >= 2:
        return acro[:8]
    return (inner or name)[:24]

def clean_ws(s):
    return re.sub(r'\s+', ' ', (s or '').replace('\t',' ').replace('\n',' ')).strip()

def uni_type(name, ministry):
    low = (name + ' ' + ministry).lower()
    if 'государственн' in low or 'муниципальн' in low or ministry.strip():
        return 'государственный'
    if 'негосударствен' in low or 'частн' in low or 'автономная некоммерческая' in low or 'религиозн' in low:
        return 'частный'
    return 'частный'

def has_military(name):
    low = name.lower()
    return any(k in low for k in ['военн','мвд','оборон','росгвард','фсб','мчс','следствен','таможен'])

def rating_from(ege, students):
    if ege:
        r = (ege - 45) / (90 - 45) * 42 + 55  # 45->55, 90->97
        r = max(50, min(99, round(r)))
        return r
    # fallback by size
    if students and students > 15000: return 72
    if students and students > 5000: return 66
    return 60

rows = c.execute('SELECT uid, name, address, ministry, website FROM universities ORDER BY uid').fetchall()

out = []
seen_short = {}
for uid, name, address, ministry, website in rows:
    name = clean_ws(name)
    if not name:
        continue
    ministry = clean_ws(ministry)
    website = clean_ws(website)
    if website and not website.startswith('http'):
        website = 'http://' + website
    website = website.rstrip('/')
    region, city = parse_region_city(address)
    if not region:
        region = 'Россия'
    if not city:
        city = region
    ege = ege_m.get(uid)
    students = students_m.get(uid)
    students_i = int(round(students)) if students else 0
    rating = rating_from(ege, students)
    min_score = int(round(ege * 3)) if ege else 0
    if min_score > 300: min_score = 300
    specs = spec.get(uid, [])
    dorm = bool(dorm_m.get(uid) and dorm_m.get(uid) > 0)
    short = make_short(name)
    typ = uni_type(name, ministry)
    budget = int(round(students_i * 0.16)) if students_i else 0
    paid = int(round(students_i * 0.09)) if students_i else 0
    desc_parts = []
    desc_parts.append(f'Вуз в г. {city}' + (f' ({region})' if region and region != city else '') + '.')
    if specs:
        desc_parts.append('Направления: ' + ', '.join(specs[:3]) + '.')
    if ministry:
        desc_parts.append('Учредитель: ' + (ministry[:80] + '…' if len(ministry) > 80 else ministry))
    description = ' '.join(desc_parts)
    out.append({
        'id': str(uid),
        'name': name,
        'shortName': short,
        'city': city,
        'region': region,
        'type': typ,
        'rating': rating,
        'students': students_i,
        'specialties': specs,
        'minScore': min_score,
        'budgetPlaces': budget,
        'paidPlaces': paid,
        'website': website or '',
        'description': description,
        'hasDormitory': dorm,
        'hasMilitary': has_military(name),
    })

print('TOTAL', len(out), file=sys.stderr)
print('cities', len(set(u['city'] for u in out)), file=sys.stderr)
print('regions', len(set(u['region'] for u in out)), file=sys.stderr)
if '--sample' in sys.argv:
    import random
    for u in out[:3] + out[1100:1103]:
        print(json.dumps(u, ensure_ascii=False), file=sys.stderr)
    print('REGIONS:', sorted(set(u['region'] for u in out)), file=sys.stderr)
    sys.exit(0)

# ---- write TS ----
def ts_str(s):
    return "'" + s.replace('\\','\\\\').replace("'", "\\'") + "'"

def ts_arr(a):
    return '[' + ', '.join(ts_str(x) for x in a) + ']'

lines = ["import type { University } from '../types';", '',
         'export const universities: University[] = [']
for u in out:
    lines.append('  {')
    lines.append(f"    id: {ts_str(u['id'])},")
    lines.append(f"    name: {ts_str(u['name'])},")
    lines.append(f"    shortName: {ts_str(u['shortName'])},")
    lines.append(f"    city: {ts_str(u['city'])},")
    lines.append(f"    region: {ts_str(u['region'])},")
    lines.append(f"    type: {ts_str(u['type'])},")
    lines.append(f"    rating: {u['rating']},")
    lines.append(f"    students: {u['students']},")
    lines.append(f"    specialties: {ts_arr(u['specialties'])},")
    lines.append(f"    minScore: {u['minScore']},")
    lines.append(f"    budgetPlaces: {u['budgetPlaces']},")
    lines.append(f"    paidPlaces: {u['paidPlaces']},")
    lines.append(f"    website: {ts_str(u['website'])},")
    lines.append(f"    description: {ts_str(u['description'])},")
    lines.append(f"    hasDormitory: {'true' if u['hasDormitory'] else 'false'},")
    lines.append(f"    hasMilitary: {'true' if u['hasMilitary'] else 'false'},")
    lines.append('  },')
lines.append('];')
lines.append('')
lines.append("export const allCities = [...new Set(universities.map((u) => u.city))].sort((a, b) => a.localeCompare(b, 'ru'));")
lines.append('')
lines.append("export const allRegions = [...new Set(universities.map((u) => u.region))].sort((a, b) => a.localeCompare(b, 'ru'));")
lines.append('')
lines.append('export const allSpecialties = [')
lines.append('  ...new Set(universities.flatMap((u) => u.specialties)),')
lines.append("].sort((a, b) => a.localeCompare(b, 'ru'));")
lines.append('')

with open('../src/data/universities.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print('WROTE ../src/data/universities.ts', file=sys.stderr)
