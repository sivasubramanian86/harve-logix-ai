import json
import os

locales_dir = r"c:\Users\USER\Desktop\harve-logix-ai\web-dashboard\src\i18n\locales"
files_to_update = ["gu.json", "kn.json", "ml.json", "mr.json", "ta.json", "te.json"]

new_nav_keys = {
    "settings": "Settings",
    "faq": "FAQ"
}

default_settings = {
    "title": "Settings",
    "general": "General Settings",
    "language": "Language",
    "theme": "Theme",
    "dataMode": "Data Mode",
    "profile": "User Profile",
    "name": "Name",
    "role": "Role",
    "location": "Primary Region",
    "saveChanges": "Save Changes",
    "resetDefaults": "Reset Defaults",
    "themeDescription": "Switch between Light and Dark interface modes.",
    "languageDescription": "Select your preferred language for the dashboard.",
    "dataModeDescription": "Toggle between live AWS data and simulated demo data."
}

default_faq = {
    "title": "Frequently Asked Questions",
    "search": "Search for answers...",
    "questions": [
        {
            "q": "What is HarveLogixAI?",
            "a": "HarveLogixAI is an integrated platform using Amazon Bedrock and Nova models."
        }
    ]
}

for filename in files_to_update:
    path = os.path.join(locales_dir, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Update Nav
        if "nav" in data:
            data["nav"].update(new_nav_keys)
        
        # Add Settings and FAQ if missing
        if "settings" not in data:
            data["settings"] = default_settings
        if "faq" not in data:
            data["faq"] = default_faq
            
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {filename}")
