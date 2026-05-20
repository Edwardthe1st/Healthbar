"use strict";
/**
 * CIQUAL 2025 auto-import script — table officielle de composition nutritionnelle (ANSES).
 * Source : https://entrepot.recherche.data.gouv.fr — licence etalab 2.0 (open data)
 *
 * Ce script :
 *   1. Télécharge automatiquement le fichier Excel CIQUAL 2025 depuis data.gouv.fr
 *   2. Parse les ~3 484 aliments (viandes, poissons, légumes, plats cuisinés, etc.)
 *   3. Importe dans la base de données PostgreSQL via Prisma (upsert, sans doublons)
 *
 * Usage (depuis le dossier api/) :
 *   npx ts-node scripts/import-ciqual.ts
 *
 * Si le téléchargement échoue (réseau), placez manuellement le fichier à :
 *   api/scripts/ciqual2025.xlsx
 * puis relancez le script.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const XLSX = __importStar(require("xlsx"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Config ───────────────────────────────────────────────────────────────────
const CIQUAL_URL = 'https://entrepot.recherche.data.gouv.fr/api/access/datafile/666260';
const LOCAL_FILE = path.resolve(__dirname, 'ciqual2025.xlsx');
// ─── Download (uses Node 20 fetch which follows all redirects automatically) ──
async function download(url, dest) {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'NutriApp-Importer/1.0' },
        redirect: 'follow',
    });
    if (!res.ok)
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
}
// ─── Column detection ─────────────────────────────────────────────────────────
function findCol(headers, ...patterns) {
    for (const pat of patterns) {
        const found = headers.find((h) => pat.test(h));
        if (found)
            return found;
    }
    return undefined;
}
// Parse a CIQUAL cell: number | "-" | "traces" | "" → number
function parseNum(v) {
    if (v === null || v === undefined || v === '' || v === '-')
        return 0;
    if (typeof v === 'number')
        return isFinite(v) ? Math.max(0, v) : 0;
    const s = String(v).trim().toLowerCase().replace(',', '.');
    if (s === 'traces' || s === 'trace' || s === '<5')
        return 0;
    const n = parseFloat(s);
    return isNaN(n) ? 0 : Math.max(0, n);
}
function parseNumNullable(v) {
    if (v === null || v === undefined || v === '' || v === '-')
        return null;
    if (typeof v === 'number')
        return isFinite(v) ? Math.max(0, v) : null;
    const s = String(v).trim().toLowerCase().replace(',', '.');
    if (s === 'traces' || s === 'trace')
        return 0;
    const n = parseFloat(s);
    return isNaN(n) ? null : Math.max(0, n);
}
// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    // Step 1 — Download if needed
    if (!fs.existsSync(LOCAL_FILE)) {
        console.log('⬇️  Téléchargement de CIQUAL 2025 depuis data.gouv.fr…');
        console.log(`    URL : ${CIQUAL_URL}`);
        try {
            await download(CIQUAL_URL, LOCAL_FILE);
            console.log(`    ✓ Fichier sauvegardé : ${LOCAL_FILE}`);
        }
        catch (e) {
            console.error(`\n❌ Téléchargement échoué : ${e}`);
            console.error('   → Téléchargez manuellement le fichier depuis :');
            console.error('     https://entrepot.recherche.data.gouv.fr/api/access/datafile/666260');
            console.error(`   → Placez-le ici : ${LOCAL_FILE}`);
            console.error('   → Relancez ce script.');
            process.exit(1);
        }
    }
    else {
        console.log(`📂 Fichier local trouvé : ${LOCAL_FILE}`);
    }
    // Step 2 — Parse Excel
    console.log('📊 Lecture du fichier Excel…');
    const workbook = XLSX.readFile(LOCAL_FILE, { cellText: false, cellNF: false });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (rows.length === 0) {
        console.error('❌ Aucune ligne trouvée. Vérifiez le fichier.');
        process.exit(1);
    }
    const headers = Object.keys(rows[0]);
    console.log(`   Feuille : "${sheetName}" — ${rows.length} lignes, ${headers.length} colonnes`);
    // Locate columns
    const NAME_COL = findCol(headers, /alim_nom_fr/i, /nom.*fr/i, /name.*fr/i);
    const CODE_COL = findCol(headers, /alim_code/i, /code.*alim/i);
    const KCAL_COL = findCol(headers, /kcal/i, /energie.*kcal/i, /energy.*kcal/i);
    const PROT_COL = findCol(headers, /prot/i);
    const CARB_COL = findCol(headers, /glucides/i, /carbohydrate/i);
    const SUGAR_COL = findCol(headers, /sucres/i, /sugars/i);
    const FAT_COL = findCol(headers, /lipides/i, /^fat/i, /graisses/i);
    const SAT_COL = findCol(headers, /saturés|satur/i, /ags/i);
    // "Fibres alimentaires" — exclude energy-with-fiber columns (kJ)
    const FIBER_COL = findCol(headers, /fibres\s*alim/i, /^fibres/i, /dietary.fiber/i) ??
        headers.find((h) => /fibres/i.test(h) && !/kj|kcal|énergie|energie/i.test(h));
    const SALT_COL = findCol(headers, /sel/i, /sodium.*chlor/i, /salt/i);
    if (!NAME_COL || !KCAL_COL) {
        console.error('❌ Colonnes introuvables. En-têtes disponibles :');
        console.error(headers.slice(0, 20).join('\n'));
        process.exit(1);
    }
    console.log('   Colonnes détectées :');
    console.log(`     Nom    : "${NAME_COL}"`);
    console.log(`     Énergie: "${KCAL_COL}"`);
    console.log(`     Prot.  : "${PROT_COL ?? '—'}"`);
    console.log(`     Gluc.  : "${CARB_COL ?? '—'}"`);
    console.log(`     Lip.   : "${FAT_COL ?? '—'}"`);
    console.log(`     Fibres : "${FIBER_COL ?? '—'}"`);
    console.log(`     Sucres : "${SUGAR_COL ?? '—'}"`);
    console.log(`     AGS    : "${SAT_COL ?? '—'}"`);
    console.log(`     Sel    : "${SALT_COL ?? '—'}"`);
    // Step 3 — Import
    console.log('\n🌱 Import en cours…');
    let created = 0;
    let skipped = 0;
    let errors = 0;
    const total = rows.length;
    for (const row of rows) {
        const name = String(row[NAME_COL] ?? '').trim();
        if (!name)
            continue;
        const code = CODE_COL ? String(row[CODE_COL] ?? '').trim() : null;
        const external_id = code ? `ciqual-${code}` : null;
        // Skip existing
        if (external_id) {
            const exists = await prisma.food.findFirst({ where: { external_id } });
            if (exists) {
                skipped++;
                continue;
            }
        }
        try {
            await prisma.food.create({
                data: {
                    name,
                    brand: null,
                    calories_per_100g: parseNum(KCAL_COL ? row[KCAL_COL] : 0),
                    proteins_per_100g: parseNum(PROT_COL ? row[PROT_COL] : 0),
                    carbs_per_100g: parseNum(CARB_COL ? row[CARB_COL] : 0),
                    fats_per_100g: parseNum(FAT_COL ? row[FAT_COL] : 0),
                    fiber_per_100g: parseNum(FIBER_COL ? row[FIBER_COL] : 0),
                    sugar_per_100g: parseNumNullable(SUGAR_COL ? row[SUGAR_COL] : null),
                    saturated_fats_per_100g: parseNumNullable(SAT_COL ? row[SAT_COL] : null),
                    salt_per_100g: parseNumNullable(SALT_COL ? row[SALT_COL] : null),
                    source: 'USDA', // CIQUAL = données officielles françaises
                    external_id,
                },
            });
            created++;
        }
        catch {
            errors++;
        }
        if ((created + skipped) % 200 === 0) {
            const pct = Math.round(((created + skipped) / total) * 100);
            process.stdout.write(`   ${pct}% — ${created} créés, ${skipped} existants…\r`);
        }
    }
    console.log(`\n\n✅ Import CIQUAL 2025 terminé :`);
    console.log(`   ${created} aliments créés`);
    console.log(`   ${skipped} déjà en base (ignorés)`);
    if (errors > 0)
        console.log(`   ${errors} erreurs`);
    console.log(`\n📊 Total aliments en base : ${await prisma.food.count()}`);
}
main()
    .catch((e) => { console.error('\nEchec :', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
