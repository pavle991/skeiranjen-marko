import { json } from "../../lib/common.js";
export const onRequestGet = ({ env }) => json({ configured: !!env.SP_TOKEN, pinRequired: !!env.APP_PIN, meta: !!env.META, host: "cloudflare" });
