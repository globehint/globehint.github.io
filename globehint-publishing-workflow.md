# Globehint Publishing Workflow

How to publish each content type on globehint.github.io. Every content type follows the same shape: **write the HTML page from a template → drop it in the right folder → add one entry to a JSON file → commit & push.** GitHub Actions does the rest (sitemap, RSS, hero images).

---

## 0. How the site fits together (read once)

- **Pages are static HTML**, built from templates in the repo root / `guides/` folder.
- **Four JSON "index" files drive every listing page, the nav, and the homepage**: `guides.json`, `pitstops.json`, `curatedlists.json` (all currently empty `[]`). Day trips are *not* a separate JSON file — they're guides with an extra `dayTripFrom` field.
- **`navbar.js`** loads `guides.json` once per page and exposes it globally, and builds the mega-menu (Destinations by country, Day Trips, vibe flyout).
- **Two GitHub Actions already exist and need no changes:**
  - `generate-feeds.yml` — rebuilds `sitemap.xml` and `feed.xml` from the three JSON files on every push to `main`.
  - `generate-hero-images.yml` — whenever you push a file matching `images/guides/*-hero.jpg` or `*-hero.png`, it auto-generates the `-hero-400.webp`, `-hero-800.webp`, `-hero-1200.webp`, and `-hero-800.jpg` variants and commits them back. **This only watches `images/guides/`** — pitstops and curated lists need images sized/exported manually (see §5).
- **`robots`/`noindex`**: every template ships with `<meta name="robots" content="noindex, nofollow">`. Remove that line when a page is ready to go live in search results — this is the single most common thing to forget.

---

## 1. Publishing a Guide (main destination guide)

**Template:** `guides/template.html` · **Live folder:** `guides/` · **Index file:** `guides.json`

1. **Duplicate the template**
   ```
   cp guides/template.html guides/lisbon.html
   ```
   Use a lowercase, hyphen-free slug matching how you'll reference it (e.g. `lisbon.html`, `chiang-mai.html`).

2. **Fill in every `[bracketed placeholder]`** in `guides/lisbon.html`:
   - `<head>`: title, meta description, canonical URL, all OG/Twitter tags, the JSON-LD block (`TouristAttraction`, `Article`, `BreadcrumbList`), and **delete the `noindex, nofollow` line** when ready to publish.
   - Hero image `<picture>` block: paths must point to `../images/guides/[slug]-hero-800.jpg` etc. (see §5 for generating these).
   - Breadcrumb, `<h1>`, subhead/blurb.
   - All 13 body sections: Overview, Attractions, Where to Stay, Airport Transport, Getting Around, Tourist Cards, Eat & Drink, Nightlife, Photogenic Spots, Day Trips, Walking Tour, Language, Tips & Tricks.
   - Day Trip cards inside the guide's own "Day Trips" section link to the day-trip pages you'll publish per §2 — update `href="#"` to the real URL once that page exists.

3. **Add the hero photo** as `images/guides/lisbon-hero.jpg` (or `.png`) and push — the image workflow generates the resized variants automatically (§5). Don't hand-generate these yourself.

