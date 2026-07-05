import os
import re
import json
import requests
from datetime import datetime

UNSPLASH_KEY = os.environ.get("UNSPLASH_KEY")
HF_TOKEN = os.environ.get("HF_TOKEN")

DRAFTS_DIR = "drafts"
GUIDES_DIR = "guides"
IMAGES_DIR = "images/guides"
JSON_FILE = "guides.json"

# Load guides.json
if os.path.exists(JSON_FILE):
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        guides_data = json.load(f)
else:
    guides_data = []

def get_unsplash_image(destination):
    url = f"https://api.unsplash.com/search/photos?query={destination}&orientation=landscape&per_page=1"
    headers = {"Authorization": f"Client-ID {UNSPLASH_KEY}"}
    response = requests.get(url, headers=headers).json()
    if response.get("results"):
        return response["results"][0]["urls"]["regular"]
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" # Fallback

def get_ai_alt_text(image_bytes):
    api_url = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    response = requests.post(api_url, headers=headers, data=image_bytes)
    if response.status_code == 200:
        result = response.json()
        if result and isinstance(result, list) and "generated_text" in result[0]:
            return result[0]["generated_text"].capitalize()
    return "Scenic travel destination view"

def parse_metadata(html_content):
    metadata = {}
    match = re.search(r"", html_content, re.DOTALL)
    if match:
        for line in match.group(1).strip().split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                metadata[k.strip().lower()] = v.strip()
    return metadata

# --- STEP 1: Process Drafts ---
draft_files = [f for f in os.listdir(DRAFTS_DIR) if f.endswith(".html")]
if not draft_files:
    print("No new drafts found.")
    exit(0)

os.makedirs(GUIDES_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

for filename in draft_files:
    draft_path = os.path.join(DRAFTS_DIR, filename)
    with open(draft_path, "r", encoding="utf-8") as f:
        html = f.read()
    
    meta = parse_metadata(html)
    destination = meta.get("destination")
    
    if not destination:
        print(f"Skipping {filename}: Missing 'Destination' metadata.")
        continue
        
    slug = destination.lower().replace(" ", "-").replace(",", "")
    guide_type = meta.get("type", "Guide")
    date_pub = datetime.today().strftime('%Y-%m-%d')
    target_filename = f"{slug}.html"
    
    # Image Sourcing & Alt Text
    print(f"Fetching image and alt text for {destination}...")
    img_url = get_unsplash_image(destination)
    img_bytes = requests.get(img_url).content
    alt_text = get_ai_alt_text(img_bytes)
    
    # Save the raw image for Imagemagick compression later
    raw_img_path = os.path.join(IMAGES_DIR, f"{slug}-hero.jpg")
    with open(raw_img_path, "wb") as f:
        f.write(img_bytes)
        
    # Template Replacements
    html = html.replace("[Location Name]", destination)
    html = html.replace("[LOCATION NAME]", destination.upper())
    html = html.replace("[location-slug]", slug)
    html = html.replace("[GUIDE URL SLUG]", f"guides/{target_filename}")
    html = html.replace("[Country Name]", meta.get("country", ""))
    html = html.replace("[Country]", meta.get("country", ""))
    html = html.replace("[GUIDE BLURB]", meta.get("blurb", ""))
    html = html.replace("[Blurb - a punchy one or two sentence hook about what makes this place distinctive]", meta.get("blurb", ""))
    html = html.replace("[Blurb - a punchy one or two sentence hook about what makes this place distinctive, written with the day-tripper in mind.]", meta.get("blurb", ""))
    html = html.replace("[DATE PUBLISHED]", date_pub)
    html = html.replace("[HERO IMAGE PATH]", f"images/guides/{slug}-hero-800.jpg")
    html = html.replace("[HERO IMAGE ALT]", alt_text)
    html = html.replace("[what the photo shows, e.g. a specific street, view, or landmark]", alt_text)
    
    if guide_type == "Day Trip":
        html = html.replace("[Base City]", meta.get("base city", ""))
        html = html.replace("[BASE CITY]", meta.get("base city", "").upper())
        html = html.replace("[Base City Name]", meta.get("base city", ""))
        html = html.replace("[Duration - e.g. Half day / Full day]", meta.get("duration", ""))
    
    # Save finished HTML
    live_path = os.path.join(GUIDES_DIR, target_filename)
    with open(live_path, "w", encoding="utf-8") as f:
        f.write(html)
        
    # Update guides.json
    new_entry = {
        "name": destination,
        "url": f"guides/{target_filename}",
        "country": meta.get("country", ""),
        "continent": meta.get("continent", ""),
        "flag": meta.get("flag", ""),
        "vibe": meta.get("vibe", ""),
        "published": date_pub,
        "blurb": meta.get("blurb", ""),
        "image": f"images/guides/{slug}-hero-800.jpg",
        "imageAlt": alt_text
    }
    
    if guide_type == "Day Trip":
        new_entry["dayTripFrom"] = meta.get("base city", "")
        new_entry["duration"] = meta.get("duration", "Full day")
        
    guides_data.append(new_entry)
    os.remove(draft_path)

with open(JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(guides_data, f, indent=2, ensure_ascii=False)

# --- STEP 2: Smart Bidirectional Cross-Linking ---
guide_url_map = {g["name"].lower(): g["url"] for g in guides_data}
all_live_files = [f for f in os.listdir(GUIDES_DIR) if f.endswith(".html")]

for filename in all_live_files:
    file_path = os.path.join(GUIDES_DIR, filename)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    updated = False
    card_pattern = r'(<a\s+href=")([^"]*)(".*?class="daytrip-card".*?<h4>)(.*?)(</h4>)'
    
    def link_replacer(match):
        nonlocal updated
        target_city = match.group(4).strip().lower()
        if target_city in guide_url_map and match.group(2) != f"../{guide_url_map[target_city]}":
            updated = True
            return f'{match.group(1)}../{guide_url_map[target_city]}{match.group(3)}{match.group(4)}{match.group(5)}'
        return match.group(0)

    new_content = re.sub(card_pattern, link_replacer, content, flags=re.DOTALL)
    
    if updated:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
            print(f"Updated cross-links in: {filename}")

print("Processing complete!")
