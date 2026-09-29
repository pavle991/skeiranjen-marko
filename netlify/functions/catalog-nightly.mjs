// Svake noći ponovo izgradi ceo katalog (hvata i izmene naziva/slika).
export default async (req) => {
  const base = process.env.URL || "";
  await fetch(base + "/api/catalog-sync", { method: "POST", headers: { "x-sync-key": process.env.SP_TOKEN || "" } });
};
export const config = { schedule: "0 2 * * *" };
