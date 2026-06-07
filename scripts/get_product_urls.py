import asyncio, os, sys, json, base64, re, urllib.request
from playwright.async_api import async_playwright

OUT_DIR = r"C:\Users\lapac\Desktop\recipe website\.claude\worktrees\frosty-raman-3d4061\images\products"
os.makedirs(OUT_DIR, exist_ok=True)

LINKS = [
    ("baby_hoodie",       "https://mavely.app.link/FmksXRZcL3b"),
    ("character_pjs",     "https://mavely.app.link/3k3EWX0cL3b"),
    ("minnie_outfit",     "https://mavely.app.link/8aSTLDadL3b"),
    ("kids_cups",         "https://mavely.app.link/sHB7gV5cL3b"),
    ("girls_shorts",      "https://mavely.app.link/QIizVV3cL3b"),
    ("nursery_center",    "https://mavely.app.link/DYY9VLpdL3b"),
    ("baby_shower_gift",  "https://mavely.app.link/Tvve8KiPK3b"),
    ("otter_thermometer", "https://mavely.app.link/E4mwFDldL3b"),
    ("baby_clothing_5",   "https://mavely.app.link/7qgGxaiPK3b"),
    ("kids_toy",          "https://mavely.app.link/kCbVXt1cL3b"),
    ("kids_outfit_7",     "https://mavely.app.link/xg8r0A6cL3b"),
    ("kids_essentials",   "https://mavely.app.link/NbnXs47cL3b"),
    ("sterilite_bin",     "https://mavely.app.link/8U1tNyaPK3b"),
    ("bow_storage",       "https://mavely.app.link/aHcPzPePK3b"),
    ("room_organizer",    "https://mavely.app.link/wO0hOIcdL3b"),
    ("folding_table",     "https://mavely.app.link/pMEs3agdL3b"),
    ("walmart_rollback",  "https://mavely.app.link/eJZGbqjdL3b"),
    ("best_seller_home",  "https://mavely.app.link/m1WxRDlPK3b"),
    ("sheets_50off",      "https://mavely.app.link/aQVz5DjPK3b"),
    ("silky_sheets_1",    "https://mavely.app.link/Gjfm7PkdL3b"),
    ("silky_sheets_2",    "https://mavely.app.link/yVUpBUmdL3b"),
    ("towel_warmer_1",    "https://mavely.app.link/uwNYrrdPK3b"),
    ("towel_warmer_2",    "https://mavely.app.link/lavcWHjdL3b"),
    ("hanes_shorts",      "https://mavely.app.link/gmvLQ7bdL3b"),
    ("dreamy_soft",       "https://mavely.app.link/S0krdAfPK3b"),
    ("perfect_bedding",   "https://mavely.app.link/DRRZgkkPK3b"),
    ("air_cooler_1",      "https://mavely.app.link/KJnpDqZcL3b"),
    ("air_cooler_2",      "https://mavely.app.link/9UOcSRedL3b"),
    ("bbq_camping",       "https://mavely.app.link/tRpId7bPK3b"),
    ("beach_blanket",     "https://mavely.app.link/xd1dqLgPK3b"),
    ("porch_goose_1",     "https://mavely.app.link/enoaD72cL3b"),
    ("porch_goose_2",     "https://mavely.app.link/wg24HF4cL3b"),
    ("rocking_chair",     "https://mavely.app.link/Ociiyp5cL3b"),
    ("outdoor_chair",     "https://mavely.app.link/FQbtIk2cL3b"),
    ("glamping",          "https://mavely.app.link/1cEMywsdL3b"),
    ("outdoor_toy",       "https://mavely.app.link/UFD4egtdL3b"),
    ("water_fun_1k",      "https://mavely.app.link/ufTFJQtdL3b"),
    ("water_deal",        "https://mavely.app.link/NrZ3HCedL3b"),
    ("sandals_7",         "https://mavely.app.link/xX2HePkPK3b"),
    ("summer_outfits",    "https://mavely.app.link/LEh2Zf3cL3b"),
    ("mama_dresses",      "https://mavely.app.link/CJbCK6dPK3b"),
    ("airpods",           "https://mavely.app.link/U7qkd7fdL3b"),
    ("air_fryer",         "https://mavely.app.link/DtVbtshdL3b"),
    ("powerful_device",   "https://mavely.app.link/odPkOhbPK3b"),
    ("gift_for_him",      "https://mavely.app.link/HUKLgyidL3b"),
    ("back_in_stock",     "https://mavely.app.link/6kGfRgedL3b"),
    ("walmart_crazy",     "https://mavely.app.link/9BhSUnodL3b"),
    ("everyone_buying",   "https://mavely.app.link/9Vv70PgdL3b"),
    ("wild_drop_1",       "https://mavely.app.link/3mtRTG9cL3b"),
    ("wild_drop_2",       "https://mavely.app.link/OthX1QrdL3b"),
    ("wild_drop_3",       "https://mavely.app.link/i8eZwsbdL3b"),
    ("wild_drop_4",       "https://mavely.app.link/H8GEZrqdL3b"),
    ("wild_drop_5",       "https://mavely.app.link/oPDDQ29cL3b"),
    ("wild_drop_6",       "https://mavely.app.link/OsYUuS8cL3b"),
    ("wild_drop_7",       "https://mavely.app.link/AG69FNndL3b"),
    ("wild_drop_8",       "https://mavely.app.link/7sEVOjmdL3b"),
    ("baby_gift_clr",     "https://mavely.app.link/oYqPWjgPK3b"),
    ("amazing_deal",      "https://mavely.app.link/PPBWs0cPK3b"),
    ("home_100off",       "https://mavely.app.link/6Di3I4nPK3b"),
    ("hot_find",          "https://mavely.app.link/yHKmd4odL3b"),
]

