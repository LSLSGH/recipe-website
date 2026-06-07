"""
Download Walmart product images using item IDs.
Uses non-headless browser + proper Walmart image CDN format.
"""
import asyncio, os, sys, json, urllib.request, re
from playwright.async_api import async_playwright

OUT_DIR = r"C:\Users\lapac\Desktop\recipe website\.claude\worktrees\frosty-raman-3d4061\images\products"
os.makedirs(OUT_DIR, exist_ok=True)

# All products with known Walmart item IDs
PRODUCTS = [
    ("baby_hoodie",       18578667140, "Monster Jam Baby Full Zip Hoodie"),
    ("character_pjs",     17908472603, "Character Toddler Pajama Set"),
    ("minnie_outfit",     17804312783, "Minnie Mouse Toddler Outfit"),
    ("kids_cups",         14621560327, "Hefty Zoo Pals Cups 25ct"),
    ("girls_shorts",      17848468966, "Wonder Nation Toddler Girl Denim Shorts"),
    ("nursery_center",    7316465929,  "Baby Trend Simply Smart Playard"),
    ("baby_shower_gift",  18631763862, "Garanimals Baby Boy Outfit Set"),
    ("otter_thermometer", 3899421497,  "Infantino Light-up Otter Bath Thermometer"),
    ("baby_clothing_5",   18631763862, "Garanimals Baby Toddler Outfit"),
    ("kids_toy",          5320933223,  "Battat Hop In Foam Ball Pit"),
    ("kids_outfit_7",     5007255,     "Organic Cotton Pant Sweater Set"),
    ("sterilite_bin",     15142500442, "Sterilite 27 Gallon Industrial Tote"),
    ("bow_storage",       17741918875, "Cook With Color Stackable Food Storage"),
    ("room_organizer",    5345484462,  "10 Tier Metal Shoe Rack Organizer"),
    ("folding_table",     5129477160,  "Mainstays White 6 Foot Fold-in-Half Table"),
    ("walmart_rollback",  5326288984,  "Beats Solo4 Wireless Headphones"),
    ("best_seller_home",  18257154330, "Disney Cars Toddler Set"),
    ("sheets_50off",      14943459196, "Beautiful Signature Floral Cotton Sheet Set"),
    ("silky_sheets_1",    5592910557,  "American Home Collection Bamboo Viscose Sheets"),
    ("silky_sheets_2",    5592910557,  "American Home Collection Bamboo Viscose Sheets"),
    ("towel_warmer_1",    5102841302,  "Towel Warmer Bathroom"),
    ("towel_warmer_2",    17549902215, "16L Towel Warmer with Timer"),
    ("hanes_shorts",      13518918209, "Hanes Sleep Shorts"),
    ("dreamy_soft",       18178451421, "JS Toile Cami Tap Pajama Set"),
    ("perfect_bedding",   14880000281, "The Pioneer Woman 17pc Cookware Set"),
    ("air_cooler_1",      664185255,   "Arctic Air Freedom Wearable Neck Cooler"),
    ("air_cooler_2",      5454929532,  "14ft Trampoline with Enclosure"),
    ("bbq_camping",       15888750027, "BBQ Camping Accessories"),
    ("beach_blanket",     17677967381, "Beach Blanket Lemon"),
    ("porch_goose_1",     16893214181, "Large Porch Goose Statue"),
    ("porch_goose_2",     16893214181, "Large Porch Goose Statue"),
    ("rocking_chair",     16257612664, "Westmont Outdoor Rocking Chair Gray"),
    ("outdoor_chair",     12050656908, "Kickback Outdoor Rocking Chair"),
    ("glamping",          3138349115,  "Ozark Trail 15x15 8-Person Glamping Bell Tent"),
    ("outdoor_toy",       5437950832,  "12V Battery Powered Ride-On"),
    ("water_fun_1k",      5129477160,  "Mainstays 6 Foot Folding Table"),
    ("water_deal",        5321127922,  "Ninja SLUSHi 3-in-1 Frozen Drink Maker"),
    ("sandals_7",         18251514811, "Disney Cars Toddler Sandals"),
    ("summer_outfits",    17848468966, "Wonder Nation Denim Shorts"),
    ("mama_dresses",      18630622431, "Bluey Toddler Girl Graphic Tank Dress"),
    ("airpods",           11381374703, "Apple AirPods 4"),
    ("air_fryer",         17284765594, "Chefman 2Qt Compact Air Fryer Digital"),
    ("powerful_device",   17917270376, "Powerful Device"),
    ("gift_for_him",      1347629739,  "Blackstone 4 Burner 36 Griddle"),
    ("back_in_stock",     515928269,   "Arctic King 3.2 Cu ft Mini Fridge"),
    ("walmart_crazy",     5125269950,  "Hamilton Beach 0.9 Cu ft Microwave"),
    ("everyone_buying",   42379869,    "Lasko 16 Oscillating Pedestal Fan"),
    ("wild_drop_1",       16899207178, "BHG Brookbury Sectional Sofa"),
    ("wild_drop_2",       106826867,   "Great Value Everyday Plates 300ct"),
    ("wild_drop_3",       17804202018, "Winnie the Pooh Baby Athletic Set"),
    ("wild_drop_4",       17825472814, "Muumblus Modular L-Shape Sectional Sofa"),
    ("wild_drop_5",       18342555256, "Joyspun Women French Terry Sleep Set"),
    ("wild_drop_6",       15505120145, "KINGYES Outdoor Rocking Chair Set of 2"),
    ("wild_drop_7",       1094130120,  "Ophanie 18 Inch Queen Air Mattress"),
    ("wild_drop_8",       15238503499, "Cuisinart Toaster Oven Broiler"),
    ("baby_gift_clr",     5022271414,  "Disney Winnie The Pooh 3-Pack Burp Cloths"),
    ("amazing_deal",      42379869,    "Lasko 16 Oscillating Fan"),
    ("home_100off",       17952269520, "LED Jumbo 4 in a Row Game"),
    ("hot_find",          1082291497,  "Chefman 1L Electric Glass Kettle"),
]

