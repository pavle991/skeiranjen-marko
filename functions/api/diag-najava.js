// GET /api/diag-najava -> sistematska provera: koja kombinacija (način dostave × magacin isporuke) Slanje Paketa prihvata.
// Svaka proba ima NEPOSTOJEĆI artikal, pa ne može da nastane prava najava; ako bi ipak nastala, odmah se briše.
// Tumačenje: "401 100208" = odbijeno zbog dozvole/lokacije; "500 100000" ili 400 = lokacija prihvaćena, odbijen tek artikal (to je cilj).
import { json, sp } from "../../lib/common.js";

export async function onRequestGet({ env }) {
  const out = {};
  const ships = (await sp(env, "/product-shipments?limit=20&sort=-created_at").catch(() => ({}))).data || [];
  const last = ships.find((x) => x.type === "RECEIPT") || {};
  out.poslednji_prijem = { broj: last.client_number, nacin: last.delivery_type, preuzimanje: last.pickup_warehouse_location_id, isporuka: last.delivery_warehouse_location_id };
  let locs = [];
  try { locs = (await sp(env, "/warehouse-locations")).data || []; } catch (e) { out.lokacije_greska = e.status + " " + e.message; }
  out.lokacije = locs.map((l) => ({ id: l._id, naziv: l.name, vlasnik: l.client_id ? "vaša" : "Slanje Paketa" }));
  const own = locs.filter((l) => l.client_id);
  const X = [{ code: "__NEPOSTOJECI_ARTIKAL__", ean_code: null, should_barcode: false, dispatch_quantity: 1 }];
  const tries = [];
  for (const l of locs) {
    tries.push({ nacin: "GOODS_INDEPENDENT_DELIVERY", preuzimanje: null, isporuka: l });
    if (own[0] && own[0]._id !== l._id) tries.push({ nacin: "GOODS_PICK_UP", preuzimanje: own[0], isporuka: l });
  }
  tries.push({ nacin: "GOODS_INDEPENDENT_DELIVERY", preuzimanje: null, isporuka: null });
  out.rezultati = [];
  for (const t of tries.slice(0, 24)) {
    const body = { type: "RECEIPT", delivery_type: t.nacin, pickup_warehouse_location_id: t.preuzimanje ? t.preuzimanje._id : null,
      delivery_warehouse_location_id: t.isporuka ? t.isporuka._id : null, products: X };
    let r;
    try {
      const j = await sp(env, "/product-shipments", { method: "POST", body: JSON.stringify(body) });
      const id = (j.data || j)._id; let del = "";
      if (id) { try { await sp(env, "/product-shipments/" + id, { method: "DELETE" }); del = " (obrisano)"; } catch (e) { del = " (NIJE OBRISANO " + id + ")"; } }
      r = "PRIHVAĆENO" + del;
    } catch (e) { r = e.status + " " + (e.body && e.body.code) + " " + e.message; }
    out.rezultati.push((t.nacin === "GOODS_PICK_UP" ? "preuzimanje sa „" + t.preuzimanje.name + "“" : "sami donosimo") + " → „" + (t.isporuka ? t.isporuka.name : "bez magacina") + "“: " + r);
  }
  return json(out);
}
