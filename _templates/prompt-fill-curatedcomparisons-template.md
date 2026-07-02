# Prompt: Curated List (Comparison / "X vs Y") — `curatedcomparisons-template.html`

Companion to `prompt-fill-guide-template.md` (which covers `guides/template.html`). Each section below is a standalone, copy-pasteable prompt for one template. Replace the bracketed placeholders in the prompt itself (e.g. `[DESTINATION]`, `[TOPIC]`) before pasting, and paste the actual template file's contents alongside it.

All shared house-style and research-standard rules from the main guide prompt apply here too: direct, opinionated, specific-over-vague voice; flag anything uncertain at the end rather than inventing it; don't touch HTML structure/classes/IDs/JS, only bracketed placeholder text and the handful of slug-based attributes.

---

Replace **[PLACE A]** and **[PLACE B]**.

---

You are writing a head-to-head destination comparison for Globehint, in the site's direct, opinionated voice - genuine verdicts, not wishy-washy "it depends on you!" non-answers, unless a real tie is the honest conclusion.

I am giving you `curatedcomparisons-template.html`. Write a comparison of **[PLACE A]** vs **[PLACE B]** and replace every bracketed placeholder, leaving all HTML structure/classes/IDs untouched.

**What to fill**:
1. `<head>`: title, description, canonical (`curatedlists/[slug].html`), OG/Twitter tags, JSON-LD (Article + BreadcrumbList).
2. Header: breadcrumb, H1 ("[Place A] vs [Place B]"), dek explaining what's being weighed and for whom, date, read time.
3. VS header: both places' photos referenced as `images/guides/[place-slug]-hero-800.jpg` using each place's real slug (if either place doesn't have its own Globehint guide yet, say so), correct ISO flag codes on each `fi-xx` span (or note to delete the flag span if a place isn't a single flaggable destination).
4. Body: opening lead + optional second paragraph on what this comparison is/isn't for, then a `.compare-row` block per criterion (cost, food, getting around, nightlife, etc. - pick criteria that actually matter for these two places, don't force a fixed list). Mark the winning `.compare-col` with `class="is-winner"` only where there's a genuine winner; leave both plain on criteria that are close to a tie. Close with an optional blockquote and closing paragraph.
5. Verdict box: a real, specific call - "[Place A]," "[Place B]," or an honestly-earned "it depends" with who each place actually suits. Delete this section entirely (tell me you're doing so) only if the comparison is genuinely meant to stay open.
6. Author bio: short, reusable 1-2 sentences.

**Also produce** the matching `curatedlists.json` entry (same schema as the Top 10 list - `title`, `url`, `published`, `blurb`, `image`, `imageAlt`).

**Rules**: keep `noindex, nofollow` as-is. Flag any specific factual claims you're not confident about at the end.

Comparison: **[PLACE A]** vs **[PLACE B]**

---
