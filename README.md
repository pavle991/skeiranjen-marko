# Skener prijema – Di Valgoni

Web aplikacija za prijem robe skeniranjem (kamera telefona), štampu nalepnica i pregled prijema iz Slanje Paketa.

## Delovi
- `public/` – aplikacija (index.html, ikonice)
- `netlify/functions/` – server koji jedini zna API token (telefon nikad ne vidi token ni lične podatke iz API-ja):
  - `/api/health` – da li je veza podešena
  - `/api/catalog` – skraćeni katalog (SP šifra, šifra, naziv, slika) iz Netlify Blobs; nove artikle dopunjava sam
  - `/api/catalog-sync` – pozadinsko preuzimanje celog kataloga (prvi put ~1 min, pa svake noći u 2h)
  - `/api/receipts` – lista prijema i kreiranje najave prijema (RECEIPT)
  - `/api/meta` – zajedničke oznake prijema (ko je kreirao, kad je štampano)
  - `/api/diag` – provera veze

## Podešavanja na Netlify-ju (Environment variables)
| Promenljiva | Obavezno | Opis |
|---|---|---|
| `SP_TOKEN` | da | Pristupni token iz Slanje Paketa (Podešavanja → Integracije → API i webhookovi) |
| `APP_PIN` | preporučeno | PIN koji radnici upisuju jednom na telefonu; bez njega svako sa linkom može da koristi vezu |
| `SP_BASE_URL` | ne | Podrazumevano `https://softver.slanjepaketa.rs/api/v1` (ako https ne radi, server sam proba http) |

Posle izmene promenljivih: Deploys → Trigger deploy.
