// GET  /api/receipts          -> poslednji prijemi (skraćeno)
// GET  /api/receipts?id=...   -> jedan prijem
// POST /api/receipts {items:[{code,qty}]} -> nova najava prijema (RECEIPT)
import { json, sp, slimShipment, fail } from "../../lib/common.js";

export async function onRequestGet({ request, env }) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (id) { const j = await sp(env, "/product-shipments/" + encodeURIComponent(id)); return json(slimShipment(j.data || j)); }
    const j = await sp(env, "/product-shipments?limit=40&sort=-created_at");
    return json((j.data || []).filter((s) => s.type === "RECEIPT").map(slimShipment));
  } catch (e) { return fail(e); }
}

export async function onRequestPost({ request, env }) {
  try {
    const { items } = await request.json();
    if (!Array.isArray(items) || !items.length) return json({ error: "Prijem je prazan" }, 400);
    // Po uputstvu Slanje Paketa: robu donosimo sami, magacin isporuke je uvek "RS Slanje Paketa magacin".
    const delivery = env.SP_DELIVERY_LOCATION || "63469d2fd2727cc620fa2b24";
    const body = {
      _id: null, // po uputstvu podrške Slanje Paketa (10.11.2026)
      type: "RECEIPT",
      delivery_type: env.SP_DELIVERY_TYPE || "GOODS_INDEPENDENT_DELIVERY",
      pickup_warehouse_location_id: null,
      delivery_warehouse_location_id: delivery,
      products: items.map((i) => ({ code: String(i.code), ean_code: null, should_barcode: false, dispatch_quantity: Number(i.qty) })),
    };
    const j = await sp(env, "/product-shipments", { method: "POST", body: JSON.stringify(body) });
    return json(slimShipment(j.data || j), 201);
  } catch (e) { return fail(e); }
}
