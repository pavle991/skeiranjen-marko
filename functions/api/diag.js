// GET /api/diag -> provera veze (bez ličnih podataka)
// Uz to proverava i da li token sme da PRAVI najave: šalje namerno neispravnu najavu (nepostojeći tip),
// koju Slanje Paketa mora da odbije - ništa se ne kreira. Po odgovoru se vidi da li je problem dozvola ili podaci.
import { json, sp, slimProduct, slimShipment } from "../../lib/common.js";
export async function onRequestGet({ env }) {
  const out = { kv: !!env.META };
  try { const j = await sp(env, "/products?limit=2&sort=-created_at"); out.products = (j.data || []).map(slimProduct); } catch (e) { out.products = "GREŠKA " + e.status + ": " + e.message; }
  try { const j = await sp(env, "/product-shipments?limit=1&sort=-created_at"); out.shipments = (j.data || []).map(slimShipment); } catch (e) { out.shipments = "GREŠKA " + e.status + ": " + e.message; }
  return json(out);
}
