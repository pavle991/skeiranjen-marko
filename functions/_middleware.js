// Katalog (/data/...) i API traže PIN aplikacije.
import { json, pinOk } from "../lib/common.js";
export async function onRequest({ request, env, next }) {
  const p = new URL(request.url).pathname;
  if ((p.startsWith("/data/") || (p.startsWith("/api/") && p !== "/api/health")) && !pinOk(request, env)) {
    return json({ error: "Pogrešan PIN aplikacije" }, 401);
  }
  return next();
}
