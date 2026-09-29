// GET /api/catalog-new?n=20 -> najnoviji artikli (za artikle dodate posle noćne sinhronizacije)
import { json, sp, slimProduct, fail } from "../../lib/common.js";
export async function onRequestGet({ request, env }) {
  const n = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get("n")) || 20));
  try {
    const j = await sp(env, "/products?limit=" + n + "&sort=-created_at");
    return json({ at: new Date().toISOString(), items: (j.data || []).map(slimProduct) });
  } catch (e) { return fail(e); }
}
