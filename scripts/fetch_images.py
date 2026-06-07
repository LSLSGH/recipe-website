import asyncio, os, sys, json, urllib.request
from playwright.async_api import async_playwright

OUT_DIR = r"C:\Users\lapac\Desktop\recipe website\.claude\worktrees\frosty-raman-3d4061\images\products"
os.makedirs(OUT_DIR, exist_ok=True)

LINKS = [
    ("baby_hoodie",      "https://mavely.app.link/FmksXRZcL3b"),
    ("character_pjs",    "https://mavely.app.link/3k3EWX0cL3b"),
    ("minnie_outfit",    "https://mavely.app.link/8aSTLDadL3b"),
    ("kids_cups",        "https://mavely.app.link/sHB7gV5cL3b"),
    ("girls_shorts",     "https://mavely.app.link/QIizVV3cL3b"),
    ("nursery_center",   "https://mavely.app.link/DYY9VLpdL3b"),
    ("baby_shower_gift", "https://mavely.app.link/Tvve8KiPK3b"),
    ("otter_thermometer","https://mavely.app.link/E4mwFDldL3b"),
    ("baby_clothing_5",  "https://mavely.app.link/7qgGxaiPK3b"),
    ("kids_toy",         "https://mavely.app.link/kCbVXt1cL3b"),
    ("kids_outfit_7",    "https://mavely.app.link/xg8r0A6cL3b"),
    ("kids_essentials",  "https://mavely.app.link/NbnXs47cL3b"),
    ("sterilite_bin",    "https://mavely.app.link/8U1tNyaPK3b"),
    ("bow_storage",      "https://mavely.app.link/aHcPzPePK3b"),
    ("room_organizer",   "https://mavely.app.link/wO0hOIcdL3b"),
    ("folding_table",    "https://mavely.app.link/pMEs3agdL3b"),
    ("walmart_rollback", "https://mavely.app.link/eJZGbqjdL3b"),
    ("best_seller_home", "https://mavely.app.link/m1WxRDlPK3b"),
    ("sheets_50off",     "https://mavely.app.link/aQVz5DjPK3b"),
    ("silky_sheets_1",   "https://mavely.app.link/Gjfm7PkdL3b"),
    ("silky_sheets_2",   "https://mavely.app.link/yVUpBUmdL3b"),
    ("towel_warmer_1",   "https://mavely.app.link/uwNYrrdPK3b"),
    ("towel_warmer_2",   "https://mavely.app.link/lavcWHjdL3b"),
    ("hanes_shorts",     "https://mavely.app.link/gmvLQ7bdL3b"),
    ("dreamy_soft",      "https://mavely.app.link/S0krdAfPK3b"),
    ("perfect_bedding",  "https://mavely.app.link/DRRZgkkPK3b"),
    ("air_cooler_1",     "https://mavely.app.link/KJnpDqZcL3b"),
    ("air_cooler_2",     "https://mavely.app.link/9UOcSRedL3b"),
    ("bbq_camping",      "https://mavely.app.link/tRpId7bPK3b"),
    ("beach_blanket",    "https://mavely.app.link/xd1dqLgPK3b"),
    ("porch_goose_1",    "https://mavely.app.link/enoaD72cL3b"),
    ("porch_goose_2",    "https://mavely.app.link/wg24HF4cL3b"),
    ("rocking_chair",    "https://mavely.app.link/Ociiyp5cL3b"),
    ("outdoor_chair",    "https://mavely.app.link/FQbtIk2cL3b"),
    ("glamping",         "https://mavely.app.link/1cEMywsdL3b"),
    ("outdoor_toy",      "https://mavely.app.link/UFD4egtdL3b"),
    ("water_fun_1k",     "https://mavely.app.link/ufTFJQtdL3b"),
    ("water_deal",       "https://mavely.app.link/NrZ3HCedL3b"),
    ("sandals_7",        "https://mavely.app.link/xX2HePkPK3b"),
    ("summer_outfits",   "https://mavely.app.link/LEh2Zf3cL3b"),
    ("mama_dresses",     "https://mavely.app.link/CJbCK6dPK3b"),
    ("airpods",          "https://mavely.app.link/U7qkd7fdL3b"),
    ("air_fryer",        "https://mavely.app.link/DtVbtshdL3b"),
    ("powerful_device",  "https://mavely.app.link/odPkOhbPK3b"),
    ("gift_for_him",     "https://mavely.app.link/HUKLgyidL3b"),
    ("back_in_stock",    "https://mavely.app.link/6kGfRgedL3b"),
    ("walmart_crazy",    "https://mavely.app.link/9BhSUnodL3b"),
    ("everyone_buying",  "https://mavely.app.link/9Vv70PgdL3b"),
    ("wild_drop_1",      "https://mavely.app.link/3mtRTG9cL3b"),
    ("wild_drop_2",      "https://mavely.app.link/OthX1QrdL3b"),
    ("wild_drop_3",      "https://mavely.app.link/i8eZwsbdL3b"),
    ("wild_drop_4",      "https://mavely.app.link/H8GEZrqdL3b"),
    ("wild_drop_5",      "https://mavely.app.link/oPDDQ29cL3b"),
    ("wild_drop_6",      "https://mavely.app.link/OsYUuS8cL3b"),
    ("wild_drop_7",      "https://mavely.app.link/AG69FNndL3b"),
    ("wild_drop_8",      "https://mavely.app.link/7sEVOjmdL3b"),
    ("baby_gift_clr",    "https://mavely.app.link/oYqPWjgPK3b"),
    ("amazing_deal",     "https://mavely.app.link/PPBWs0cPK3b"),
]

