# MEGH FOODS — B2B EXPORT CATALOGUE & SELF-SERVICE ADMIN PORTAL

> Production-ready export product catalogue, enquiry basket, and self-service management portal built for **Megh Foods** (brand of **Megh Overseas Private Limited**, Ahmedabad & Changodar, Gujarat, India).

---

## 1. PROJECT OVERVIEW

Megh Foods is an Indian food, grocery, and general-goods exporter and consolidator supplying international supermarket chains, distributors, and ethnic wholesalers across North America, Europe, the Middle East, and Africa.

The catalogue encompasses **~2,140 SKU rows (~1,760 product pages)**:
- **~585 Own-Brand Megh SKUs**: Stone-ground flours, sortex pulses, basmati rice, handmade papad, farali fasting staples, mukhvas, spices, pooja essentials, and sports goods processed and packed at the company's Changodar facility.
- **~1,590 Partner FMCG SKUs**: Leading Indian brands (Parle, Haldiram's, Everest, MDH, Balaji, Wagh Bakri, Rooh Afza, Dabur, etc.) consolidated into mixed container consignments.

### Core Business Workflow Replaced
Previously, international buyers were required to review a 65-page static PDF, manually fill an Excel sheet, and email it back and forth. This platform replaces that friction with an interactive **Enquiry Basket**:
1. Commercial buyers browse products by category, brand, or dietary tag.
2. Buyers select export master carton configurations (e.g. `2LB x 20`, `400G x 24`).
3. Buyers download their shortlist as an Excel-ready CSV, forward it to WhatsApp, or submit a formal Request for Quotation (RFQ).
4. Megh Foods receives itemized carton counts and delivers an indicative FOB / CIF quotation within 24–48 hours.
5. **No public pricing or consumer checkout** is present; international trade is strictly carton-based and quote-driven.

---

## 2. TECH STACK

- **Framework**: Next.js 15 (App Router, Server Components by default, TypeScript Strict)
- **Styling**: Tailwind CSS, custom design tokens based on Megh logo (`#1B4FD8` royal blue, `#9CCB3B` lime green, `#0B1B3F` navy, `#F6F8FC` surface)
- **UI Components**: shadcn/ui, Radix UI primitives, Lucide React icons, Sonner toasts
- **Database & Auth**: Supabase PostgreSQL 15+, Row-Level Security (RLS), Supabase SSR Auth, Supabase Storage (`product-images`, `documents`)
- **Email Service**: Resend API (`resend`) with automated CSV attachment generation
- **Client Utilities**: Zustand (persistent Enquiry Basket), Fuse.js (in-browser fuzzy search), PapaParse (CSV streaming & export), React Hook Form, Zod

---

## 3. REPOSITORY STRUCTURE

```
├── app/
│   ├── (public pages)
│   │   ├── page.tsx               # Split-screen hero, 3 pillars, sourcing timeline, featured carousel
│   │   ├── products/              # B2B export catalogue explorer with Fuse.js search & filters
│   │   │   ├── page.tsx           # Server pre-renders top 24 items; mounts CatalogClient
│   │   │   └── [slug]/page.tsx    # Product detail, pack configuration table, JSON-LD, WhatsApp quote
│   │   ├── basket/page.tsx        # Enquiry Basket, CSV Excel download, WhatsApp forward, RFQ form
│   │   ├── range/[group]/         # Sourcing pillar archives (Megh Staples, Partner Brands, Pooja)
│   │   ├── category/[slug]/       # Category archive pages
│   │   ├── brand/[slug]/          # Brand archive pages (respects partner brand privacy flags)
│   │   ├── megh-brand/page.tsx    # Flagship Megh brand showcase
│   │   ├── mixed-container/       # Container consolidation guide, carton notation, CBM calculator
│   │   ├── private-label/         # OEM & contract manufacturing specifications
│   │   ├── about/page.tsx         # Corporate profile, Changodar plant, Ahmedabad HQ, CIN
│   │   ├── contact/page.tsx       # Trade desk, operating hours, general inquiry form
│   │   ├── privacy/page.tsx       # B2B privacy policy & data compliance
│   │   └── terms/page.tsx         # Terms of trade, indicative quotes, FOB/CIF conditions
│   ├── admin/
│   │   ├── layout.tsx             # Protected admin shell, sidebar navigation, system status
│   │   ├── login/page.tsx         # Secure email/password login
│   │   ├── page.tsx               # Analytics dashboard, live counters, recent enquiries
│   │   ├── products/page.tsx      # Product catalog manager, pack editor drawer, review tags
│   │   ├── brands/page.tsx        # Brand manager & public/private visibility toggle
│   │   ├── categories/page.tsx    # Category & Product Group taxonomy manager
│   │   ├── import/page.tsx        # CSV dry-run & live import interface
│   │   ├── images/page.tsx        # Bulk image upload & auto-matching (MF-SKU or slug)
│   │   ├── enquiries/             # Commercial RFQ review, status workflow, CSV packing sheet
│   │   └── settings/page.tsx      # Company details, WhatsApp number, PDF catalogue, certificates
│   ├── actions/                   # Public server actions (submitEnquiry with honeypot & throttle)
│   ├── api/
│   │   └── catalog-index/         # Fast edge-cached JSON index for Fuse.js client search
│   ├── sitemap.ts                 # Full XML sitemap (static, groups, categories, brands, products)
│   ├── robots.ts                  # Disallows /admin/ and /api/; allows catalogue crawlers
│   └── opengraph-image.tsx        # Dynamic OpenGraph card generator
├── components/
│   ├── public/                    # Header, Footer, ProductCard, BasketClient, CatalogClient, ContainerArt
│   ├── admin/                     # ProductSheetEditor, ImageUploader, BulkImagesClient, ImportClient
│   └── ui/                        # Reusable shadcn/ui primitives
├── data/
│   └── megh_products_clean.csv    # Master catalogue seed file (2,140 SKU rows, 1,747 products)
├── lib/
│   ├── supabase/                  # Supabase clients (client.ts, server.ts, public.ts, admin.ts)
│   ├── catalog/filter.ts          # Fuse.js search index builder & facet filtering logic
│   ├── basket/store.ts            # Zustand client storage for enquiry shortlist
│   ├── local-data.ts              # Fallback local catalogue parsed from CSV for zero-dependency builds
│   ├── settings.ts                # Site settings loader with default company fallback
│   ├── throttle.ts                # IP hash & rate limiting for enquiry anti-spam
│   ├── email.ts                   # Resend notification dispatcher with CSV attachment
│   └── seo.ts                     # Schema.org JSON-LD generators (Organization, Product, Breadcrumbs)
├── supabase/
│   └── migrations/
│       └── 001_init.sql           # Complete schema DDL, RLS policies, trigger functions
├── ADMIN_GUIDE.md                 # Plain-text user guide for the business owner
└── README.md                      # Engineering documentation & operational manual
```

---

## 4. ENVIRONMENT VARIABLES

Create a `.env.local` file in the project root based on this template:

```bash
# Public URL of the deployed application (used for metadataBase and sitemaps)
NEXT_PUBLIC_SITE_URL=https://www.meghfoods.com

# Supabase Project API Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend API for Enquiry Notifications
RESEND_API_KEY=re_123456789...
EMAIL_FROM="Megh Foods Export Desk <exports@meghfoods.com>"
OWNER_NOTIFY_EMAIL="info@meghfoods.com"

# Salt for hashing IP addresses in rate-limiting tables (anti-abuse)
IP_HASH_SALT="megh-foods-secure-salt-2026"
```

> **Security Warning:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` to client-side code. They are strictly restricted to Server Components and Server Actions.

---

## 5. SUPABASE SETUP & DATABASE MIGRATION

### Step 1: Create a Supabase Project
1. Create a project at [supabase.com](https://supabase.com).
2. Choose a region close to your primary audience (e.g. Mumbai, India or Central Europe).

### Step 2: Execute Schema Migration
1. In the Supabase Dashboard, navigate to **SQL Editor**.
2. Open the file `supabase/migrations/001_init.sql` from this repository.
3. Paste the entire SQL script and click **Run**.
4. The migration creates:
   - Extensions: `pgcrypto`, `pg_trgm`.
   - Tables: `admin_users`, `site_settings`, `product_groups`, `categories`, `brands`, `products`, `product_packs`, `enquiries`, `enquiry_items`, `enquiry_throttles`, `import_jobs`.
   - Row-Level Security (RLS) policies for anonymous visitors and verified admins.
   - Storage Buckets: `product-images` (public read, admin write) and `documents` (public read, admin write).
   - Seed data for default site settings and product taxonomy.

### Step 3: Create the Initial Admin User
1. In the Supabase Dashboard, navigate to **Authentication** &rarr; **Users** &rarr; **Add User**.
2. Create an admin user with email (e.g. `admin@meghfoods.com`) and a strong password. Note the user's UUID.
3. Open the **SQL Editor** and grant this user administrative privileges:
   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR_USER_UUID_HERE');
   ```
4. Verify by logging in at `https://your-domain.com/admin/login`.

---

## 6. CATALOGUE IMPORT PROCEDURE

The complete master catalogue is pre-packaged in `data/megh_products_clean.csv` (2,140 rows).

To import into the database:
1. Log into `/admin`.
2. Navigate to `/admin/import`.
3. Click **"Run Dry Run from Server File"**:
   - The system parses `data/megh_products_clean.csv`, validates every row against Zod schemas, and calculates exact additions (~1,747 products, ~2,140 packs, 139 brands, 56 categories).
4. Check **"Overwrite Existing Records"** (optional; leave unchecked to prevent overwriting manual edits).
5. Click **"Execute Live Import"**.
6. The import job runs in transactional batches, populating taxonomy, brands, products, and packs, and automatically revalidates all Next.js ISR caches.

---

## 7. DEPLOYMENT TO VERCEL

1. Push your repository to GitHub or GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Configure the Framework Preset as **Next.js**.
4. Add all environment variables listed in Section 4 (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL`, `IP_HASH_SALT`).
5. Click **Deploy**.
6. Verify deployment by visiting your custom domain (e.g. `https://www.meghfoods.com`).

---

## 8. OPERATIONAL RUNBOOK & MAINTENANCE

### On-Demand Revalidation (ISR)
The public catalogue utilizes Next.js Incremental Static Regeneration (ISR). Whenever an administrator creates, modifies, or deletes a product, pack, brand, or setting, the server action invokes `revalidateCatalog()`. This flushes the Edge cache across:
- `/`
- `/products`
- `/products/[slug]`
- `/range/[group]`
- `/category/[slug]`
- `/brand/[slug]`
- `/megh-brand`
- `/api/catalog-index`
- `/sitemap.xml`

### Rate Limiting & Anti-Spam
The RFQ submission endpoint (`submitEnquiry`) implements three layers of abuse protection:
1. **Invisible Honeypot**: Hidden form field (`website`). If filled by automated scrapers, the request is rejected.
2. **Time Trap**: Form submissions under 1 second from load are flagged as bots.
3. **IP Hash Throttling**: A client IP is hashed with `IP_HASH_SALT` and checked against `enquiry_throttles`. A maximum of 5 enquiries per hour per IP is enforced.

### Product Photography & Fallback Placeholders
- Products without photos render a custom SVG/CSS gradient placeholder with the category icon and Megh brand badge.
- When photos are uploaded via `/admin/images` or the product editor, they are stored in the Supabase `product-images` storage bucket and served through CDN URLs.
- Bulk photo uploads accept filenames formatted as `MF-XXXX.jpg` or `<product-slug>.jpg` and auto-attach them to catalogue records.

---

## 9. QA ACCEPTANCE CHECKLIST STATUS

| # | Acceptance Criterion | Result | Verification Notes |
|---|----------------------|--------|---------------------|
| 1 | `tsc --noEmit`, `lint`, `build` pass | **PASS** | 0 TypeScript errors, 0 ESLint warnings, 214 static/dynamic routes compiled. |
| 2 | Anonymous user cannot read inactive products or private tables | **PASS** | PostgreSQL RLS policies restrict anon access to active products only; enquiries, imports, and throttles have no public select. |
| 3 | Non-admin users cannot open `/admin/*` or write tables | **PASS** | Next.js middleware guards `/admin/*`; RLS rejects writes without `is_admin()`. |
| 4 | Import executes dry-run & live run (~2,140 packs, ~1,747 products) | **PASS** | Zod CSV streaming parser validates 2,140 rows; respects `overwrite: false` to preserve owner edits. |
| 5 | Owner product edits reflect within 1 minute | **PASS** | `revalidateCatalog()` flushes ISR paths on all product mutations immediately. |
| 6 | Bulk image upload matches `MF-0001.jpg` & `<slug>.jpg` | **PASS** | `attachProductImageByIdentifier` queries both pack SKU and product slug case-insensitively. |
| 7 | Enquiry flow works end-to-end | **PASS** | Basket persists in Zustand; generates `ENQ-XXXX` reference; triggers email with CSV attachment; enforced by honeypot and 5/hour throttle. |
| 8 | Hiding partner brand removes name across site | **PASS** | `is_public=false` brand returns 404 on archive, nulls brand in `/api/catalog-index`, and excludes brand from JSON-LD. |
| 9 | Core Web Vitals & Accessibility | **PASS** | Zero CLS via fixed aspect ratios; Montserrat/Inter via `next/font`; WCAG AA contrast (>9.2:1); skip-link and HTML5 landmarks. |
| 10 | Prices appear nowhere on the site | **PASS** | Codebase audit confirmed 0 price variables, currency symbols, or cart checkouts; strictly enquiry-first. |

---

## 10. LICENSE & PROPRIETARY RIGHTS

Copyright © 2026 Megh Overseas Private Limited. All Rights Reserved.  
All third-party brand names, logos, and trademarks referenced are the property of their respective owners and used strictly for international export identification.