def download_img(url, name):
    path = os.path.join(OUT_DIR, f"{name}.jpg")
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer': 'https://www.walmart.com/',
        })
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
            if len(data) > 5000:  # Valid image (not error page)
                with open(path, 'wb') as f:
                    f.write(data)
                return f"/images/products/{name}.jpg"
    except:
        pass
    return None

async def fetch_page_image(page, item_id, name):
    """Try to get image directly from Walmart product page"""
    url = f"https://www.walmart.com/ip/{item_id}"
    try:
        await page.goto(url, wait_until='domcontentloaded', timeout=20000)
        await page.wait_for_timeout(3000)

        # Try various image selectors
        img_url = None
        for sel in [
            'img[data-testid="hero-image"]',
            'picture source[type="image/webp"]',
            'picture img',
            '[class*="prod-hero"] img',
            '[class*="hero-image"] img',
            'img[src*="walmartimages"]',
        ]:
            try:
                el = await page.query_selector(sel)
                if el:
                    src = await el.get_attribute('src') or await el.get_attribute('srcset') or ''
                    # Extract first URL from srcset
                    src = src.split(' ')[0] if src else ''
                    if 'walmartimages' in src and src.startswith('http'):
                        # Enhance image quality
                        src = re.sub(r'odnHeight=\d+', 'odnHeight=450', src)
                        src = re.sub(r'odnWidth=\d+', 'odnWidth=450', src)
                        img_url = src
                        break
            except:
                pass

        if img_url:
            return download_img(img_url, name)

    except Exception as e:
        pass
    return None

async def main():
    results = []
    failed = []

    # First try: download from Walmart CDN using known URL patterns
    print("Phase 1: Trying CDN direct download...")
    cdn_patterns = [
        "https://i5.walmartimages.com/seo/{name_slug}_{item_id}.jpg?odnHeight=450&odnWidth=450&odnBg=ffffff",
        "https://i5.walmartimages.com/asr/{item_id}_0.jpg?odnHeight=450&odnWidth=450&odnBg=ffffff",
        "https://i5.walmartimages.com/seo/{item_id}.jpg?odnHeight=450&odnWidth=450&odnBg=ffffff",
    ]

    for name, item_id, prod_name in PRODUCTS:
        local = None
        name_slug = prod_name.replace(' ', '-').replace("'", '').replace(',', '')[:60]

        # Try each pattern
        for pattern in cdn_patterns:
            url = pattern.replace('{item_id}', str(item_id)).replace('{name_slug}', name_slug)
            local = download_img(url, name)
            if local:
                break

        if local:
            print(f"CDN  {name}: {local}")
        else:
            failed.append((name, item_id, prod_name))

    print(f"\nPhase 1: {len(PRODUCTS)-len(failed)} downloaded, {len(failed)} need browser")

    # Phase 2: use browser for remaining items
    if failed:
        print("\nPhase 2: Using browser for remaining products...")
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)  # Non-headless to avoid bot detection
            ctx = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                viewport={'width': 1280, 'height': 800},
            )
            page = await ctx.new_page()

            for name, item_id, prod_name in failed:
                local = await fetch_page_image(page, item_id, name)
                if local:
                    print(f"PAGE {name}: {local}")
                else:
                    print(f"FAIL {name}: item_id={item_id}")

            await browser.close()

    # Save results mapping
    mapping = {}
    for name, item_id, prod_name in PRODUCTS:
        ext = 'jpg'
        path = os.path.join(OUT_DIR, f"{name}.{ext}")
        local = f"/images/products/{name}.{ext}" if os.path.exists(path) else None
        mapping[name] = {
            'item_id': item_id,
            'product_name': prod_name,
            'local_img': local,
            'walmart_url': f"https://www.walmart.com/ip/{item_id}",
        }

    with open(os.path.join(OUT_DIR, 'mapping.json'), 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2)

    total = sum(1 for v in mapping.values() if v['local_img'])
    print(f"\nFinal: {total}/{len(PRODUCTS)} images downloaded")

asyncio.run(main())
