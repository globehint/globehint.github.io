# Prompt: Curated List (Top 10 / ranked) — `curatedtop10-template.html`

Companion to `prompt-fill-guide-template.md` (which covers `guides/template.html`). Each section below is a standalone, copy-pasteable prompt for one template. Replace the bracketed placeholders in the prompt itself (e.g. `[DESTINATION]`, `[TOPIC]`) before pasting, and paste the actual template file's contents alongside it.

All shared house-style and research-standard rules from the main guide prompt apply here too: direct, opinionated, specific-over-vague voice; flag anything uncertain at the end rather than inventing it; don't touch HTML structure/classes/IDs/JS, only bracketed placeholder text and the handful of slug-based attributes.

---

Replace **[LIST TOPIC]** (e.g. "Top 10 street food cities in the world") and **[N]** (how many entries you want - 10 is the default but any count works).

---

You are writing a ranked curated list for Globehint, in the site's direct, opinionated voice - real judgment calls, not a generic aggregator list.

I am giving you `curatedtop10-template.html`. Write a **[N]**-entry ranked list on **[LIST TOPIC]** and replace every bracketed placeholder, leaving all HTML structure/classes/IDs untouched.

**What to fill**:
1. `<head>`: title, description, canonical (`curatedlists/[slug].html`), OG/Twitter tags, JSON-LD (Article + BreadcrumbList).
2. Header: breadcrumb, H1, dek, date, read time.
3. Cover hero image: alt text and optional caption for the list's own cover photo (separate from any per-entry photos below).
4. Body: opening lead paragraph explaining how the list was put together and what "best" means here, optional second intro paragraph, then **[N]** `.rank-entry` blocks in ranked order (duplicate the block per entry, renumbering `rank-number` down to 1), each with a name and a 1-2 sentence reason it earned that spot. Close with an optional blockquote and a closing paragraph.
5. For each ranked entry, if it's a place with its own Globehint guide, reference its photo as `images/guides/[that-place-slug]-hero-800.jpg` rather than a new upload - use the real slug for each entry. If an entry doesn't have a Globehint guide (or isn't a single place), say so and I'll source a photo separately.
6. Author bio: short, reusable 1-2 sentences.

**Also produce** the matching `curatedlists.json` entry:
```json
{
  "title": "[List Title]",
  "url": "curatedlists/[slug].html",
  "published": "[today, YYYY-MM-DD]",
  "blurb": "[one-sentence summary for the index and RSS feed]",
  "image": "images/curatedlists/[slug].jpg",
  "imageAlt": "[same alt text used in the cover hero]"
}
```

**Rules**: keep `noindex, nofollow` as-is. Rankings should reflect a genuine, defensible point of view, not a hedge - but flag any specific factual claims (prices, records, statistics) you're not confident about at the end.

List topic: **[LIST TOPIC]**, **[N]** entries

---
