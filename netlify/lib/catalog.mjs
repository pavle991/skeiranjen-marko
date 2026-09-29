// Sinhronizacija kataloga u Netlify Blobs (skraćeni podaci, ~8.700 artikala)
import { getStore } from "@netlify/blobs";
import { sp, slimProduct } from "./common.mjs";

export const store = () => getStore({ name: "katalog", consistency: "strong" });

// Cela lista (sporo: ~90 strana) - radi se u pozadinskoj funkciji
export async function fullSync() {
  const st = store();
  await st.setJSON("status", { state: "building", startedAt: new Date().toISOString(), count: 0 });
  const items = [];
  let cursor = null;
  for (let page = 0; page < 1000; page++) {
    const j = await sp("/products?limit=100&sort=-created_at" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""));
    for (const p of j.data || []) items.push(slimProduct(p));
    if (page % 10 === 0) await st.setJSON("status", { state: "building", count: items.length });
    if (!j.hasMore || !j.nextCursor) break;
    cursor = j.nextCursor;
  }
  const cat = { syncedAt: new Date().toISOString(), fullAt: new Date().toISOString(), items };
  await st.setJSON("catalog", cat);
  await st.setJSON("status", { state: "ready", count: items.length, at: cat.syncedAt });
  return cat;
}

// Brzo dopunjavanje: samo najnoviji artikli dok ne naiđemo na poznat
export async function quickSync(cat) {
  const known = new Set(cat.items.map((i) => i[0]));
  const fresh = [];
  let cursor = null;
  for (let page = 0; page < 10; page++) {
    const j = await sp("/products?limit=100&sort=-created_at" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""));
    let hitKnown = false;
    for (const p of j.data || []) { if (known.has(p._id)) { hitKnown = true; break; } fresh.push(slimProduct(p)); }
    if (hitKnown || !j.hasMore || !j.nextCursor) break;
    cursor = j.nextCursor;
  }
  if (fresh.length) {
    cat.items = fresh.concat(cat.items);
    cat.syncedAt = new Date().toISOString();
    await store().setJSON("catalog", cat);
  }
  return fresh.length;
}
