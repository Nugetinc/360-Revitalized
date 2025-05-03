import json
import os
import requests
from urllib.parse import quote
from bs4 import BeautifulSoup
from colorama import Fore, Style, init

# Initialize colorama
init(autoreset=True)

STEAMGRIDDB_API_KEY = "b3d19d7cc38fd6cdb04aee52f841ec70"
OUTPUT_DIR = "games"
XBOX_JSON = "Xbox360TitleIDs.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def log_info(message):
    print(f"{Fore.CYAN}[INFO]{Style.RESET_ALL} {message}")

def log_success(message):
    print(f"{Fore.GREEN}[SUCCESS]{Style.RESET_ALL} {message}")

def log_warning(message):
    print(f"{Fore.YELLOW}[WARNING]{Style.RESET_ALL} {message}")

def log_error(message):
    print(f"{Fore.RED}[ERROR]{Style.RESET_ALL} {message}")

def fetch_steamgriddb_logo(game_name):
    headers = {
        "Authorization": f"Bearer {STEAMGRIDDB_API_KEY}",
        "Accept": "application/json"
    }
    try:
        search_url = f"https://www.steamgriddb.com/api/v2/search/autocomplete/{quote(game_name)}"
        response = requests.get(search_url, headers=headers, timeout=10)
        response.raise_for_status()
        results = response.json().get("data", [])
        if not results:
            log_warning(f"No SteamGridDB match for: {game_name}")
            return None
        game_id = results[0]["id"]
        logo_url = f"https://www.steamgriddb.com/api/v2/logos/game/{game_id}"
        logo_resp = requests.get(logo_url, headers=headers, timeout=10)
        logo_resp.raise_for_status()
        logos = logo_resp.json().get("data", [])
        if logos:
            return logos[0]["url"]
    except Exception as e:
        log_error(f"SteamGridDB error for {game_name}: {e}")
    return None

def fetch_microsoft_screenshots(name):
    if not name:
        return []
    search_url = f"https://www.microsoft.com/en-us/search/shop/games?q={quote(name)}&devicetype=xbox"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(search_url, headers=headers, timeout=0.5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        screenshots = []
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if "store-images" in src and src.endswith(".jpg"):
                screenshots.append(src)
                if len(screenshots) >= 3:
                    break
        return screenshots
    except Exception as e:
        log_error(f"Failed to fetch screenshots for {name}: {e}")
        return []

def generate_game_json(titleid, name):
    log_info(f"Processing {titleid} - {name}")
    boxart = f"https://xboxunity.net/boxart/{titleid.upper()}.jpg"
    thumbnail = f"https://xboxunity.net/assets/gameicons/{titleid.upper()}.jpg"
    screenshots = fetch_microsoft_screenshots(name)
    logo_url = fetch_steamgriddb_logo(name)

    if not screenshots:
        screenshots = ["https://via.placeholder.com/640x360?text=No+Screenshot+Available"]

    game_data = {
        "titleid": titleid.upper(),
        "name": name,
        "boxart": boxart,
        "thumbnail": thumbnail,
        "screenshots": screenshots,
        "notes": "THERE IS NO DOWNLOAD LINK FOR THIS GAME YET.",
        "logo": logo_url
    }

    with open(os.path.join(OUTPUT_DIR, f"{titleid.upper()}.json"), "w", encoding="utf-8") as f:
        json.dump(game_data, f, indent=4, ensure_ascii=False)

    log_success(f"Saved: {titleid.upper()}.json")

def scrape_all():
    try:
        with open(XBOX_JSON, "r", encoding="utf-8") as f:
            entries = json.load(f)
    except Exception as e:
        log_error(f"Failed to read {XBOX_JSON}: {e}")
        return

    for entry in entries:
        titleid = entry.get("TitleID") or entry.get("TITLEID")
        name = entry.get("Title") or entry.get("MYRIENT GAME NAME")
        if titleid and name:
            generate_game_json(titleid, name)
        else:
            log_warning(f"Skipping invalid entry: {entry}")

def scrape_single():
    titleid = input("Enter Title ID (e.g., 545408B5): ").strip().upper()
    name = input("Enter game name: ").strip()
    if not titleid or not name:
        log_warning("Invalid input.")
        return
    generate_game_json(titleid, name)

def test_connections():
    print("[INFO] Testing XboxUnity...")
    try:
        # Use HTTP instead of HTTPS to avoid SSL errors due to bad certificate
        test_img = requests.get("http://xboxunity.net/assets/gameicons/545408B5.jpg", timeout=5)
        if test_img.status_code == 200:
            print("[PASS] XboxUnity image endpoint is reachable.")
        else:
            print(f"[FAIL] XboxUnity returned status code {test_img.status_code}.")
    except Exception as e:
        print(f"[ERROR] XboxUnity test failed: {e}")


    log_info("Testing Microsoft search...")
    try:
        r = requests.get("https://www.microsoft.com/en-us/search/shop/games?q=Halo", timeout=5)
        print("Microsoft:", "OK" if r.status_code == 200 else "Failed")
    except Exception as e:
        print("Microsoft: Failed", e)

    log_info("Testing SteamGridDB...")
    headers = {"Authorization": f"Bearer {STEAMGRIDDB_API_KEY}"}
    try:
        r = requests.get("https://www.steamgriddb.com/api/v2/search/autocomplete/Halo", headers=headers)
        print("SteamGridDB:", "OK" if r.status_code == 200 else "Failed")
    except Exception as e:
        print("SteamGridDB: Failed", e)

def main_menu():
    while True:
        print(f"\n{Fore.GREEN}==== Xbox 360 Metadata Scraper ===={Style.RESET_ALL}")
        print("1. Scrape one game (enter Title ID)")
        print("2. Scrape all games from Xbox360TitleIDs.json")
        print("3. Test external API connections")
        print("4. Exit")
        choice = input("Choose an option: ").strip()

        if choice == "1":
            scrape_single()
        elif choice == "2":
            scrape_all()
        elif choice == "3":
            test_connections()
        elif choice == "4":
            print("Goodbye!")
            break
        else:
            log_warning("Invalid choice. Try again.")

if __name__ == "__main__":
    main_menu()
