// Zajedničke oznake prijema (ko je kreirao, kad je štampano) - vide ih svi telefoni.
import { getStore } from "@netlify/blobs";
import { json, pinOk } from "../lib/common.mjs";

export default async (req) => {
  if (!pinOk(req)) return json({ error: "Pogrešan PIN aplikacije" }, 401);
  const store = getStore({ name: "prijemi", consistency: "strong" });
  if (req.method === "GET") {
    const { blobs } = await store.list();
    const out = {};
    await Promise.all(blobs.map(async (b) => { out[b.key] = await store.get(b.key, { type: "json" }); }));
    return json(out);
  }
  if (req.method === "POST") {
    const { id, patch } = await req.json().catch(() => ({}));
    if (!id || typeof patch !== "object") return json({ error: "Nedostaje id ili patch" }, 400);
    const key = String(id).replace(/[^\w-]/g, "_");
    const cur = (await store.get(key, { type: "json" })) || {};
    const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
    await store.setJSON(key, next);
    return json(next);
  }
  return json({ error: "Metod nije dozvoljen" }, 405);
};
export const config = { path: "/api/meta" };
