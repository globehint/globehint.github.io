#!/usr/bin/env python3
"""
Globehint guide publisher.

Reads a batch list of destinations (CSV), generates each guide's HTML via the
free Gemini API using your existing house-style prompts, fetches a hero photo
from Unsplash/Pexels, writes every file into the right place, updates
guides.json, and fixes day-trip cross-links in the base city's page.

Usage:
    python publish_guides.py input/destinations.csv --repo /path/to/globehint.github.io

Nothing is pushed to git automatically. Review the diff, then commit/push
yourself (or extend the script once you trust the output).
"""

import argparse
import csv
import json
import os
import re
import sys
import time
from pathlib import Path

import requests

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import google.generativeai as genai
except ImportError:
    print("Missing dependency. Run: pip install google-generativeai --break-system-packages")
    sys.exit(1)

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
UNSPLASH_KEY = os.environ.get("UNSPLASH_ACCESS_KEY")
PEXELS_KEY = os.environ.get("PEXELS_API_KEY")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")

REQUIRED_CSV_FIELDS = {"type", "destination"}
VALID_VIBES = {
    "food", "nature", "history", "nightlife", "alpine", "wellness", "adventure",
    "art", "design", "shopping", "spirituality", "luxury", "romance", "family",
    "tech", "coastal", "rural",
}


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")


def load_template(repo: Path, kind: str) -> str:
    fname = "template.html" if kind == "guide" else "daytrip-template.html"
    path = repo / "_templates" / fname
    if not path.exists():
        raise FileNotFoundError(f"Template not found: {path}")
    return path.read_text(encoding="utf-8")


def load_prompt(repo: Path, kind: str) -> str:
    fname = (
        "prompt-fill-guide-template.md" if kind == "guide"
        else "prompt-fill-daytrip-template.md"
    )
    path = repo / "_templates" / fname
    if not path.exists():
        raise FileNotFoundError(f"Prompt not found: {path}")
    return path.read_text(encoding="utf-8")


def build_prompt(kind: str, prompt_md: str, template_html: str, row: dict, slug: str) -> str:
    """Fill the [DESTINATION]/[BASE CITY] placeholders in the prompt markdown,
    attach the template HTML, and append strict output-format instructions so
    the response can be parsed reliably."""
    filled = prompt_md.replace("[DESTINATION]", row["destination"])
    if kind == "daytrip":
        filled = filled.replace("[BASE CITY]", row["day_trip_from"])

    daytrips_block = ""
    if kind == "guide":
        daytrips_block = """
4. A fenced ```daytrips block listing ONLY the real day-trip destination names you used in the guide's own "Day Trips" section, one per line, nothing else (no numbering, no transport details). If you genuinely couldn't name any, leave the block empty. These names will be used to queue up full day-trip guides for this destination, so use the exact place name you'd want as that page's title (e.g. "Sintra", not "Sintra day trip")."""

    format_instructions = f"""

---

## OUTPUT FORMAT — follow exactly, this response will be parsed by a script

Return your response in exactly {"four" if kind == "guide" else "three"} fenced sections, in this order, and nothing outside them except your "Verify before publishing" notes:

1. A fenced ```html block containing the ENTIRE filled HTML file (from <!DOCTYPE html> to </html>), nothing else inside it.
2. A fenced ```json block containing ONLY the single-line guides.json entry object described in the prompt above.
3. A "## Verify before publishing" section in plain text listing anything time-sensitive or uncertain.
{daytrips_block}

Use this exact slug for all URL/canonical/filename references: {slug}
"""
    return (
        filled
        + "\n\n---\n\nHere is the template file (`{}`) to fill in:\n\n```html\n{}\n```\n".format(
            "daytrip-template.html" if kind == "daytrip" else "template.html",
            template_html,
        )
        + format_instructions
    )