4. **Add one entry to `guides.json`**:
   ```json
   {
     "name": "Lisbon",
     "url": "guides/lisbon.html",
     "country": "Portugal",
     "continent": "Europe",
     "flag": "pt",
     "vibe": "coastal",
     "published": "2026-07-02",
     "blurb": "A punchy one-to-two sentence hook.",
     "image": "images/guides/lisbon-hero-800.jpg",
     "imageAlt": "Lisbon's tiled rooftops from a viewpoint at sunset"
   }
   ```
   Field notes:
   - `flag` = lowercase ISO country code used by `flag-icons` (e.g. `pt`, `jp`, `mx`).
   - `continent` must exactly match an existing value (`Europe`, `Asia`, etc.) — inconsistent naming splits the destinations page into duplicate sections.
   - `vibe` must be one of the existing keys in `navbar.js` → `GLOBEHINT_VIBE_ICONS` (`food`, `nature`, `history`, `nightlife`, `alpine`, `wellness`, `adventure`, `art`, `design`, `shopping`, `spirituality`, `luxury`, `romance`, `family`, `tech`, `coastal`, `rural`). A new vibe still works but shows a fallback icon until you add one.
   - `image` **must be the `-800.jpg` variant**, not the raw `-hero.jpg` (flagged in the template's own header comment).
   - `published` drives sort order everywhere (`YYYY-MM-DD`).

5. **Commit and push to `main`.** The feeds workflow regenerates `sitemap.xml`/`feed.xml`; the hero-image workflow regenerates image variants if you touched a `-hero.*` file.

6. **Sanity check live**: destinations.html (grouped by continent), the vibe flyout in the nav, the homepage "related guides," and the country page all pull from `guides.json` automatically — no other file needs editing.

---

## 2. Publishing a Day Trip

Day trips are guides with two extra fields — same JSON file, same folder, a lighter template.

**Template:** `guides/daytrip-template.html` · **Live folder:** `guides/` · **Index file:** `guides.json`

1. **Duplicate the day-trip template**, not the main one:
   ```
   cp guides/daytrip-template.html guides/sintra.html
   ```

2. **Fill in placeholders.** Structurally it's the same page minus Where to Stay/Airport/Tourist Cards/Nightlife/Walking Tour, plus a "Getting There & Around" section, a "Day trip or overnight?" callout, and a Suggested Itinerary section instead of Attractions-as-list. Base-city references (`[Base City]`) appear throughout — fill consistently.

3. **Hero image**: same pipeline as guides — `images/guides/sintra-hero.jpg`, auto-processed on push.

4. **Add the entry to `guides.json`** — same schema as a normal guide, plus:
   ```json
   {
     "name": "Sintra",
     "url": "guides/sintra.html",
     "country": "Portugal",
     "continent": "Europe",
     "flag": "pt",
     "vibe": "history",
     "published": "2026-07-02",
     "dayTripFrom": "Lisbon",
     "duration": "Full day",
     "blurb": "...",
     "image": "images/guides/sintra-hero-800.jpg",
     "imageAlt": "..."
   }
   ```
   - `dayTripFrom` is the *only* thing that makes `daytrips.html` treat an entry as a day trip — it must exactly match the `name` of the base city's guide entry so it groups correctly.
   - `duration` is optional but shown as a badge (`Half day` / `Full day`) if present.

5. **Cross-link it**: go back into the base city's guide (`guides/lisbon.html`) and update the matching Day Trip card's `href` from `#` to `sintra.html`. The console will warn (`a .daytrip-card link was left as href="#"`) if you forget — check the browser console after publishing.

6. **Push.** `daytrips.html` auto-groups all guides with `dayTripFrom` set by base city — nothing else to touch.

---

## 3. Publishing a Pit Stop

**Template:** `pitstop-template.html` · **Live folder:** `pitstops/` · **Index file:** `pitstops.json`

1. **Duplicate the template into the `pitstops/` folder** (note: unlike guides, the template file itself lives at repo root, but the *published* page goes in the subfolder):
   ```
   cp pitstop-template.html pitstops/best-esims-southeast-asia.html
   ```

2. **Fill in placeholders**: title, description, canonical/OG/Twitter tags, JSON-LD (`Article` + `BreadcrumbList`), remove `noindex, nofollow` when ready, breadcrumb, `<h1>`, dek, post-meta (date + read time), then the article body itself (freer-form than guides — no fixed section list).

3. **Add a hero/cover image** to `images/pitstops/` manually — there's **no auto-resize workflow for this folder**, so export a reasonably sized JPEG/WebP yourself (roughly matching the guides' 800px-wide convention keeps things visually consistent) before referencing it.

4. **Add one entry to `pitstops.json`**:
   ```json
   {
     "title": "The Best eSIMs for Southeast Asia",
     "url": "pitstops/best-esims-southeast-asia.html",
     "published": "2026-07-02",
     "blurb": "One-sentence summary shown on the pitstops index and RSS feed.",
     "image": "images/pitstops/best-esims-southeast-asia.jpg",
     "imageAlt": "..."
   }
   ```
   `image`/`imageAlt` are optional — omitting them just shows the photo-coming-soon fallback card.

5. **Commit and push.** `pitstops.html` re-sorts newest-first by `published` automatically.

