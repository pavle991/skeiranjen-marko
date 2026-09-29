// Preuzima ceo katalog iz Slanje Paketa i čuva skraćenu verziju u public/data/catalog.json.
// Pokreće ga GitHub Actions (svake noći i na zahtev). Potrebna tajna: SP_TOKEN.
import fs from "node:fs";
import { sp, slimProduct } from "../lib/common.js";

const env = { SP_TOKEN: process.env.SP_TOKEN, SP_BASE_URL: process.env.SP_BASE_URL };
const FULL = process.env.FULL === "true";

async function page(path) {
  for (let tries = 0; ; tries++) {
    try { return await sp(env, path); }
    catch (e) { if (tries >= 3) throw e; await new Promise((r) => setTimeout(r, e.status === 429 ? 20000 : 3000)); }
  }
}

// ---- Artikli: stari se ne menjaju, pa se dodaju samo novi (od najnovijeg dok ne naiđemo na poznat)
const file = "public/data/catalog.json";
const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
const known = new Set(!FULL && old ? old.items.map((i) => i[0]) : []);
const fresh = [];
let cursor = null, reachedKnown = false, requests = 0;
for (let n = 0; n < 1000; n++) {
  const j = await page("/products?limit=100&sort=-created_at" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : "")); requests++;
  for (const p of j.data || []) { if (known.has(p._id)) { reachedKnown = true; break; } fresh.push(slimProduct(p)); }
  if (reachedKnown || !j.hasMore || !j.nextCursor) break;
  cursor = j.nextCursor;
}
const items = known.size ? fresh.concat(old.items) : fresh;
if (items.length < 10) throw new Error("Katalog izgleda prazno (" + items.length + "), ne menjam postojeći.");
fs.mkdirSync("public/data", { recursive: true });
if (known.size && !fresh.length) console.log("Artikli: nema novih (" + items.length + " ukupno, " + requests + " zahtev)");
else { fs.writeFileSync(file, JSON.stringify({ syncedAt: new Date().toISOString(), count: items.length, items }));
  console.log("Artikli: " + fresh.length + " novih, " + items.length + " ukupno (" + requests + " zahteva)"); }

// ---- Prijemi: uvek svi, jer im se menja status (za pretragu po proizvodu): [_id, broj, status, kreirano, pristiglo, izbrojano, [[šifra, najavljeno, izbrojano]]]
const recs = [];
cursor = null;
for (let n = 0; n < 1000; n++) {
  const j = await page("/product-shipments?limit=100&sort=-created_at" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""));
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
