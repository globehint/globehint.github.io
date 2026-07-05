#!/usr/bin/env python3
"""
publish_guide.py

Fallback "semi-automated" guide publisher for when the LLM-based automation's
RPDs (requests-per-day) are exhausted. Run in GitHub Actions on every push
that touches drafts/*.html.

Trigger is intentionally a dedicated drafts/ folder, not guides/*.html:
your main LLM automation writes into guides/ directly, so watching guides/
would fire this workflow on every one of ITS publishes too (wasted runs,
and a race if its commit briefly leaves a guide file present before
guides.json catches up). Nothing but a deliberate drop into drafts/ can
set this off, and this script's own commits never touch drafts/, so
there's no risk of it re-triggering itself either.

What it does for each guide found in drafts/:
  1. Reads a <!--GUIDE-META ... --> comment block at the top of the file.
  2. Searches Pexels for a hero photo and downloads it.
  3. Generates the same sized variants your generate-hero-images.yml makes
     (400/800/1200 webp + 800 jpg), inline, since a bot commit won't
     re-trigger that workflow.
  4. Uses Pexels' own "alt" field as the image's alt text (best-effort;
     no LLM is available in this fallback path, so review it manually
     for anything Pexels tags oddly).
  5. Moves the file into guides/ and appends a new guides.json entry.
  6. Forward-fills the new guide's own daytrip-card hrefs against
     guides.json.
  7. Back-fills daytrip-card hrefs in every OTHER guide that references
     this new guide by name and is still pointing at href="#".

Requires secret PEXELS_API_KEY in the repo.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from datetime import date

import requests
from bs4 import BeautifulSoup

REPO_ROOT = Path(__file__).resolve().parent.parent
DRAFTS_DIR = REPO_ROOT / "drafts"
GUIDES_DIR = REPO_ROOT / "guides"
IMAGES_DIR = REPO_ROOT / "images" / "guides"
GUIDES_JSON = REPO_ROOT / "guides.json"
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY")

META_RE = re.compile(r"<!--GUIDE-META(.*?)-->", re.DOTALL)


def slugify_from_url(url: str) -> str:
    # guides/some-slug.html -> some-slug
    return Path(url).stem


def load_guides_json():
    if GUIDES_JSON.exists():
        return json.loads(GUIDES_JSON.read_text(encoding="utf-8"))
    return []


def save_guides_json(data):
    # One JSON object per line, matching the existing file's style.
    with open(GUIDES_JSON, "w", encoding="utf-8") as f:
        f.write("[\n")
        for i, entry in enumerate(data):
            comma = "," if i < len(data) - 1 else ""
            f.write("  " + json.dumps(entry, ensure_ascii=False) + comma + "\n")
        f.write("]\n")


def parse_meta_block(html_text: str) -> dict:
    m = META_RE.search(html_text)
    if not m:
        return {}
    block = m.group(1)
    meta = {}
    for line in block.strip().splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta


def find_draft_guides():
    return sorted(DRAFTS_DIR.glob("*.html"))


def search_pexels_photo(query: str):
    if not PEXELS_API_KEY:
        print(f"::error::PEXELS_API_KEY is not set; cannot fetch an image for '{query}'.")
        sys.exit(1)
    resp = requests.get(
        "https://api.pexels.com/v1/search",
        headers={"Authorization": PEXELS_API_KEY},
        params={"query": query, "per_page": 5, "orientation": "landscape"},
        timeout=30,
    )
    resp.raise_for_status()
    photos = resp.json().get("photos", [])
    if not photos:
        return None
    return photos[0]


def download_and_process_image(photo: dict, slug: str) -> tuple[str, str]:
    """Downloads the original photo, generates variants, returns (image_path, alt_text)."""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    src_url = photo["src"]["original"]
    alt_text = photo.get("alt") or "A view of the destination featured in this guide."

    src_path = IMAGES_DIR / f"{slug}-hero.jpg"
    r = requests.get(src_url, timeout=60)
    r.raise_for_status()
    src_path.write_bytes(r.content)

    # Generate the same variants generate-hero-images.yml would produce.
    for width in (400, 800, 1200):
        out = IMAGES_DIR / f"{slug}-hero-{width}.webp"
        subprocess.run(
            ["cwebp", "-q", "80", "-resize", str(width), "0", str(src_path), "-o", str(out)],
            check=True,
        )
    jpg_out = IMAGES_DIR / f"{slug}-hero-800.jpg"
    subprocess.run(
        ["convert", str(src_path), "-resize", "800x", "-quality", "78", "-strip", str(jpg_out)],
        check=True,
    )

    return f"images/guides/{slug}-hero-800.jpg", alt_text


def build_guide_entry(meta: dict, slug: str, image_path: str, alt_text: str) -> dict:
    entry = {
        "name": meta.get("name", slug.replace("-", " ").title()),
        "url": f"guides/{slug}.html",
        "country": meta.get("country", ""),
        "continent": meta.get("continent", ""),
        "flag": meta.get("flag", ""),
        "vibe": meta.get("vibe", ""),
        "published": date.today().isoformat(),
    }
    if meta.get("dayTripFrom"):
        entry["dayTripFrom"] = meta["dayTripFrom"]
    if meta.get("duration"):
        entry["duration"] = meta["duration"]
    entry["blurb"] = meta.get("blurb", "")
    entry["image"] = image_path
    entry["imageAlt"] = alt_text
    return entry


def name_matches(card_name: str, guide_name: str) -> bool:
    norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
    return norm(card_name) == norm(guide_name)


def fill_daytrip_cards_in_file(path: Path, guides_index: dict) -> bool:
    """
    guides_index: dict of normalized-name -> url
    Fills href="#" daytrip-card links where the card's <h4> name matches
    a known guide. Returns True if the file was modified.
    """
    html_text = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(html_text, "html.parser")
    changed = False

    for card in soup.select("a.daytrip-card"):
        href = card.get("href", "")
        if href and href != "#":
            continue  # already linked, leave it alone
        h4 = card.find("h4")
        if not h4:
            continue
        card_name = h4.get_text(strip=True)
        norm = re.sub(r"[^a-z0-9]", "", card_name.lower())
        if norm in guides_index:
            card["href"] = guides_index[norm]
            changed = True

    if changed:
        path.write_text(str(soup), encoding="utf-8")
    return changed


def main():
    guides = load_guides_json()
    existing_urls = {g["url"] for g in guides}

    draft_paths = find_draft_guides()
    if not draft_paths:
        print("No draft guides found in drafts/. Nothing to do.")
        return

    newly_published_names = []

    for draft_path in draft_paths:
        print(f"Processing draft: {draft_path}")
        html_text = draft_path.read_text(encoding="utf-8")
        meta = parse_meta_block(html_text)
        slug = slugify_from_url(draft_path.name)
        dest_url = f"guides/{slug}.html"

        if "name" not in meta:
            print(f"::error::{draft_path} has no <!--GUIDE-META--> block (or no 'name' field). "
                  f"Leaving it in drafts/ - add a block like:\n<!--GUIDE-META\nname: ...\ncountry: ...\n"
                  f"continent: ...\nflag: ...\nvibe: ...\ndayTripFrom: ...\nduration: ...\nblurb: ...\n-->")
            continue

        if dest_url in existing_urls:
            print(f"::warning::{dest_url} already exists in guides.json - "
                  f"leaving {draft_path} in drafts/ untouched so nothing gets overwritten. "
                  f"Rename the draft or remove the stale guides.json entry, then re-run.")
            continue

        query = f"{meta['name']} {meta.get('country', '')} landmark".strip()
        photo = search_pexels_photo(query)
        if not photo:
            print(f"::warning::No Pexels result for '{query}'. Leaving {draft_path} in drafts/; "
                  f"add an image manually to images/guides/{slug}-hero.jpg and re-run.")
            continue

        image_path, alt_text = download_and_process_image(photo, slug)
        entry = build_guide_entry(meta, slug, image_path, alt_text)

        # Only now that the image + entry succeeded, move the draft into guides/.
        GUIDES_DIR.mkdir(parents=True, exist_ok=True)
        dest_path = GUIDES_DIR / f"{slug}.html"
        draft_path.rename(dest_path)

        guides.append(entry)
        existing_urls.add(dest_url)
        newly_published_names.append(entry["name"])
        print(f"Published {entry['name']} -> {dest_url}")

    if not newly_published_names:
        print("No guides were successfully published.")
        return

    save_guides_json(guides)

    # Build a name -> url lookup for ALL guides (including the ones just added)
    guides_index = {re.sub(r"[^a-z0-9]", "", g["name"].lower()): g["url"] for g in guides}

    # Forward-fill new guides' own daytrip-card blocks, and back-fill any
    # OTHER already-published guide that references one of them.
    all_guide_paths = sorted(GUIDES_DIR.glob("*.html"))
    modified_files = []
    for path in all_guide_paths:
        if fill_daytrip_cards_in_file(path, guides_index):
            modified_files.append(path)

    print(f"Filled daytrip-card links in: {[str(p) for p in modified_files]}")
    print(f"Newly published guides: {newly_published_names}")


if __name__ == "__main__":
    main()
