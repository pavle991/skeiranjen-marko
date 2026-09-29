// Zajedničko za Cloudflare funkcije i GitHub sinhronizaciju. Token nikad ne ide na telefon.
export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export const pinOk = (request, env) => !env.APP_PIN || request.headers.get("x-app-pin") === env.APP_PIN;

export const base = (env) => (env.SP_BASE_URL || "https://softver.slanjepaketa.rs/api/v1").replace(/\/$/, "");

// Poziv ka Slanje Paketa API-ju
export async function sp(env, path, init = {}) {
  if (!env.SP_TOKEN) throw Object.assign(new Error("SP_TOKEN nije podešen"), { status: 500 });
  const r = await fetch(base(env) + path, {
    ...init,
    headers: { Authorization: "Private " + env.SP_TOKEN, Accept: "application/json", "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok) {
    const msg = (body && (body.message || body.error || (body.errors && JSON.stringify(body.errors)))) || String(text).slice(0, 300) || "HTTP " + r.status;
    throw Object.assign(new Error(msg), { status: r.status, body });
  }
  return body;
}

// Samo polja koja aplikaciji trebaju. API uz svaki zapis vraća i lične podatke vlasnika,
// lozinke korisnika itd. - to ne sme da stigne do telefona.
// Artikal: [_id, sp_code, code, name, image, url, [ean]]
export const slimProduct = (p) => [p._id, p.sp_code || "", p.code || "", p.name || "", p.image || "", p.url || "",
  (p.ean_codes || []).map((e) => (typeof e === "string" ? e : e && (e.code || e.value))).filter(Boolean)];

export const slimShipment = (s) => ({
  _id: s._id, number: s.client_number ?? s.annual_number ?? s.global_number, type: s.type, status: s.status, delivery_type: s.delivery_type,
  pickup_warehouse_location_id: s.pickup_warehouse_location_id, delivery_warehouse_location_id: s.delivery_warehouse_location_id,
  created_at: s.created_at, arrived_at: s.arrived_at, counted_at: s.counted_at, shipped_at: s.shipped_at, note: s.note,
  products: (s.products || []).map((l) => ({ code: l.code, ean_code: l.ean_code, dispatch_quantity: l.dispatch_quantity, receipt_quantity: l.receipt_quantity })),
});

export const fail = (e) => json({ error: e.message, details: e.body && typeof e.body === "object" ? e.body : undefined }, e.status && e.status >= 400 && e.status < 600 ? e.status : 502);
