# Handover — Freelance Money Tools

> Delivered by Nadia · 2026-08-22 · Package: Tool Site (Tool Page / Tool Site / Site + Growth Ops)
> This document is generated from the starter template. Sections marked ⚙️ are filled in per project; everything else applies to every site built on this stack.

## 1. What you received

| Item | Where |
|---|---|
| Source code (you own it) | GitHub repo `https://github.com/liaonachi/freelance-money-tools` — main branch is production |
| Live site | `https://freelance-money-tools.vercel.app` |
| Hosting | Vercel project `freelance-money-tools` (your account) |
| Database | Supabase project `seo-demo` (your account) — one table: `blog_posts` |
| Analytics | GA4 property: not yet configured (`site.config.ts` → `ga4Id` is empty) · Google Search Console: verification meta tag is live, but the property itself still needs to be created — see the note under §5 |
| Admin panel | `https://freelance-money-tools.vercel.app/admin` — password login (see §3) |
| Tools built ⚙️ | Freelance Hourly Rate Calculator (`/tools/hourly-rate`), Invoice Late Fee Calculator (`/tools/late-fee`), Self-Employment Tax Set-Aside Calculator (`/tools/tax-set-aside`) |
| Articles published ⚙️ | 3 — "How to Set Your Freelance Hourly Rate", "Late Payment Fees for Freelancers", "How Much Should Freelancers Set Aside for Taxes" |

## 2. Accounts & secrets (keep private)

All secrets live in **Vercel → Project → Settings → Environment Variables**. Nothing secret is in the repo.

| Variable | What it is | Where to get / rotate |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public read key (safe in browser) | same |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only write key — **never expose** | same |
| `SUPABASE_DB_URL` | Postgres connection string, used only by `npm run db:apply` | Supabase → Database → Connection string |
| `REVALIDATE_SECRET` | Shared secret between Supabase webhook and `/api/revalidate` | any long random string; if you change it, also re-apply `supabase/schema.sql` |
| `ADMIN_PASSWORD` | Admin panel password | choose; change here and redeploy |
| `ADMIN_SESSION_SECRET` | Signs admin login cookies | any long random string; changing it logs everyone out |

Non-secret site settings (name, domain, language, currency, colour, nav, GA4 ID) live in **`site.config.ts`** in the repo. Edit → commit → Vercel redeploys automatically.

## 3. Day-to-day: publishing articles

1. Go to `https://freelance-money-tools.vercel.app/admin/login`, enter `ADMIN_PASSWORD`.
2. **Posts → New**: title, slug (auto-filled, editable), excerpt (used as meta description), content in Markdown, and an optional FAQ section (add/remove question + answer rows) — filled-in FAQs render as `FAQPage` structured data on the article page.
3. **Save draft** or **Save & publish**. Published pages regenerate within seconds (no redeploy needed) via the Supabase → `/api/revalidate` webhook; the sitemap updates too.
4. To unpublish: Posts → toggle to draft. The URL 404s and drops from the sitemap.

Tips: link from articles to your tools with plain `/tools/<slug>` links — the site tracks those clicks as `article_to_tool` events in GA4.

## 4. Day-to-day: adding or changing a tool

Tools are code, not database rows (that is what keeps them fast and indexable). Each tool is one file: `tools/<slug>.config.ts` — inputs, a pure `compute()` function, outputs, CTA, FAQ.

- Change a label, default value, or FAQ: edit the file, commit. Vercel redeploys.
- New tool: `npm run new:tool` scaffolds the file, a test, and registers it; then write the formula in `compute()`. Or ask Nadia (see §7).
- Every tool automatically gets: SEO metadata, `WebApplication` structured data (plus `FAQPage` structured data if the config's `faq` field is filled in), a sitemap entry, GA4 `tool_use` / `tool_to_tool` events.

## 5. Measurement — where to look

| Question | Where |
|---|---|
| Is Google showing my pages? | Google Search Console → Performance |
| Are people using the tools? | GA4 → Events → `tool_use` (by `tool_name`) |
| Are articles sending people to tools? | GA4 → Events → `article_to_tool` |
| Are people jumping between tools? | GA4 → Events → `tool_to_tool` (by `from_tool`, `to_tool`) |
| Are people clicking my affiliate/outbound links? | GA4 → Events → `affiliate_click` (by `item_name`, `page_path`) — mark it as a Key Event in GA4 Admin |

⚙️ **GSC dashboard (Site + Growth Ops package, on the roadmap):** `https://freelance-money-tools.vercel.app/admin/seo` exists as a page, but as of this template version it's a placeholder — it doesn't pull live Search Console data yet. Don't promise this as delivered functionality until it's actually wired up; check with Nadia first.

⚙️ **GSC property setup — still needs a manual step:** the site verification meta tag (`google-site-verification`) is live in production, so verification itself is a one-click step once you're logged into the right Google account. But creating the actual Search Console property (as a URL-prefix property for `https://freelance-money-tools.vercel.app/`, not a domain property) requires being logged into a Google account in a real browser — that can't be scripted from here. Go to [Google Search Console](https://search.google.com/search-console), add the property, click verify (it should pass immediately since the meta tag is already deployed), then submit `https://freelance-money-tools.vercel.app/sitemap.xml`.

## 6. Maintenance you should expect

- **Data freshness**: any tool that embeds real-world numbers (rates, prices, thresholds) needs a review cadence. ⚙️ For this site: the tax set-aside calculator's default self-employment tax rate and bracket assumptions are US federal figures for the current tax year (see `specs/tools.md` for sourcing) — review and update once a year when the IRS publishes new figures, typically each January.
- **Dependencies**: Next.js / Supabase libraries get security updates. Run `npm outdated` quarterly or include it in a maintenance plan.
- **Backups**: Supabase free tier keeps daily backups for 7 days; export `blog_posts` (Table editor → Export CSV) before major edits if you want your own copy.
- **Domain / SSL / hosting**: managed by Vercel; renew the domain with your registrar.

## 7. Support

- **30-day bug-fix window** from `2026-08-22`: anything that worked at handover and stops working is fixed at no charge.
- **Monthly maintenance plan** (optional): data refresh, GSC/GA4 monthly report, dependency updates, one article or tool tweak per month. ⚙️ Not applicable here — this is Nadia's own portfolio/demo site (client = Nadia herself), not a paid client engagement, so there's no separate maintenance retainer to track. For a real client this line would state the agreed monthly rate and scope.
- Contact: nadiadevstudio@gmail.com

## 8. Local development (for your developer, if any)

```bash
git clone https://github.com/liaonachi/freelance-money-tools.git && cd freelance-money-tools
cp .env.local.example .env.local   # fill from Vercel env
npm install
npm run dev                          # http://localhost:3000
npm test && npm run build            # before every commit
npm run db:apply                     # apply supabase/schema.sql after schema changes
```

Repo docs: `docs/site-config.md` (settings), `docs/adding-a-tool.md` (tools), `CLAUDE.md` (architecture & rules — written for AI coding assistants, but readable by humans).
