// Ista proba kao u aplikaciji, ali sa GitHub-a (drugi server, drugi IP, bez Cloudflare-a).
// Nepostojeći artikal -> ne može nastati prava najava; ako ipak nastane, odmah se briše.
import { sp } from "../lib/common.js";
const env = { SP_TOKEN: process.env.SP_TOKEN };
const X = [{ code: "__NEPOSTOJECI_ARTIKAL__", ean_code: null, should_barcode: false, dispatch_quantity: 1 }];
const tests = {
  sa_magacinom: { _id: null, type: "RECEIPT", delivery_type: "GOODS_INDEPENDENT_DELIVERY", pickup_warehouse_location_id: null, delivery_warehouse_location_id: "63469d2fd2727cc620fa2b24", products: X },
  bez_magacina: { _id: null, type: "RECEIPT", delivery_type: "GOODS_INDEPENDENT_DELIVERY", pickup_warehouse_location_id: null, products: X },
};
for (const [k, body] of Object.entries(tests)) {
  try {
    const j = await sp(env, "/product-shipments", { method: "POST", body: JSON.stringify(body) });
    const id = (j.data || j)._id; if (id) await sp(env, "/product-shipments/" + id, { method: "DELETE" }).catch(() => {});
    console.log("PROBA", k, "PRIHVAĆENO (obrisano)");
  } catch (e) { console.log("PROBA", k, e.status, JSON.stringify(e.body)); }
}
try { const j = await sp(env, "/products?limit=1"); console.log("PROBA citanje OK", (j.data || []).length); } catch (e) { console.log("PROBA citanje", e.status, e.message); }
