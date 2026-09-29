// GET /api/diag -> kratka provera veze (bez ličnih podataka)
import { json, pinOk, sp, slimProduct, slimShipment } from "../lib/common.mjs";
export default async (req) => {
  if (!pinOk(req)) return json({ error: "Pogrešan PIN aplikacije" }, 401);
  const out = {};
  try { const j = await sp("/products?limit=2"); out.products = (j.data || []).map(slimProduct); } catch (e) { out.products = "GREŠKA " + e.status + ": " + e.message; }
  try { const j = await sp("/product-shipments?limit=2&sort=-created_at"); out.shipments = (j.data || []).map(slimShipment); } catch (e) { out.shipments = "GREŠKA " + e.status + ": " + e.message; }
  return json(out);
};
export const config = { path: "/api/diag" };
