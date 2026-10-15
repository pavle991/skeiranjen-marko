// GET /api/catalog-new?n=100&cursor=... -> najnoviji artikli, strana po strana (aplikacija ide dok ne naiđe na poznat artikal)
import { json, sp, slimProduct, fail } from "../../lib/common.js";
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const n = Math.min(100, Math.max(1, Number(u.searchParams.get("n")) || 100));
  const cursor = u.searchParams.get("cursor");
  try {
    const j = await sp(env, "/products?limit=" + n + "&sort=-created_at" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""));
    return json({ at: new Date().toISOString(), items: (j.data || []).map(slimProduct), nextCursor: j.hasMore ? j.nextCursor : null });
  } catch (e) { return fail(e); }
}
