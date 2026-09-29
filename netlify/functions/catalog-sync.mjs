// Pozadinska funkcija (do 15 min): preuzme ceo katalog iz Slanje Paketa.
import { env } from "../lib/common.mjs";
import { fullSync } from "../lib/catalog.mjs";

export default async (req) => {
  if (req.headers.get("x-sync-key") !== env("SP_TOKEN")) return;
  await fullSync();
};
export const config = { background: true, path: "/api/catalog-sync" };
