import requests
import os
import sys
import zipfile
import shutil
from pathlib import Path

REPO = "thumb2086/valorant"
EXE_NAME = "Valorant.exe"  # Windows；Mac/Linux改"Valorant"
CURRENT_VERSION = "1.0.0"  # 手動改版本

def check_update():
    try:
        response = requests.get(f"https://api.github.com/repos/{REPO}/releases/latest")
        latest = response.json()
        latest_version = latest['tag_name']
        download_url = next(asset['browser_download_url'] for asset in latest['assets'] if 'Valorant' in asset['name'])

        if latest_version > CURRENT_VERSION:
            print(f"🔄 更新可用: {latest_version}")
            zip_path = "update.zip"
            r = requests.get(download_url)
            with open(zip_path, 'wb') as f: f.write(r.content)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(".")
            os.remove(zip_path)
            print("✅ 更新完成！重啟遊戲...")
            os.execl(sys.executable, sys.executable, *sys.argv)  # 重啟
    except:
        pass  # 離線玩單機
    print("🚀 啟動遊戲...")

if __name__ == "__main__":
    check_update()
    os.system("python client/main.py")  # 或直接 exec client.main
