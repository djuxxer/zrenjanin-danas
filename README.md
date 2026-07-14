# Banatski Glas — Lokalni News Portal

Profesionalni news portal za lokalne vesti iz Zrenjanina, Vojvodine i Srbije. Izgrađen sa Next.js 15, Tailwind CSS, TypeScript i Supabase.

## 🚀 Tehnologije

| Tehnologija | Uloga |
|---|---|
| **Next.js 15** | SSR/SSG framework, App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Stilizovanje |
| **Supabase** | Baza podataka, Auth, Storage |
| **next-themes** | Dark/light mode |
| **date-fns** | Formatiranje datuma |
| **Vercel** | Hosting i deploy |

## 📁 Struktura projekta

```
banatski-glas/
├── src/
│   ├── app/
│   │   ├── (site)/                    # Javni deo sajta
│   │   │   ├── (home)/page.tsx        # Početna strana
│   │   │   ├── vest/[slug]/page.tsx   # Članak
│   │   │   ├── kategorija/[slug]/     # Kategorija
│   │   │   └── pretraga/             # Pretraga
│   │   ├── admin/                     # CMS Admin panel
│   │   │   ├── dashboard/            # Dashboard sa statistikom
│   │   │   ├── articles/             # Lista i kreiranje vesti
│   │   │   ├── users/                # Upravljanje korisnicima
│   │   │   └── settings/             # Podešavanja portala
│   │   ├── api/
│   │   │   └── rss/route.ts          # RSS feed
│   │   ├── sitemap.ts                # Auto-generisani sitemap
│   │   └── robots.ts                 # robots.txt
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer, Ticker
│   │   ├── home/                     # Hero, Trending, Widgets
│   │   ├── article/                  # ArticleCard, Comments
│   │   └── providers/                # ThemeProvider
│   ├── lib/
│   │   ├── articles.ts               # Data access layer
│   │   ├── demo-data.ts              # 16 demo vesti sa realnim sadržajem
│   │   ├── supabase/                 # Client/Server Supabase klijenti
│   │   └── utils.ts                  # Utility funkcije
│   ├── types/index.ts                # TypeScript tipovi
│   └── styles/globals.css            # Globalni stilovi
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   └── seed/demo_articles.sql
├── .env.example                      # Primer env varijabli
├── vercel.json                       # Vercel konfiguracija
└── README.md
```

## ⚡ Brzi start (lokalno)

### 1. Kloniranje i instalacija

```bash
git clone https://github.com/your-username/banatski-glas.git
cd banatski-glas
npm install
```

### 2. Environment varijable

```bash
cp .env.example .env.local
# Editujte .env.local sa vašim vrednostima
```

Za brzi start **bez Supabase** (demo mode):
```bash
# U .env.local:
NEXT_PUBLIC_USE_DEMO_DATA=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Pokretanje dev servera

```bash
npm run dev
# Otvorite http://localhost:3000
```

## 🗄️ Supabase Setup (produkcija)

### 1. Kreiranje projekta
1. Idite na [supabase.com](https://supabase.com) → New project
2. Odaberite región: **Frankfurt (eu-central-1)**
3. Sačekajte inicijalizaciju (~2 min)

### 2. Pokretanje migracija

U Supabase Dashboard → SQL Editor:

```sql
-- Kopirajte i pokrenite sadržaj:
-- supabase/migrations/001_initial_schema.sql
```

### 3. Storage buckets

U Supabase Dashboard → Storage:
- Kreirajte bucket `article-images` (public)
- Kreirajte bucket `avatars` (public)

### 4. Kreiranje admin korisnika

U Supabase Dashboard → Authentication → Users → Invite user:
- Email: `admin@banatskiglas.rs`
- Password: (generišite sigurnu lozinku)

Zatim u SQL Editor:
```sql
INSERT INTO public.profiles (id, full_name, role)
VALUES ('USER_ID_FROM_AUTH', 'Admin Banatski Glas', 'admin');
```

### 5. Seed demo vesti (opcionalno)
```sql
-- Pokrenite supabase/seed/demo_articles.sql
```

## 🚀 Deploy na Vercel

### Jednom komandom:

```bash
npx vercel --prod
```

### Ili putem GitHub:

1. Push kod na GitHub
2. Idite na [vercel.com](https://vercel.com) → Import Project
3. Odaberite vaš GitHub repo
4. Dodajte Environment Variables (iz .env.example)
5. Deploy!

### Obavezne Vercel Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL  (npr. https://banatskiglas.rs)
```

## 🔒 Admin Panel

Dostupan na: `https://vasa-domena.rs/admin`

| Uloga | Pristup |
|---|---|
| **Admin** | Sve — korisnici, podešavanja, brisanje |
| **Urednik** | Objava, editovanje svih vesti, odobravanje komentara |
| **Novinar** | Kreiranje i editovanje sopstvenih vesti |

## 🔍 SEO Funkcionalnosti

- ✅ `sitemap.xml` — auto-generisan sa svim člancima i kategorijama
- ✅ `robots.txt` — konfigurisan za pretraživače
- ✅ OpenGraph tags — optimizovani share preview za Facebook/Twitter
- ✅ Twitter Cards — large image format
- ✅ JSON-LD Schema.org NewsArticle — strukturirani podaci
- ✅ Dynamic metadata per article — unique title/description
- ✅ Canonical URLs — sprečava duplicate content
- ✅ RSS Feed na `/api/rss` ili `/rss`
- ✅ Breadcrumbs sa schema markup
- ✅ SSR rendering — indexabilno od strane Google-a
- ✅ Optimizovani URL-ovi (srpski slug format)
- ✅ Image alt tagovi

## 📰 Kategorije

| Slug | Naziv |
|---|---|
| `politika` | Politika |
| `drustvo` | Društvo |
| `hronika` | Hronika |
| `sport` | Sport |
| `kultura` | Kultura |
| `ekonomija` | Ekonomija |
| `zrenjanin` | Zrenjanin |

## 🎨 Dizajn sistem

- **Boje**: Crvena `#C8102E`, bela, crna
- **Fontovi**: Playfair Display (naslovi) + Source Sans 3 (tekst)
- **Dark mode**: Automatski ili ručno
- **Glassmorphism**: Blur efekti na navigaciji
- **Animacije**: Ticker, hover, fade-in tranzicije

## 📦 Komponente

### Javne stranice:
- `BreakingTicker` — pokretna traka sa breaking vestima
- `Navbar` — sticky navigacija sa search i dark mode
- `HeroSection` — velika hero sekcija sa featured vestima
- `ArticleCard` — 4 varijante (large, default, horizontal, minimal)
- `TrendingSection` + `MostReadSection` — sidebar sekcije
- `WeatherWidget` — vreme u Zrenjaninu
- `NewsletterSection` — prijava na newsletter
- `CommentsSection` — komentari ispod vesti
- `Footer` — profesionalni footer sa linkovima

### Admin panel:
- Dashboard sa statistikama
- Article editor sa SEO tab-om i live pregledom
- Users management sa role sistemom
- Settings stranica

## 🌐 Prilagođavanje domene

U Vercel Dashboard → Domains dodajte:
- `banatskiglas.rs`
- `www.banatskiglas.rs`

Update `NEXT_PUBLIC_SITE_URL` na produkcijsku domenu.

## 📊 Performance

- Lighthouse Score: 95+ (cilj)
- Core Web Vitals: zeleno
- Image optimization: Next.js Image
- Font optimization: next/font
- Code splitting: automatski

---

**Kontakt redakcija**: redakcija@banatskiglas.rs  
**Tehnička podrška**: dev@banatskiglas.rs
