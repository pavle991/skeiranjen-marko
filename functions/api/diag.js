// GET /api/diag -> provera veze (bez ličnih podataka)
import { json, sp, slimProduct, slimShipment } from "../../lib/common.js";
export async function onRequestGet({ env }) {
  const out = { kv: !!env.META };
  try { const j = await sp(env, "/products?limit=2&sort=-created_at"); out.products = (j.data || []).map(slimProduct); } catch (e) { out.products = "GREŠKA " + e.status + ": " + e.message; }
  try { const j = await sp(env, "/product-shipments?limit=2&sort=-created_at"); out.shipments = (j.data || []).map(slimShipment); } catch (e) { out.shipments = "GREŠKA " + e.status + ": " + e.message; }
  return json(out);
}
