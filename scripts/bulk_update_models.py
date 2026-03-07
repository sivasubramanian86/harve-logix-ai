import os

TARGET = "anthropic.claude-sonnet-4-20250514"
REPLACEMENT = "arn:aws:bedrock:ap-south-1:020513638290:application-inference-profile/hs79u71flmnc"

def replace_in_folder(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith((".yaml", ".yml", ".tf", ".js", ".md", ".json")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if TARGET in content:
                        content = content.replace(TARGET, REPLACEMENT)
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Updated {filepath}")
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

replace_in_folder(r"c:\Users\USER\Desktop\harve-logix-ai\infrastructure")