def decode_walmart_url(blocked_url):
    m = re.search(r'blocked\?url=([^&]+)', blocked_url)
    if not m:
        return blocked_url
    b64 = m.group(1)
    # Add padding
    b64 += '=' * (4 - len(b64) % 4)
    try:
        path = base64.b64decode(b64).decode('utf-8', errors='ignore')
        # Clean up - remove affiliate params keeping base path
        path = path.split('?')[0]
        return 'https://www.walmart.com' + path
    except:
        return blocked_url

def get_walmart_item_id(url):
    m = re.search(r'/(\d{6,12})(?:\?|$)', url)
    return m.group(1) if m else None

def build_walmart_img_url(item_id, size=450):
    return f"https://i5.walmartimages.com/seo/{item_id}_0.jpg?odnHeight={size}&odnWidth={size}&odnBg=ffffff"

def download_img(url, name):
    ext = 'jpg'
    path = os.path.join(OUT_DIR, f"{name}.{ext}")
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer': 'https://www.walmart.com/'
        })
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read()
            if len(data) > 1000:  # valid image
                with open(path, 'wb') as f:
                    f.write(data)
                return f"/images/products/{name}.{ext}"
    except Exception as e:
        pass
    return None

async def get_product(page, name, mavely_url):
    try:
        await page.goto(mavely_url, wait_until='domcontentloaded', timeout=20000)
        await page.wait_for_timeout(2000)
        final_url = page.url

        # Decode if blocked
        if 'blocked' in final_url:
            real_url = decode_walmart_url(final_url)
        else:
            real_url = final_url

        item_id = get_walmart_item_id(real_url)

        # Try to get product name from URL
        prod_name = re.sub(r'/ip/', '', real_url)
        prod_name = re.sub(r'/\d+.*', '', prod_name)
        prod_name = prod_name.replace('https://www.walmart.com', '').strip('/')
        prod_name = prod_name.replace('-', ' ').strip()

        local = None
        img_cdn = None

        if item_id:
            # Try CDN image directly
            img_cdn = build_walmart_img_url(item_id)
            local = download_img(img_cdn, name)

        print(f"{'OK' if local else '--'}  {name}: id={item_id} | {prod_name[:50]}")
        return {
            'name': name,
            'mavely_url': mavely_url,
            'real_url': real_url,
            'item_id': item_id,
            'product_name': prod_name,
            'img_cdn': img_cdn,
            'local': local,
        }
    except Exception as e:
        print(f"ERR {name}: {str(e)[:60]}")
        return {'name': name, 'mavely_url': mavely_url, 'real_url': None, 'item_id': None, 'product_name': None, 'img_cdn': None, 'local': None}

async def main():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
        )
        page = await ctx.new_page()
        for name, url in LINKS:
            r = await get_product(page, name, url)
            results.append(r)
        await browser.close()

    with open(os.path.join(OUT_DIR, 'results.json'), 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    saved = [r for r in results if r['local']]
    print(f"\n✅ {len(saved)}/{len(results)} images saved")
    for r in saved:
        print(f"  {r['name']}: {r['local']}")

asyncio.run(main())
