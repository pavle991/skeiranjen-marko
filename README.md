# Skener prijema – Di Valgoni

Web aplikacija za prijem robe skeniranjem (kamera telefona), štampu nalepnica i pregled prijema iz Slanje Paketa.
Radi na **Cloudflare Pages** (besplatno), kod je ovde na GitHub-u.

## Delovi
- `public/` – aplikacija (index.html se pravi iz `src/app.html` komandom `python3 build.py`)
- `functions/` – Cloudflare funkcije; jedine znaju token, a lične podatke iz API-ja uklanjaju pre slanja telefonu
  - `/api/health` – da li je veza podešena
  - `/api/catalog-new` – najnoviji artikli direktno iz Slanje Paketa
  - `/api/receipts` – lista prijema i kreiranje najave prijema (RECEIPT)
  - `/api/meta` – zajedničke oznake prijema (ko je kreirao, kad je štampano), Cloudflare KV
  - `/api/diag` – provera veze
  - `_middleware.js` – PIN za API i katalog
- `scripts/sync-catalog.mjs` + `.github/workflows/katalog.yml` – GitHub svake noći preuzme ceo katalog
  (~8.700 artikala) i sačuva skraćeno u `public/data/catalog.json`

## Podešavanje
**Cloudflare Pages** (Workers & Pages → Create → Pages → Connect to Git → ovaj repozitorijum):
- Build command: prazno · Build output directory: `public`
- Settings → Variables and Secrets: `SP_TOKEN` (Secret), `APP_PIN` (Secret)
- Settings → Bindings → KV namespace: ime promenljive `META`, namespace npr. `skener-prijemi`
- Posle izmena: Deployments → Retry deployment

**GitHub** (Settings → Secrets and variables → Actions → New repository secret):
- `SP_TOKEN` – isti token (za noćno preuzimanje kataloga)
- Prvi put ručno: Actions → Katalog → Run workflow
