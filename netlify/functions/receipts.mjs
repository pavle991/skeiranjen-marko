// GET  /api/receipts          -> poslednji prijemi (skraćeno)
// GET  /api/receipts?id=...   -> jedan prijem
// POST /api/receipts {items:[{code,qty}]} -> kreira najavu prijema (RECEIPT)
import { json, pinOk, sp, slimShipment } from "../lib/common.mjs";

export default async (req) => {
  if (!pinOk(req)) return json({ error: "Pogrešan PIN aplikacije" }, 401);
  try {
    if (req.method === "GET") {
      const id = new URL(req.url).searchParams.get("id");
      if (id) { const j = await sp("/product-shipments/" + encodeURIComponent(id)); return json(slimShipment(j.data || j)); }
      const j = await sp("/product-shipments?limit=60&sort=-created_at");
      return json((j.data || []).filter((s) => s.type === "RECEIPT").map(slimShipment));
    }
    if (req.method === "POST") {
      const { items } = await req.json();
      if (!Array.isArray(items) || !items.length) return json({ error: "Prijem je prazan" }, 400);
      // Lokacije i način dostave kao u poslednjem prijemu (podrazumevano za ovaj nalog)
      const last = ((await sp("/product-shipments?limit=20&sort=-created_at")).data || []).find((s) => s.type === "RECEIPT");
      const body = {
        type: "RECEIPT",
        delivery_type: last?.delivery_type || "GOODS_PICK_UP",
        pickup_warehouse_location_id: last ? last.pickup_warehouse_location_id : null,
        delivery_warehouse_location_id: last ? last.delivery_warehouse_location_id : null,
        products: items.map((i) => ({ code: i.code, dispatch_quantity: Number(i.qty) })),
      };
      if (body.delivery_type !== "GOODS_PICK_UP") body.pickup_warehouse_location_id = null;
      const j = await sp("/product-shipments", { method: "POST", body: JSON.stringify(body) });
      return json(slimShipment(j.data || j), 201);
    }
    return json({ error: "Metod nije dozvoljen" }, 405);
  } catch (e) {
    return json({ error: e.message, details: typeof e.body === "object" ? e.body : undefined }, e.status && e.status < 600 ? e.status : 502);
  }
};
export const config = { path: "/api/receipts" };