def call_gemini(prompt: str, retries: int = 5) -> str:
    model = genai.GenerativeModel(GEMINI_MODEL)
    delay = 5
    for attempt in range(retries):
        try:
            resp = model.generate_content(
                prompt,
                generation_config={"temperature": 0.6, "max_output_tokens": 65536},
            )
            return resp.text
        except Exception as e:
            msg = str(e)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                print(f"  Rate limited, waiting {delay}s (attempt {attempt + 1}/{retries})...")
                time.sleep(delay)
                delay *= 2
                continue
            raise
    raise RuntimeError("Exceeded retries on Gemini API call")


def parse_response(text: str):
    html_match = re.search(r"```html\s*(.*?)```", text, re.DOTALL)
    json_match = re.search(r"```json\s*(.*?)```", text, re.DOTALL)
    verify_match = re.search(r"##\s*Verify before publishing(.*)", text, re.DOTALL)
    daytrips_match = re.search(r"```daytrips\s*(.*?)```", text, re.DOTALL)

    if not html_match or not json_match:
        raise ValueError("Could not find both ```html and ```json blocks in the AI response.")

    html = html_match.group(1).strip()
    json_text = json_match.group(1).strip()
    verify_notes = verify_match.group(1).strip() if verify_match else ""

    suggested_daytrips = []
    if daytrips_match:
        for line in daytrips_match.group(1).strip().splitlines():
            name = line.strip().lstrip("-*0123456789. ").strip()
            if name:
                suggested_daytrips.append(name)

    try:
        entry = json.loads(json_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"guides.json block wasn't valid JSON: {e}\nRaw: {json_text}")

    return html, entry, verify_notes, suggested_daytrips


