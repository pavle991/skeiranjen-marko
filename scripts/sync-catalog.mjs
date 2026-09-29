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
fs.mkdirSync("public/data", { recursive: true });
if (old && JSON.stringify(old.items) === JSON.stringify(items)) console.log("Katalog bez promena:", items.length, "artikala");
else { fs.writeFileSync(file, JSON.stringify({ syncedAt: new Date().toISOString(), count: items.length, items })); console.log("Sačuvano:", items.length, "artikala"); }

// ---- Svi prijemi (za pretragu po proizvodu): [_id, broj, status, kreirano, pristiglo, izbrojano, [[šifra, najavljeno, izbrojano]]]
const recs = [];
cursor = null;
for (let page = 0; page < 1000; page++) {
  let j, tries = 0;
  for (;;) {
    try { j = await sp(env, "/product-shipments?limit=100&sort=-created_at" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : "")); break; }
    catch (e) { if (++tries >= 4) throw e; await new Promise((r) => setTimeout(r, e.status === 429 ? 20000 : 3000)); }
  }
  for (const s of j.data || []) if (s.type === "RECEIPT")
    recs.push([s._id, s.client_number ?? s.annual_number ?? s.global_number, s.status, s.created_at, s.arrived_at || null, s.counted_at || null,
      (s.products || []).map((l) => [l.code, l.dispatch_quantity ?? 0, l.receipt_quantity ?? 0])]);
  if (!j.hasMore || !j.nextCursor) break;
  cursor = j.nextCursor;
}
const rfile = "public/data/receipts.json";
const rold = fs.existsSync(rfile) ? JSON.parse(fs.readFileSync(rfile, "utf8")) : null;
if (!rold || JSON.stringify(rold.items) !== JSON.stringify(recs)) {
  fs.writeFileSync(rfile, JSON.stringify({ syncedAt: new Date().toISOString(), count: recs.length, items: recs }));
  console.log("Prijemi sačuvani:", recs.length);
} else console.log("Prijemi bez promena:", recs.length);
