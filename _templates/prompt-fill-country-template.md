# Prompt: Country page — `country-template.html`

Companion to `prompt-fill-guide-template.md` (which covers `guides/template.html`). Each section below is a standalone, copy-pasteable prompt for one template. Replace the bracketed placeholders in the prompt itself (e.g. `[DESTINATION]`, `[TOPIC]`) before pasting, and paste the actual template file's contents alongside it.

All shared house-style and research-standard rules from the main guide prompt apply here too: direct, opinionated, specific-over-vague voice; flag anything uncertain at the end rather than inventing it; don't touch HTML structure/classes/IDs/JS, only bracketed placeholder text and the handful of slug-based attributes.

---

Replace **[COUNTRY]**.

This template is much lighter than the others - it's a pure directory page with almost no original prose. Everything in its body is auto-generated from `guides.json` by the page's own script, so the prompt below is mostly about getting a handful of fixed values exactly right rather than "writing" content.

---

I am giving you `country-template.html`, a directory page that auto-lists every Globehint guide for one country - it pulls all its content from `guides.json` at runtime, so there's very little original writing here. Fill in the placeholders for **[COUNTRY]**, leaving all HTML structure/classes/IDs/JavaScript untouched.

**What to fill**:
1. `<head>`: title, description, canonical (`[slug].html` - country pages live at the site root, not in a subfolder, so no `country-slug/` prefix), OG/Twitter tags, JSON-LD (CollectionPage + BreadcrumbList).
2. Hero: replace the flag span's class from `fi-de` to the correct ISO 3166-1 alpha-2 code for **[COUNTRY]** (e.g. `fi-pt` for Portugal), H1, lede.
3. "More on the way" section: country name in the heading.
4. The `const COUNTRY_NAME = "[Country Name]"` JS variable near the bottom **must exactly match** the `country` field you're using (or already using) in `guides.json` for this country's guides - same spelling, same capitalization - or the page will silently show zero guides.

**Slug convention**: save as `[countryname-lowercase-no-spaces].html` at the repo root (e.g. `germany.html`, `unitedkingdom.html`) - this must match how `countrySlug()` in `navbar.js` builds country links (`name.toLowerCase().replace(/\s+/g,'')  + '.html'`), so no hyphens even for multi-word country names.

**Rules**: keep `noindex, nofollow` as-is. This page needs no fabricated content, research, or fact-checking - it's pure configuration. Double-check the flag code and COUNTRY_NAME match before handing it back.

Country: **[COUNTRY]**
