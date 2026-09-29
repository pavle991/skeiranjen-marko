// Zajedničke oznake prijema (ko je kreirao, kad je štampano) u Cloudflare KV (binding: META).
import { json } from "../../lib/common.js";
const KEY = "prijemi";
const load = async (env) => (env.META ? (await env.META.get(KEY, { type: "json" })) || {} : {});

export async function onRequestGet({ env }) { return json(await load(env)); }

export async function onRequestPost({ request, env }) {
  if (!env.META) return json({ error: "KV (META) nije povezan" }, 500);
  const { id, patch } = await request.json().catch(() => ({}));
  if (!id || typeof patch !== "object") return json({ error: "Nedostaje id ili patch" }, 400);
  const all = await load(env);
  all[id] = { ...(all[id] || {}), ...patch, updatedAt: new Date().toISOString() };
  // čuvaj poslednjih 500 prijema
  const keys = Object.keys(all);
  if (keys.length > 500) keys.sort((a, b) => String(all[a].updatedAt).localeCompare(String(all[b].updatedAt))).slice(0, keys.length - 500).forEach((k) => delete all[k]);
  await env.META.put(KEY, JSON.stringify(all));
  return json(all[id]);
}
