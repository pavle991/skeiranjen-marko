// GET /api/catalog          -> skraćeni katalog (dopuni najnovije ako je stariji od 5 min)
// GET /api/catalog?fresh=1  -> odmah proveri nove artikle (kad se skenira nepoznat kod)
import { json, pinOk, env } from "../lib/common.mjs";
import { store, quickSync } from "../lib/catalog.mjs";

export default async (req) => {
  if (!pinOk(req)) return json({ error: "Pogrešan PIN aplikacije" }, 401);
  const st = store();
  const cat = await st.get("catalog", { type: "json" });
  if (!cat) {
    const status = (await st.get("status", { type: "json" })) || { state: "empty" };
    const stale = status.state === "building" && status.startedAt && Date.now() - Date.parse(status.startedAt) > 15 * 60e3;
    if (status.state !== "building" || stale) {
      await fetch(new URL("/api/catalog-sync", req.url), { method: "POST", headers: { "x-sync-key": env("SP_TOKEN") || "" } }).catch(() => {});
    }
    return json({ state: "building", count: status.count || 0 }, 202);
  }
  const fresh = new URL(req.url).searchParams.get("fresh");
  if (fresh || Date.now() - Date.parse(cat.syncedAt) > 5 * 60e3) {
    try { await quickSync(cat); } catch (e) { /* vrati ono što imamo */ }
  }
  return json({ state: "ready", syncedAt: cat.syncedAt, count: cat.items.length, items: cat.items });
};
export const config = { path: "/api/catalog" };
