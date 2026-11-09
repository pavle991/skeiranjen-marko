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
    // Robu donosite sami (GOODS_INDEPENDENT_DELIVERY): lokacija preuzimanja mora biti null.
    // Magacin isporuke (obavezan): kao u poslednjem prijemu, inače Slanje Paketa magacin sa liste lokacija.
    const last = ((await sp(env, "/product-shipments?limit=10&sort=-created_at")).data || []).find((s) => s.type === "RECEIPT");
    let delivery = last && last.delivery_warehouse_location_id;
    if (!delivery) {
      const w = (await sp(env, "/warehouse-locations")).data || [];
      delivery = (w.find((l) => !l.client_id) || w[0] || {})._id;
    }
    const body = {
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