def download_image(img_url, name):
    """Download image and save locally"""
    if not img_url or not img_url.startswith("http"):
        return None
    ext = "jpg"
    if ".png" in img_url.lower():
        ext = "png"
    elif ".webp" in img_url.lower():
        ext = "webp"
    local_path = os.path.join(OUT_DIR, f"{name}.{ext}")
    try:
        req = urllib.request.Request(img_url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, timeout=15) as r:
            with open(local_path, "wb") as f:
                f.write(r.read())
        return f"/images/products/{name}.{ext}"
    except Exception as e:
        print(f"  Download failed: {e}")
        return None

async def get_product_info(page, name, url):
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(4000)
        final_url = page.url
        img_url = None
        title = None

        if "walmart.com" in final_url:
            # Get title
            try:
                t = await page.title()
                title = t.split(" - ")[0].strip()
            except:
                pass
            # Get product image
            for sel in [
                '[data-testid="hero-image"] img',
                'img[class*="prod-hero"]',
                '[class*="hero-image"] img',
                'img[class*="ProductImage"]',
                '[class*="media-image"] img',
            ]:
                try:
                    el = await page.query_selector(sel)
                    if el:
                        src = await el.get_attribute("src")
                        if src and src.startswith("http") and "walmartimages" in src:
                            img_url = src.split("?")[0] + "?odnHeight=450&odnWidth=450&odnBg=ffffff"
                            break
                except:
                    pass

        elif "amazon.com" in final_url:
            try:
                t = await page.title()
                title = t.replace("Amazon.com:", "").split(":")[0].strip()
            except:
                pass
            for sel in ["#landingImage", "#imgBlkFront", ".a-dynamic-image"]:
                try:
                    el = await page.query_selector(sel)
                    if el:
                        src = await el.get_attribute("src") or await el.get_attribute("data-old-hires")
                        if src and src.startswith("http"):
                            img_url = src
                            break
                except:
                    pass

        # Generic: find best og:image or large img
        if not img_url:
            try:
                og = await page.query_selector('meta[property="og:image"]')
                if og:
                    img_url = await og.get_attribute("content")
            except:
                pass

        print(f"OK  {name}: {final_url[:70]}")
        print(f"    title: {title}")
        print(f"    img:   {str(img_url)[:80]}")

        local = download_image(img_url, name) if img_url else None
        return {"name": name, "mavely_url": url, "final_url": final_url, "title": title, "img_url": img_url, "local": local}

    except Exception as e:
        print(f"ERR {name}: {str(e)[:80]}")
        return {"name": name, "mavely_url": url, "final_url": None, "title": None, "img_url": None, "local": None}


async def main():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
            locale="en-US",
        )
        page = await ctx.new_page()

        for name, url in LINKS:
            r = await get_product_info(page, name, url)
            results.append(r)

        await browser.close()

    with open(os.path.join(OUT_DIR, "results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nDone. {sum(1 for r in results if r['local'])} images saved out of {len(results)}")

asyncio.run(main())