---

## 4. Publishing a Curated List (Top 10 or Comparison)

Both curated-list formats share **one index file**, `curatedlists.json` — the only choice you make is which template to start from.

**Templates:** `curatedtop10-template.html` (ranked list format) or `curatedcomparisons-template.html` (head-to-head/X-vs-Y format) · **Live folder:** `curatedlists/` · **Index file:** `curatedlists.json`

1. **Pick the right template and duplicate it into `curatedlists/`**:
   ```
   cp curatedtop10-template.html curatedlists/top-10-street-food-cities.html
   # or
   cp curatedcomparisons-template.html curatedlists/lisbon-vs-porto.html
   ```

2. **Fill in placeholders**: title, description, canonical/OG/Twitter tags, JSON-LD (`Article` + `BreadcrumbList`), remove `noindex, nofollow`, breadcrumb, `<h1>`, dek, then the body (ranked entries for Top 10; side-by-side sections for Comparisons).

3. **Add a cover image** to `images/curatedlists/` manually — same as pitstops, **no auto-resize workflow** here either.

4. **Add one entry to `curatedlists.json`** (identical schema regardless of which template you used — the JSON doesn't distinguish list "type"):
   ```json
   {
     "title": "10 Best Street Food Cities in the World",
     "url": "curatedlists/top-10-street-food-cities.html",
     "published": "2026-07-02",
     "blurb": "One-sentence summary for the index card and RSS.",
     "image": "images/curatedlists/top-10-street-food-cities.jpg",
     "imageAlt": "..."
   }
   ```

5. **Commit and push.** `curatedlists.html` re-sorts newest-first automatically.

---

## 5. Hero image checklist (guides & day trips only)

1. Export/crop your source photo, roughly landscape, reasonable resolution (the workflow downsamples, so start ≥1200px wide).
2. Save it as `images/guides/[slug]-hero.jpg` (or `.png`) — the slug must match the `url` slug you used in `guides.json`.
3. Commit and push **just that file** (or as part of your guide commit).
4. `generate-hero-images.yml` fires automatically on that path, generates `-hero-400.webp`, `-hero-800.webp`, `-hero-1200.webp`, `-hero-800.jpg`, and commits them back with `[skip ci]`.
5. Reference `[slug]-hero-800.jpg` (not the raw file) in `guides.json`'s `image` field, per the template's own reminder comment.

Pitstop and curated-list images: no automation — resize/export by hand before committing.

---

## 6. Pre-publish checklist (every content type)

- [ ] Removed `<meta name="robots" content="noindex, nofollow">` from the page's `<head>`
- [ ] Every `[bracketed placeholder]` replaced — search the file for `[` to catch stragglers
- [ ] Canonical URL, OG URL, and JSON-LD `url` all match the real published path
- [ ] `published` date set (drives sort order + RSS + sitemap `lastmod`)
- [ ] Hero/cover image referenced with its final filename, not a placeholder
- [ ] New JSON entry added to the correct file (`guides.json` / `pitstops.json` / `curatedlists.json`) with matching `url`
- [ ] For guides/day trips: cross-links (day trip ↔ base city, related guides) point to real URLs, not `#`
- [ ] Pushed to `main` — check the Actions tab for the sitemap/RSS run (and hero-image run, if applicable) to confirm green

---

## Quick reference

| Content type | Template | Published to | JSON index | Key/extra fields |
|---|---|---|---|---|
| Guide | `guides/template.html` | `guides/*.html` | `guides.json` | `name, country, continent, flag, vibe` |
| Day Trip | `guides/daytrip-template.html` | `guides/*.html` | `guides.json` | above + `dayTripFrom, duration` |
| Pit Stop | `pitstop-template.html` | `pitstops/*.html` | `pitstops.json` | `title` (not `name`) |
| Curated List — Top 10 | `curatedtop10-template.html` | `curatedlists/*.html` | `curatedlists.json` | `title` (not `name`) |
| Curated List — Comparison | `curatedcomparisons-template.html` | `curatedlists/*.html` | `curatedlists.json` | `title` (not `name`) |

All four JSON files share `url`, `published`, `blurb`, `image` (optional), `imageAlt` (optional).