def fetch_hero_image(query: str, dest_path: Path) -> bool:
    """Try Unsplash first, then Pexels. Returns True on success."""
    if UNSPLASH_KEY:
        try:
            r = requests.get(
                "https://api.unsplash.com/search/photos",
                params={"query": query, "per_page": 1, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {UNSPLASH_KEY}"},
                timeout=20,
            )
            r.raise_for_status()
            results = r.json().get("results", [])
            if results:
                img_url = results[0]["urls"]["regular"]
                img_data = requests.get(img_url, timeout=30).content
                dest_path.write_bytes(img_data)
                return True
        except Exception as e:
            print(f"  Unsplash fetch failed ({e}), trying Pexels...")

    if PEXELS_KEY:
        try:
            r = requests.get(
                "https://api.pexels.com/v1/search",
                params={"query": query, "per_page": 1, "orientation": "landscape"},
                headers={"Authorization": PEXELS_KEY},
                timeout=20,
            )
            r.raise_for_status()
            photos = r.json().get("photos", [])
            if photos:
                img_url = photos[0]["src"]["large"]
                img_data = requests.get(img_url, timeout=30).content
                dest_path.write_bytes(img_data)
                return True
        except Exception as e:
            print(f"  Pexels fetch failed ({e}).")

    return False


def generate_alt_text(image_path: Path, dest_name: str) -> str | None:
    """Ask Gemini to actually look at the fetched hero photo and describe
    what's in it, so alt text matches the real image instead of being
    guessed blind by the guide-writing prompt (which never sees the photo
    Unsplash happens to return).

    Sends the image as inline bytes rather than via genai.upload_file():
    upload_file() is asynchronous (the file sits in a PROCESSING state
    before it's ACTIVE), and calling generate_content() right away - as an
    earlier version of this function did - can reach the model before the
    image is actually attached, causing Gemini to respond without ever
    seeing the photo and effectively hallucinate a description. Inline
    bytes are attached synchronously with the request, so there's no
    processing race."""
    try:
        image_bytes = image_path.read_bytes()
        suffix = image_path.suffix.lower()
        mime_type = "image/png" if suffix == ".png" else "image/jpeg"

        model = genai.GenerativeModel(GEMINI_MODEL)
        prompt = (
            f"This is the hero photo for a travel guide about {dest_name}. "
            "Look carefully at THIS specific image and write a single concise "
            "alt-text description (under 20 words) of exactly what is visible - "
            "the actual scene, landmark, building, street, or view shown. "
            "Do not guess or invent details that aren't visible in the image. "
            "Return ONLY the alt text, no quotes, no preamble."
        )
        response = model.generate_content(
            [{"mime_type": mime_type, "data": image_bytes}, prompt]
        )
        alt = response.text.strip().strip('"').strip()
        return alt or None
    except Exception as e:
        print(f"  WARNING: could not generate alt text from image: {e}")
        return None


def apply_alt_text(html_path: Path, alt_text: str):
    """Patch the hero <img> alt attribute in an already-written guide file."""
    content = html_path.read_text(encoding="utf-8")
    new_content, n = re.subn(
        r'(class="hero-photo"[^>]*?\balt=")[^"]*(")',
        lambda m: f"{m.group(1)}{alt_text.replace(chr(34), '')}{m.group(2)}",
        content,
        count=1,
        flags=re.DOTALL,
    )
    if n == 0:
        print("  WARNING: could not find hero-photo alt attribute to update.")
        return
    html_path.write_text(new_content, encoding="utf-8")
    print(f"  Updated hero image alt text: \"{alt_text}\"")


def generate_hero_variants(hero_path: Path):
    """Generate the -hero-{400,800,1200}.webp and -hero-800.jpg variants that
    the HTML actually references (srcset/img src), matching the naming used
    by .github/workflows/generate-hero-images.yml.

    We do this here, synchronously, rather than relying on that workflow to
    fire off the PR push: pushes made by create-pull-request use the default
    GITHUB_TOKEN, and GitHub does not let GITHUB_TOKEN-authored pushes
    trigger other workflows (anti-recursion protection). So without this,
    the variant files never get created on guide-generation PRs and the
    guide ships with broken image references until someone notices and
    re-pushes the hero jpg manually after merge."""
    if Image is None:
        print("  WARNING: Pillow not installed (pip install Pillow) — can't generate hero image variants locally.")
        print("           The images/guides/*-hero-*.webp / *-hero-800.jpg files will be missing until generated.")
        return

    slug = re.sub(r"-hero\.(jpg|jpeg|png)$", "", hero_path.name, flags=re.IGNORECASE)
    out_dir = hero_path.parent

    try:
        with Image.open(hero_path) as img:
            img = img.convert("RGB")
            for width in (400, 800, 1200):
                w = min(width, img.width)
                h = round(img.height * (w / img.width))
                resized = img.resize((w, h), Image.LANCZOS)
                resized.save(out_dir / f"{slug}-hero-{width}.webp", "WEBP", quality=80)

            w800 = min(800, img.width)
            h800 = round(img.height * (w800 / img.width))
            img.resize((w800, h800), Image.LANCZOS).save(
                out_dir / f"{slug}-hero-800.jpg", "JPEG", quality=78
            )
        print(f"  Generated hero image variants (400/800/1200 webp + 800 jpg) for '{slug}'.")
    except Exception as e:
        print(f"  WARNING: failed to generate hero image variants for '{slug}': {e}")


def update_guides_json(repo: Path, entry: dict):
    path = repo / "guides.json"
    data = json.loads(path.read_text(encoding="utf-8")) if path.exists() else []

    data = [d for d in data if d.get("url") != entry["url"]]
    data.append(entry)

    def sort_key(d):
        return d.get("published", ""), d.get("name", "")

    data.sort(key=sort_key)

    lines = [json.dumps(d, ensure_ascii=False, separators=(", ", ": ")) for d in data]
    path.write_text("[\n  " + ",\n  ".join(lines) + "\n]\n", encoding="utf-8")


def sweep_daytrip_links(repo: Path, dest_name: str, dest_url_filename: str):
    """Scan EVERY guide file on the site (not just one base city) for
    daytrip-cards whose href="#" placeholder matches this destination by
    <h4> text, and fix all of them.

    This matters because the same destination can be listed as a possible
    day trip from more than one guide (e.g. Bruges might appear as a card
    on both the Ghent and Brussels guides) — fixing only the one base city
    named in the CSV row would leave the others pointing at "#" forever.

    Matching is done on slugified text (case/whitespace/punctuation
    insensitive) and allows a substring match either way, because the
    guide-writing AI call and the day-trip-writing AI call are independent
    and often phrase the same place slightly differently
    (e.g. "Sintra" vs "A Day in Sintra")."""
    dest_slug = slugify(dest_name)

    card_pattern = re.compile(
        r'(<a href=")#("\s+class="daytrip-card">\s*<div class="daytrip-top">\s*<h4>)(.*?)(</h4>)',
        re.IGNORECASE | re.DOTALL,
    )

    def is_match(h4_text: str) -> bool:
        h4_slug = slugify(h4_text)
        if not h4_slug or not dest_slug:
            return False
        return h4_slug == dest_slug or dest_slug in h4_slug or h4_slug in dest_slug

    total_files_fixed = 0
    total_links_fixed = 0

    for guide_path in sorted((repo / "guides").glob("*.html")):
        if guide_path.name == dest_url_filename:
            continue  # don't touch the destination's own page

        content = guide_path.read_text(encoding="utf-8")
        matched = {"count": 0}

        def repl(m):
            if is_match(m.group(3)):
                matched["count"] += 1
                return f"{m.group(1)}{dest_url_filename}{m.group(2)}{m.group(3)}{m.group(4)}"
            return m.group(0)

        new_content = card_pattern.sub(repl, content)

        if matched["count"] > 0:
            guide_path.write_text(new_content, encoding="utf-8")
            total_files_fixed += 1
            total_links_fixed += matched["count"]
            print(f"  Cross-linked {dest_name} from {guide_path.name} ({matched['count']} href updated).")

    if total_links_fixed == 0:
        print(f"  No daytrip-card across the site had an <h4> matching '{dest_name}' — check manually if one was expected.")
        return False

    print(f"  Sweep complete: {total_links_fixed} link(s) fixed across {total_files_fixed} guide(s).")
    return True


def validate_entry(entry: dict, kind: str):
    problems = []
    for field in ("name", "url", "country", "continent", "flag", "vibe", "published", "blurb", "image", "imageAlt"):
        if not entry.get(field):
            problems.append(f"missing/empty field: {field}")
    if entry.get("vibe") and entry["vibe"] not in VALID_VIBES:
        problems.append(f"vibe '{entry['vibe']}' not in the known vibe list (will show a fallback icon)")
    if kind == "daytrip" and not entry.get("dayTripFrom"):
        problems.append("day trip is missing dayTripFrom")
    return problems


def guide_exists(repo: Path, name: str) -> bool:
    path = repo / "guides.json"
    if not path.exists():
        return False
    data = json.loads(path.read_text(encoding="utf-8"))
    return any(d.get("name", "").strip().lower() == name.strip().lower() for d in data)


def ask_daytrip_disposition(name: str, base_city: str) -> str:
    """Ask the user what to do with an AI-suggested day trip.
    Returns one of: 'daytrip', 'guide', 'skip'."""
    print(f"\n  The AI named '{name}' as a day trip from {base_city}.")
    while True:
        choice = input(
            f"  Create '{name}' as a [d]ay trip, a full [g]uide, or [s]kip it? [d/g/s] "
        ).strip().lower()
        if choice in ("d", "daytrip", ""):
            return "daytrip"
        if choice in ("g", "guide"):
            return "guide"
        if choice in ("s", "skip"):
            return "skip"
        print("  Please answer d, g, or s.")


def upgrade_to_guide(repo: Path, slug: str, image_query_suffix: str, skip_images: bool, refresh_image: bool):
    """Regenerate an existing day-trip page as a full standalone guide,
    keeping the exact same slug/filename so any .daytrip-card href pointing
    at it from a base city's guide page keeps working untouched — the page
    stays reachable from that city's 'Day trips' section, it just now has
    full-guide content and its own listing on destinations.html."""
    guides_path = repo / "guides.json"
    data = json.loads(guides_path.read_text(encoding="utf-8"))

    old_entry = next((d for d in data if d.get("url") == f"guides/{slug}.html"), None)
    if not old_entry:
        raise ValueError(f"No guides.json entry found with url 'guides/{slug}.html'")
    if "dayTripFrom" not in old_entry:
        raise ValueError(
            f"'{slug}' doesn't look like a day trip (no dayTripFrom field) — "
            "it may already be a full guide."
        )

    dest_name = old_entry["name"]
    base_city = old_entry["dayTripFrom"]
    print(f"=== Upgrading '{dest_name}' (guides/{slug}.html) from day trip to full guide ===")
    print(f"    Its day-trip card on {base_city}'s guide page links to this same URL and will keep working as-is.")

    template_html = load_template(repo, "guide")
    prompt_md = load_prompt(repo, "guide")
    prompt = build_prompt("guide", prompt_md, template_html, {"destination": dest_name}, slug)

    print("  Calling Gemini for the full-guide rewrite...")
    response_text = call_gemini(prompt)

    print("  Parsing response...")
    html, entry, verify_notes, suggested_daytrips = parse_response(response_text)

    # Belt and braces: force the URL to stay identical even if the AI
    # produced a slightly different slug somewhere in the JSON.
    entry["url"] = f"guides/{slug}.html"
    if "image" in entry:
        entry["image"] = f"images/guides/{slug}-hero-800.jpg"

    problems = validate_entry(entry, "guide")
    if problems:
        print("  VALIDATION ISSUES (fix before going live):")
        for p in problems:
            print(f"    - {p}")

    out_path = repo / "guides" / f"{slug}.html"
    out_path.write_text(html, encoding="utf-8")
    print(f"  Overwrote {out_path.relative_to(repo)} with the full-guide version.")

    hero_path = repo / "images" / "guides" / f"{slug}-hero.jpg"
    if not skip_images and (refresh_image or not hero_path.exists()):
        query = f"{dest_name} {image_query_suffix}".strip()
        print(f"  Fetching hero image for '{query}'...")
        ok = fetch_hero_image(query, hero_path)
        if ok:
            print(f"  Wrote {hero_path.relative_to(repo)}")
            generate_hero_variants(hero_path)
            alt_text = generate_alt_text(hero_path, dest_name)
            if alt_text:
                apply_alt_text(out_path, alt_text)
        else:
            print("  WARNING: could not fetch a hero image automatically — add one manually.")
    else:
        print(f"  Kept existing hero image at {hero_path.relative_to(repo)} (pass --refresh-image to replace it).")

    # Swap the day-trip entry for the full-guide entry, same url, no
    # dayTripFrom/duration fields — this is what moves it out of
    # daytrips.html's grouping and onto destinations.html as its own place.
    update_guides_json(repo, entry)
    print(f"  Updated guides.json: '{dest_name}' is now a full guide, no longer tagged dayTripFrom.")
    print(f"  Its day-trip card on {base_city}'s page was NOT touched — it still links to guides/{slug}.html,")
    print(f"  which is exactly what should happen: {dest_name} remains a valid day trip suggestion from {base_city}.")

    print(f"  Sweeping site for existing daytrip-card links to '{dest_name}'...")
    sweep_daytrip_links(repo, dest_name, f"{slug}.html")

    if verify_notes:
        log_path = repo / "_templates" / "_verify-before-publishing.log"
        with log_path.open("a", encoding="utf-8") as f:
            f.write(f"\n\n## {dest_name} ({slug}) — upgraded to full guide — {time.strftime('%Y-%m-%d %H:%M')}\n{verify_notes}\n")
        print(f"  Appended verify-before-publishing notes to {log_path.relative_to(repo)}")

    if suggested_daytrips:
        log_path = repo / "_templates" / "_suggested-daytrips.log"
        with log_path.open("a", encoding="utf-8") as f:
            f.write(f"\n## {dest_name} — {time.strftime('%Y-%m-%d %H:%M')}\n")
            for name in suggested_daytrips:
                f.write(f"- {name}\n")
        print(f"  Logged {len(suggested_daytrips)} day-trip suggestion(s) from the new guide to {log_path.relative_to(repo)}")

    print("  NOTE: page still has <meta name=\"robots\" content=\"noindex, nofollow\"> — remove it manually once reviewed.")


def process_row(repo: Path, row: dict, image_query_suffix: str, skip_images: bool):
    kind = row["type"].strip().lower()
    if kind not in ("guide", "daytrip"):
        print(f"Skipping row, unknown type '{row['type']}'")
        return []

    dest = row["destination"].strip()

    if guide_exists(repo, dest):
        print(f"\n=== {dest} ({kind}) — already exists in guides.json, skipping ===")
        return []

    slug = row.get("slug", "").strip() or slugify(dest)
    print(f"\n=== {dest} ({kind}) -> slug '{slug}' ===")

    template_html = load_template(repo, kind)
    prompt_md = load_prompt(repo, kind)
    prompt = build_prompt(kind, prompt_md, template_html, row, slug)

    print("  Calling Gemini...")
    response_text = call_gemini(prompt)

    print("  Parsing response...")
    html, entry, verify_notes, suggested_daytrips = parse_response(response_text)

    problems = validate_entry(entry, kind)
    if problems:
        print("  VALIDATION ISSUES (fix before going live):")
        for p in problems:
            print(f"    - {p}")

    out_path = repo / "guides" / f"{slug}.html"
    out_path.write_text(html, encoding="utf-8")
    print(f"  Wrote {out_path.relative_to(repo)}")

    if not skip_images:
        hero_path = repo / "images" / "guides" / f"{slug}-hero.jpg"
        query = f"{dest} {image_query_suffix}".strip()
        print(f"  Fetching hero image for '{query}'...")
        ok = fetch_hero_image(query, hero_path)
        if ok:
            print(f"  Wrote {hero_path.relative_to(repo)}")
            generate_hero_variants(hero_path)
            alt_text = generate_alt_text(hero_path, dest)
            if alt_text:
                apply_alt_text(out_path, alt_text)
        else:
            print("  WARNING: could not fetch a hero image automatically — add one manually.")

    update_guides_json(repo, entry)
    print("  Updated guides.json")

    print(f"  Sweeping site for existing daytrip-card links to '{dest}'...")
    sweep_daytrip_links(repo, dest, f"{slug}.html")

    if verify_notes:
        log_path = repo / "_templates" / "_verify-before-publishing.log"
        with log_path.open("a", encoding="utf-8") as f:
            f.write(f"\n\n## {dest} ({slug}) — {time.strftime('%Y-%m-%d %H:%M')}\n{verify_notes}\n")
        print(f"  Appended verify-before-publishing notes to {log_path.relative_to(repo)}")

    print(f"  NOTE: page still has <meta name=\"robots\" content=\"noindex, nofollow\"> — remove it manually once reviewed.")

    if kind == "guide" and suggested_daytrips:
        print(f"  AI named {len(suggested_daytrips)} day trip(s) in the guide: {', '.join(suggested_daytrips)}")

    return suggested_daytrips if kind == "guide" else []


def main():
    parser = argparse.ArgumentParser(description="Batch-generate Globehint guides via the free Gemini API.")
    parser.add_argument("csv_path", nargs="?", help="CSV file listing destinations to generate")
    parser.add_argument("--repo", required=True, help="Path to your local globehint.github.io checkout")
    parser.add_argument("--image-query-suffix", default="landmark travel",
                         help="Extra words appended to the image search query (default: 'landmark travel')")
    parser.add_argument("--skip-images", action="store_true", help="Don't fetch hero images")
    parser.add_argument("--delay", type=float, default=4.0, help="Seconds to wait between API calls (respect free-tier RPM)")
    parser.add_argument("--review-daytrips", action="store_true",
                         help="After each guide, ask (interactively) whether every AI-named day trip should become a day trip, a full guide, or be skipped")
    parser.add_argument("--max-daytrips-per-guide", type=int, default=3,
                         help="Cap on how many AI-suggested day trips to offer per guide (default: 3)")
    parser.add_argument("--upgrade-to-guide", metavar="SLUG",
                         help="Regenerate an existing day-trip page (by its slug, e.g. 'sintra') as a full "
                              "standalone guide. Keeps the same URL, so any day-trip card linking to it from "
                              "its base city's page is left exactly as-is and keeps working.")
    parser.add_argument("--refresh-image", action="store_true",
                         help="With --upgrade-to-guide, also fetch a new hero image instead of keeping the existing one")
    args = parser.parse_args()

    if not GEMINI_KEY:
        print("Set GEMINI_API_KEY in your environment first (see SETUP_AND_WORKFLOW.md).")
        sys.exit(1)
    genai.configure(api_key=GEMINI_KEY)

    repo = Path(args.repo).expanduser().resolve()
    if not (repo / "guides.json").exists():
        print(f"Doesn't look like the globehint repo (no guides.json found at {repo})")
        sys.exit(1)

    if args.upgrade_to_guide:
        upgrade_to_guide(repo, args.upgrade_to_guide, args.image_query_suffix, args.skip_images, args.refresh_image)
        print("\nDone. Review the diff (especially VALIDATION ISSUES above), remove noindex/nofollow when ready, then commit.")
        return

    if not args.csv_path:
        parser.error("csv_path is required unless --upgrade-to-guide is used")

    with open(args.csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    missing = REQUIRED_CSV_FIELDS - set(reader.fieldnames or [])
    if missing:
        print(f"CSV is missing required columns: {missing}")
        sys.exit(1)

    print(f"Loaded {len(rows)} destinations from {args.csv_path}")

    # Normalize rows into a mutable queue so auto-discovered day trips can be
    # appended and processed in the same run.
    queue = [dict(r) for r in rows]
    seen = {(r["type"].strip().lower(), r["destination"].strip().lower()) for r in queue}
    processed_count = 0

    while queue:
        row = queue.pop(0)
        try:
            suggested = process_row(repo, row, args.image_query_suffix, args.skip_images)
        except Exception as e:
            print(f"  ERROR processing '{row.get('destination')}': {e}")
            suggested = []

        processed_count += 1
        if queue:
            time.sleep(args.delay)

        if args.review_daytrips and suggested:
            base_city = row["destination"].strip()
            offered = suggested[: args.max_daytrips_per_guide]
            interactive = sys.stdin.isatty()

            if not interactive:
                # Non-interactive context (e.g. CI) — don't guess on the
                # user's behalf, just record the suggestions for a human to
                # decide on later.
                suggestions_log = repo / "_templates" / "_suggested-daytrips.log"
                with suggestions_log.open("a", encoding="utf-8") as f:
                    f.write(f"\n## {base_city} — {time.strftime('%Y-%m-%d %H:%M')}\n")
                    for name in offered:
                        f.write(f"- {name}\n")
                print(f"  Non-interactive run: logged {len(offered)} suggestion(s) from "
                      f"{base_city} to {suggestions_log.relative_to(repo)} instead of auto-creating them.")
                continue

            for name in offered:
                key_daytrip = ("daytrip", name.strip().lower())
                key_guide = ("guide", name.strip().lower())
                if key_daytrip in seen or key_guide in seen or guide_exists(repo, name):
                    continue

                disposition = ask_daytrip_disposition(name, base_city)
                if disposition == "skip":
                    continue

                seen.add((disposition, name.strip().lower()))
                new_row = {"type": disposition, "destination": name, "slug": ""}
                if disposition == "daytrip":
                    new_row["day_trip_from"] = base_city
                queue.append(new_row)
                print(f"  Queued '{name}' as a {'day trip' if disposition == 'daytrip' else 'full guide'}.")

    print("\nDone. Review the diffs in your repo (especially the VALIDATION ISSUES and _templates/_verify-before-publishing.log),")
    print("remove noindex/nofollow when ready, then commit and push.")


if __name__ == "__main__":
    main()
