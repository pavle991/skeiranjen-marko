// Preuzima ceo katalog iz Slanje Paketa i čuva skraćenu verziju u public/data/catalog.json.
// Pokreće ga GitHub Actions (svake noći i na zahtev). Potrebna tajna: SP_TOKEN.
import fs from "node:fs";
import { sp, slimProduct } from "../lib/common.js";

const env = { SP_TOKEN: process.env.SP_TOKEN, SP_BASE_URL: process.env.SP_BASE_URL };
const items = [];
let cursor = null;
for (let page = 0; page < 1000; page++) {
  let j, tries = 0;
  for (;;) {
    try { j = await sp(env, "/products?limit=100&sort=-created_at" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : "")); break; }
    catch (e) { if (++tries >= 4) throw e; await new Promise((r) => setTimeout(r, e.status === 429 ? 20000 : 3000)); }
  }
  for (const p of j.data || []) items.push(slimProduct(p));
  if (!j.hasMore || !j.nextCursor) break;
  cursor = j.nextCursor;
}
if (items.length < 10) throw new Error("Katalog izgleda prazno (" + items.length + "), ne menjam postojeći.");

const file = "public/data/catalog.json";
const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
if (old && JSON.stringify(old.items) === JSON.stringify(items)) { console.log("Bez promena:", items.length, "artikala"); process.exit(0); }
fs.mkdirSync("public/data", { recursive: true });
fs.writeFileSync(file, JSON.stringify({ syncedAt: new Date().toISOString(), count: items.length, items }));
console.log("Sačuvano:", items.length, "artikala");
