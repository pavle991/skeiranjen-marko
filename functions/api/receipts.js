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
    // Lokacije i način dostave kao u poslednjem prijemu ovog naloga
    const last = ((await sp(env, "/product-shipments?limit=10&sort=-created_at")).data || []).find((s) => s.type === "RECEIPT");
    const body = {
      type: "RECEIPT",
      delivery_type: last?.delivery_type || "GOODS_PICK_UP",
      pickup_warehouse_location_id: last ? last.pickup_warehouse_location_id : null,
      delivery_warehouse_location_id: last ? last.delivery_warehouse_location_id : null,
      products: items.map((i) => ({ code: String(i.code), dispatch_quantity: Number(i.qty) })),
    };
    if (body.delivery_type !== "GOODS_PICK_UP") body.pickup_warehouse_location_id = null;
    const j = await sp(env, "/product-shipments", { method: "POST", body: JSON.stringify(body) });
    return json(slimShipment(j.data || j), 201);
  } catch (e) { return fail(e); }
}
