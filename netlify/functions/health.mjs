import { env, json } from "../lib/common.mjs";
export default async () => json({ configured: !!env("SP_TOKEN"), pinRequired: !!env("APP_PIN") });
export const config = { path: "/api/health" };
