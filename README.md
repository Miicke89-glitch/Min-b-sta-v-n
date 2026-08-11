# Din bästa vän 🐾

Den digitala valppärmen. Svenska hunduppfödare fyller i pärmen en gång per
kull och delar den med sina valpköpare vid överlämningen — som en present,
inte ett administrationssystem.

- **Uppfödaren** skapar kennelprofil, lägger upp kull och valpar, laddar upp
  dokument, skriver egna råd och bjuder in köpare via en unik länk per valp.
- **Valpköparen** öppnar länken, loggar in med e-post (magic link) och får:
  sin valp, en veckovis tidslinje från vecka 8 till tre år, viktloggning mot
  rasens kurva, alla dokument, kullkamraterna med gemensam tråd, och en
  direktkanal till uppfödaren.

Stack: Next.js (App Router) · TypeScript · Tailwind · Supabase · Vercel.
Allt gränssnitt på svenska, mobil först.

## Kom igång lokalt

### 1. Skapa ett Supabase-projekt

1. Skapa ett projekt på [supabase.com](https://supabase.com) (gratisplanen räcker).
2. Öppna **SQL Editor** i Supabase-dashboarden, klistra in hela innehållet i
   [`supabase/schema.sql`](supabase/schema.sql) och kör det. Det skapar
   tabeller, RLS-policyer, funktioner och lagringsbuckets.
3. Gå till **Authentication → Providers → Email** och kontrollera att e-post
   är aktiverat (magic link är standard).
4. Gå till **Authentication → URL Configuration** och sätt
   `Site URL` till `http://localhost:3000` (byt till din Vercel-URL i produktion)
   samt lägg till `http://localhost:3000/auth/callback` under Redirect URLs.

### 2. Konfigurera miljövariabler

```bash
cp .env.example .env.local
```

Fyll i värdena från **Project Settings → API** i Supabase:

| Variabel | Värde |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public`-nyckeln |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role`-nyckeln (endast för seed — dela aldrig) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

### 3. Installera och seeda

```bash
npm install
npm run seed
```

Seedscriptet skapar tio rasprofiler och en komplett testkull:

- **Uppfödare:** `uppfodare@exempel.se` — Kennel Solgläntan med en
  labradorkull (4 valpar, född för ~10 veckor sedan)
- **Köpare:** `kopare1@exempel.se` (äger Sixten) och `kopare2@exempel.se`
  (äger Doris)
- Två oanslutna valpar med inbjudningslänkar (skrivs ut av scriptet)
- Exempeldokument, viktloggar, uppfödarråd, frågor och kullinlägg

Logga in med någon av adresserna via magic link. Lokalt utan egen
SMTP-konfiguration hittar du länken i Supabase-dashboarden under
**Authentication → Users → … → Send magic link**, eller konfigurera SMTP
under **Project Settings → Auth**.

### 4. Kör

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) — gärna i mobilläge i
devtools, appen är byggd mobil först (ner till 360 px).

## Deploy till Vercel

1. Pusha repot till GitHub och importera det i [Vercel](https://vercel.com/new).
2. Lägg in miljövariablerna under **Settings → Environment Variables**:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` och
   `NEXT_PUBLIC_APP_URL` (din produktions-URL). Service role-nyckeln behövs
   **inte** i Vercel — den används bara av seedscriptet lokalt.
3. Uppdatera i Supabase under **Authentication → URL Configuration**:
   `Site URL` = din Vercel-URL och lägg till
   `https://din-app.vercel.app/auth/callback` under Redirect URLs.
4. Deploya. Klart!

## Projektstruktur

```
supabase/schema.sql        Databas, RLS, funktioner, lagringsbuckets
scripts/seed.ts            Testdata (npm run seed)
src/data/tidslinje.json    Tidslinjens innehåll — redigerbart utan kodändringar
src/data/rasprofiler.json  Tio rasers vikt, kurvor, motion, päls, foder
src/lib/                   Supabase-klienter, server actions, hjälpfunktioner
src/app/uppfodare/         Uppfödarens vyer (kennel, kullar, dokument, råd, frågor)
src/app/valp/[id]/         Köparens vyer (min valp, tidslinje, vikt, dokument, kullen, fråga)
src/app/inbjudan/[token]/  Inbjudningsflödet
```

## Innehåll och hälsoinformation

Tidslinjen ([`src/data/tidslinje.json`](src/data/tidslinje.json)) och
rasprofilerna ([`src/data/rasprofiler.json`](src/data/rasprofiler.json)) är
seedbara datafiler — redigera texterna utan att röra komponenterna. Allt
hälsoinnehåll är formulerat som allmänna riktlinjer och hänvisar till
veterinär för medicinska bedömningar. Behåll den principen vid redigering.

## Ingår inte i v1

Betalningar, försäkringsjämförelse, hundvaktsbokning, push-notiser, native
app, SKK-integration, AI-funktioner.
