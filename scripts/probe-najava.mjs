// Pregled: najave koje sadrže probni artikal "__NEPOSTOJECI_ARTIKAL__" (samo čitanje).
import { sp } from "../lib/common.js";
const env = { SP_TOKEN: process.env.SP_TOKEN };
const del = process.env.OBRISI === "da";
const j = await sp(env, "/product-shipments?limit=50&sort=-created_at");
for (const s of j.data || []) {
  if ((s.products || []).some((p) => p.code === "__NEPOSTOJECI_ARTIKAL__")) {
    let r = "";
    if (del && s.status === "CREATED" && s.products.every((p) => p.code === "__NEPOSTOJECI_ARTIKAL__")) {
      try { await sp(env, "/product-shipments/" + s._id, { method: "DELETE" }); r = " -> OBRISANO"; } catch (e) { r = " -> brisanje nije uspelo: " + e.message; }
    }
    console.log("PROBA", s.client_number, s._id, s.status, s.delivery_type, s.delivery_warehouse_location_id, s.created_at, s.products.length + " stavki" + r);
  }
}
console.log("PROBA kraj");
