# Outfit Oracle 🧥✨

Eine kleine „Outfit-Idee“-WebApp (React + Chakra UI) im Apple-esque Look.

## Features
- **Start**: Begrüßung + Wetter + Outfit-Vorschlag (temperatur-/regenabhängig)
- **Outfit-Aktionen**: alles neu, einzelne Komponente ersetzen, „Ziehe ich heute an“ (History)
- **History**: letzte Woche standardmäßig (7/14/30 Tage)
- **Schrank**: Kleidung anlegen/bearbeiten/löschen inkl. Foto-Crop & Upload
- **PWA**: Manifest + Icons via `vite-plugin-pwa`

## Tech-Stack
- React + TypeScript (Vite)
- Chakra UI
- Supabase (Auth + Postgres + Storage)
- OpenWeather (aktuelles Wetter)
- Hosting: GitHub Pages (statisch)

---

## Lokal starten
1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. `.env.local` im Projektroot anlegen (siehe `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
3. Dev-Server:
   ```bash
   npm run dev
   ```

> Hinweis: In dieser Sandbox konnte `npm install` nicht ausgeführt werden (kein Registry-Zugriff). Auf deinem Rechner klappt’s.

---

## Supabase einrichten
### 1) Tabellen/RLS
- Öffne in Supabase **SQL Editor** und führe `supabase/schema.sql` aus.

### 2) Storage Bucket
- Lege in Supabase Storage einen Bucket **`clothes`** an.
- Für den Start am einfachsten: Bucket auf **Public**.
  - Dann funktionieren `getPublicUrl()`-Links sofort.

### 3) Auth Redirect URLs
Damit Magic Links auf GitHub Pages funktionieren:
- Supabase → **Authentication → URL Configuration**
- `Site URL`: `https://<USERNAME>.github.io/<REPO>/`
- `Additional Redirect URLs`: dieselbe URL (ggf. auch `http://localhost:5173/`)

---

## GitHub Pages Deployment
Empfohlen: GitHub Actions.

1. Repo Settings → Pages → Source: **GitHub Actions**
2. Lege Secrets an (Settings → Secrets and variables → Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENWEATHER_API_KEY`
3. Push auf `main` triggert Build & Deploy.

Workflow liegt in `.github/workflows/deploy.yml`.

---

## Outfit-Logik (kurz)
- Wetter → Zielwerte (z.B. `kalt` → Outerwear + höheres Wärme-Level)
- Scoring pro Kleidungsstück:
  - persönliches Rating
  - „wann zuletzt getragen“
  - Wärme-Fit zur Temperatur
  - Regenfestigkeit (bei Regen für Jacke/Schuhe)
- Auswahl: gewichtet zufällig aus den Top-Kandidaten für etwas Varianz.

Alles in `src/lib/outfitEngine.ts` – easy anpassbar.

---

## Fotos einheitlich bekommen (Praxis)
- Immer ähnliches Licht (Fenster/Tageslicht), neutraler Hintergrund
- Kleidungsstück flach ausbreiten oder aufhängen, ohne Chaos im Hintergrund
- In der App: **Quadratisch zuschneiden** (Crop-Modal)

Optionaler nächster Schritt:
- Background-Removal (z.B. via `remove.bg` oder ein eigenes ML-Modell) – aktuell nicht eingebaut.

---

## Nächste sinnvolle Erweiterungen
- Vorgefertigte Outfit-Kombinationen (Template-Tabelle + UI)
- Farb-/Stil-Kompatibilität (Tags + Regeln)
- Mehrere Outfit-Vorschläge pro Tag
- Statistiken (meistgetragen, best-rated, „Schrank-Favoriten“)
- Private Storage (Signed URLs statt Public Bucket)

Viel Spaß beim Weiterbauen! 🚀
