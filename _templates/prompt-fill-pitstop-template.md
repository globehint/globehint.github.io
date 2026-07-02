# Prompt: Pit Stop — `pitstop-template.html`

Companion to `prompt-fill-guide-template.md` (which covers `guides/template.html`). Each section below is a standalone, copy-pasteable prompt for one template. Replace the bracketed placeholders in the prompt itself (e.g. `[DESTINATION]`, `[TOPIC]`) before pasting, and paste the actual template file's contents alongside it.

All shared house-style and research-standard rules from the main guide prompt apply here too: direct, opinionated, specific-over-vague voice; flag anything uncertain at the end rather than inventing it; don't touch HTML structure/classes/IDs/JS, only bracketed placeholder text and the handful of slug-based attributes.

---

Replace **[TOPIC]** with the pit stop's subject (e.g. "the best eSIMs for Southeast Asia," "why I stopped overpacking").

---

You are writing a Pit Stop for Globehint - a short-form opinion/advice post, distinct from the destination guides. The voice is still direct and specific, but more personal and essay-like: first-person opinions are welcome here in a way they aren't in the structured city guides.

I am giving you `pitstop-template.html`. Write a complete post about **[TOPIC]** and replace every bracketed placeholder, leaving all HTML structure/classes/IDs untouched.

**What to fill**:
1. `<head>`: title, description, canonical (`pitstops/[slug].html`), OG/Twitter tags, JSON-LD (Article + BreadcrumbList).
2. Header: breadcrumb, H1, dek (1-2 sentences), date, read time (estimate honestly from the word count you write).
3. Hero image: alt text and an optional caption (or tell me to delete the `<img>` and use the `.photo-fallback` div instead if no photo exists yet for this topic).
4. Body: an opening lead paragraph, 2+ body paragraphs, an optional H2-subheaded section, an optional pull-quote blockquote, and a closing paragraph. Keep paragraphs short (3-4 sentences) - this is read on phones. Use only as many H2s/blockquotes as the topic genuinely calls for; don't force structure that isn't earned.
5. Author bio: a short, reusable 1-2 sentence bio (same one can be reused across every Pit Stop, so keep it generic enough to work everywhere).

**Also produce** the matching `pitstops.json` entry:
```json
{
  "title": "[Post Title]",
  "url": "pitstops/[slug].html",
  "published": "[today, YYYY-MM-DD]",
  "blurb": "[one-sentence summary for the index and RSS feed]",
  "image": "images/pitstops/[slug].jpg",
  "imageAlt": "[same alt text used in the hero]"
}
```
(`image`/`imageAlt` are optional - say so if you're leaving them out for me to add once I have a real photo.)

**Rules**: keep `noindex, nofollow` as-is. Flag anything factual you're not fully confident about at the end rather than guessing. If the topic naturally involves recommending a set number of things (e.g. "5 things I always pack"), don't force it to a round number - write as many genuinely good, specific ones as you have, and say so if you're stopping short of a number implied by the topic (I'd rather adjust the title than get a padded fifth item).

Topic: **[TOPIC]**

---
