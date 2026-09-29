import { onRequestGet as __api_catalog_new_js_onRequestGet } from "/home/claude/skeiranjen-marko/functions/api/catalog-new.js"
import { onRequestGet as __api_diag_js_onRequestGet } from "/home/claude/skeiranjen-marko/functions/api/diag.js"
import { onRequestGet as __api_health_js_onRequestGet } from "/home/claude/skeiranjen-marko/functions/api/health.js"
import { onRequestGet as __api_meta_js_onRequestGet } from "/home/claude/skeiranjen-marko/functions/api/meta.js"
import { onRequestPost as __api_meta_js_onRequestPost } from "/home/claude/skeiranjen-marko/functions/api/meta.js"
import { onRequestGet as __api_receipts_js_onRequestGet } from "/home/claude/skeiranjen-marko/functions/api/receipts.js"
import { onRequestPost as __api_receipts_js_onRequestPost } from "/home/claude/skeiranjen-marko/functions/api/receipts.js"
import { onRequest as ___middleware_js_onRequest } from "/home/claude/skeiranjen-marko/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/catalog-new",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_catalog_new_js_onRequestGet],
    },
  {
      routePath: "/api/diag",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_diag_js_onRequestGet],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_js_onRequestGet],
    },
  {
      routePath: "/api/meta",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_meta_js_onRequestGet],
    },
  {
      routePath: "/api/meta",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_meta_js_onRequestPost],
    },
  {
      routePath: "/api/receipts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_receipts_js_onRequestGet],
    },
  {
      routePath: "/api/receipts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_receipts_js_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]