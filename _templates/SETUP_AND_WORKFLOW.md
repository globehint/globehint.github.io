# Globehint guide automation — setup & workflow

Everything here runs from GitHub Actions. Nothing requires Python or a
terminal on your own machine.

---

## Part 1: One-time setup

### A. Get your free API keys

1. **Gemini** (required): https://aistudio.google.com/apikey — create a
   key, no credit card needed. Note: Google may use free-tier prompts to
   improve their models, so don't send anything sensitive.
2. **Unsplash** (recommended): https://unsplash.com/developers → create an
   app → copy the "Access Key".
3. **Pexels** (optional fallback, used only if Unsplash misses): https://www.pexels.com/api/

### B. Add the automation to your repo

Copy these into your repo and commit/push once:

```
your-repo/
  _automation/
    publish_guides.py
    requirements.txt
  .github/workflows/
    generate-guides.yml
```

(`_templates/`, `guides.json`, and everything else in your repo stays
untouched — the automation only reads your existing templates and prompts.)

### C. Add your keys as repository secrets

GitHub repo → **Settings → Secrets and variables → Actions → New repository
secret**:
- `GEMINI_API_KEY`
- `UNSPLASH_ACCESS_KEY` (optional)
- `PEXELS_API_KEY` (optional)

That's the whole one-time setup.

---

## Part 2: The workflow — every time you publish or fix guides

Go to your repo's **Actions tab → "Generate guides" → Run workflow**. There
are two modes, and every run is one or the other — fill in exactly one of
the two mode-specific fields below, leave the other blank.

### Mode 1: Publishing new guides / day trips

**Fill in:**
- `destinations` — CSV rows, no header, one per line:
  ```
  guide,Lisbon,,
  guide,Porto,,
  daytrip,Sintra,,Lisbon
  ```
  - `type`: `guide` or `daytrip`
  - `destination`: place name
  - `slug`: leave blank to auto-generate from the name
  - `day_trip_from`: only for `daytrip` rows — must exactly match the base
    city's `name` in `guides.json`
- `auto_daytrips` — turn on if you want the AI's own suggested day trips
  (the ones it names inside each guide's "Day Trips" section) logged for
  you to review, rather than just disappearing. **Important**: because
  GitHub Actions can't pause mid-run and wait for you to answer a prompt,
  this doesn't ask you live — it writes every suggestion to
  `_templates/_suggested-daytrips.log`, which lands in the pull request for
  you to read. Nothing gets auto-created from these; you decide by adding
  them as new `destinations` rows in a follow-up run.
- Leave `upgrade_slug` blank.

**What happens:** a runner generates every guide/day trip you listed,
fetches hero images, updates `guides.json`, cross-links day trips into
their base city's page, and opens a **pull request** with everything.

**Review the PR:**
- Check each new guide's HTML for accuracy and voice.
- Check `_templates/_verify-before-publishing.log` for anything the AI
  flagged as uncertain (prices, hours, etc.).
- If `auto_daytrips` was on, check `_templates/_suggested-daytrips.log` for
  places worth a follow-up run.
- Remove `<meta name="robots" content="noindex, nofollow">` from pages
  that are ready to go live.
- Merge. This triggers your existing `generate-feeds.yml` and
  `generate-hero-images.yml` workflows, same as any other push to `main`.

---

### Mode 2: Fixing a day trip that should have been a full guide

Sometimes a place gets generated as a day trip but you decide afterward it
deserves its own full guide instead. This mode handles that cleanly.

**Fill in:**
- `upgrade_slug` — the slug of the existing day trip, e.g. `sintra`
  (matches `guides/sintra.html`). You can find this in the page's own URL
  or in its `guides.json` entry's `url` field.
- `refresh_image` — optional, off by default. Leave off to keep the
  existing hero photo; turn on if you'd rather fetch a new one.
- Leave `destinations` blank.

**What this does, and why the day-trip link is left alone on purpose:**

1. Regenerates `guides/sintra.html` from scratch using the **full guide
   template** (all 13 sections — Where to Stay, Airport Transport, Tourist
   Cards, Nightlife, Walking Tour, etc.) instead of the lighter day-trip
   template, with a fresh, deeper research pass.
2. **Keeps the exact same filename/URL** — `guides/sintra.html` stays
   `guides/sintra.html`. This is the key part: because the URL never
   changes, the day-trip card that already exists on Lisbon's page (the one
   linking to Sintra under "Day trips from Lisbon") is **left completely
   untouched** and keeps working correctly. A day trip to Sintra is still
   genuinely possible even though Sintra now also has its own full guide —
   so nothing gets deleted from Lisbon's page.
3. Updates Sintra's own `guides.json` entry: swaps out `dayTripFrom` and
   `duration` for a proper standalone-guide entry at the same `url`. This is
   what makes Sintra appear on `destinations.html` as its own place, get its
   own country/continent grouping, and show up correctly anywhere else
   `guides.json` drives a listing — while the physical link on Lisbon's page
   needed zero edits, since it was never tied to that field, only to the
   URL.
4. Logs any new "Verify before publishing" notes and any day trips the AI
   names inside *this* new full guide, same as a normal guide generation.

**What it deliberately does NOT do:** touch `guides/lisbon.html` in any way,
remove or rename Sintra's day-trip card, or change any other guide's file.
The only files touched are `guides/sintra.html`, `guides.json`, and
optionally `images/guides/sintra-hero.jpg` if you turned on `refresh_image`.

**Result:** a pull request containing just those changes, with a
description reminding you what was and wasn't touched. Review it the same
way as any other guide — check accuracy, check the verify log, remove
`noindex`, merge.

---

## Quick reference

| | Mode 1: new guides | Mode 2: upgrade a day trip |
|---|---|---|
| Input field to fill in | `destinations` | `upgrade_slug` |
| Template used | Full or day-trip, per row | Always the full guide template |
| Day-trip cross-links | Created automatically for new day trips | Left untouched — URL doesn't change |
| `guides.json` change | New entry added | Existing entry's `url` kept, day-trip fields replaced with full-guide fields |
| Output | Pull request | Pull request |

Every run — either mode — ends as a pull request, never a direct push to
`main`. Merging is always the final "yes, this is reviewed and ready" step,
same as it's always been for a manually written guide.
