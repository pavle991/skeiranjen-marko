// GET /api/diag -> provera veze (bez ličnih podataka)
// Uz to proverava i da li token sme da PRAVI najave: šalje namerno neispravnu najavu (nepostojeći tip),
// koju Slanje Paketa mora da odbije - ništa se ne kreira. Po odgovoru se vidi da li je problem dozvola ili podaci.
import { json, sp, slimProduct, slimShipment } from "../../lib/common.js";
export async function onRequestGet({ env }) {
  const out = { kv: !!env.META };
  try { const j = await sp(env, "/products?limit=2&sort=-created_at"); out.products = (j.data || []).map(slimProduct); } catch (e) { out.products = "GREŠKA " + e.status + ": " + e.message; }
  try { const j = await sp(env, "/product-shipments?limit=1&sort=-created_at"); out.shipments = (j.data || []).map(slimShipment); } catch (e) { out.shipments = "GREŠKA " + e.status + ": " + e.message; }
  // Privremeno: koja kombinacija polja prolazi. Sve probe imaju nepostojeći artikal, pa ne mogu da naprave pravu najavu;
  // ako bi ipak nastala, odmah se briše.
  const last = ((await sp(env, "/product-shipments?limit=10&sort=-created_at").catch(() => ({}))).data || []).find((x) => x.type === "RECEIPT") || {};
  const P = last.pickup_warehouse_location_id, D = last.delivery_warehouse_location_id;
  try { const w = await sp(env, "/warehouse-locations"); out.lokacije = (w.data || []).map((l) => [l._id, l.name, l.client_id ? "vaša" : "Slanje Paketa"]); } catch (e) { out.lokacije = "GREŠKA " + e.message; }
  const X = [{ code: "__NEPOSTOJECI_ARTIKAL__", ean_code: null, should_barcode: false, dispatch_quantity: 1 }];
  const probes = {
    G_samostalno_D: { type: "RECEIPT", delivery_type: "GOODS_INDEPENDENT_DELIVERY", pickup_warehouse_location_id: null, delivery_warehouse_location_id: D, products: X },
    H_preuzimanje_P_D: { type: "RECEIPT", delivery_type: "GOODS_PICK_UP", pickup_warehouse_location_id: P, delivery_warehouse_location_id: D, products: X },
    I_preuzimanje_bez_P: { type: "RECEIPT", delivery_type: "GOODS_PICK_UP", pickup_warehouse_location_id: null, delivery_warehouse_location_id: D, products: X },
  };
  out.probe = { P, D };
  for (const [k, body] of Object.entries(probes)) {
    try {
      const j = await sp(env, "/product-shipments", { method: "POST", body: JSON.stringify(body) });
      const id = (j.data || j)._id; let del = "";
      if (id) { try { await sp(env, "/product-shipments/" + id, { method: "DELETE" }); del = " (obrisano)"; } catch (e) { del = " (NIJE OBRISANO: " + id + ")"; } }
      out.probe[k] = "PRIHVAĆENO" + del;
    } catch (e) { out.probe[k] = e.status + " " + (e.body && e.body.code) + ": " + e.message; }
  }
  try {
    const j = await sp(env, "/product-shipments", { method: "POST", body: JSON.stringify({ type: "PROVERA_DOZVOLE", products: [] }) });
    out.write_test = { status: "NEOČEKIVANO PRIHVAĆENO", body: j };
  } catch (e) {
    out.write_test = { status: e.status, message: e.message, body: e.body,
      zakljucak: e.status === 401 || e.status === 403 || (e.body && e.body.code === 100208) ? "Token NEMA dozvolu za pravljenje najava" : "Dozvola postoji (odbijeno zbog podataka, što je očekivano)" };
  }
  return json(out);
}
