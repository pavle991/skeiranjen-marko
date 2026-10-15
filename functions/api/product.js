// GET /api/product?code=Šifra proizvoda -> tačan artikal po šifri (direktno iz Slanje Paketa)
import { json, sp, slimProduct, fail } from "../../lib/common.js";
export async function onRequestGet({ request, env }) {
  const code = (new URL(request.url).searchParams.get("code") || "").trim();
  if (!code) return json({ error: "Nedostaje šifra" }, 400);
  try {
    const j = await sp(env, "/products?limit=5&code=" + encodeURIComponent(code));
    return json({ items: (j.data || []).map(slimProduct) });
  } catch (e) { return fail(e); }
}
