# 🔫 Valorant Desktop - High-Precision FPS

This project is a desktop-based multiplayer FPS game inspired by Valorant, built with Python, Ursina, and websockets. It features a dedicated server, an auto-updater, and a high-precision weapon model generator using Blender.

## Features
| Feature                | Status | Details                                      |
|------------------------|--------|----------------------------------------------|
| **Desktop Client**     | ✅ EXE | Standalone executable built with PyInstaller.  |
| **Auto-Updater**       | ✅ Yes | Checks for new versions on GitHub Releases.    |
| **Multiplayer Server** | ✅ 5v5 | Authoritative server using Python asyncio.   |
| **High-Precision Models**| ✅ Yes | Generator script for creating detailed weapons.|
| **Cross-Platform**     | ✅ Yes | Client & server run on Windows, macOS, Linux.|

---

## 🚀 For Players
1.  **Download**: Grab the latest `Valorant.exe` from the [GitHub Releases](https://github.com/thumb2086/valorant/releases) page.
2.  **Run**: Double-click the executable. It will automatically check for updates and then launch the game.
3.  **Play**: The game will connect to a default server, or you can modify the IP in `client/main.py` if hosting your own.

---

## 🛠️ For Server Hosts
1.  **Clone the repo**: `git clone https://github.com/thumb2086/valorant.git`
2.  **Navigate to the server directory**: `cd valorant/server`
3.  **Install dependencies**: `pip install -r ../requirements_server.txt`
4.  **Run the server**: `python server.py`

The server will be running on `ws://0.0.0.0:8765`. Make sure to open this port on your firewall if hosting publicly.

---

## 🔧 For Developers

### Generating Weapon Models
The high-precision weapon models are generated using a Blender script.

1.  **Install Blender**: Download and install Blender 4.2+ from [blender.org](https://blender.org).
2.  **Run the script**:
    ```bash
    # From the model_generator directory
    cd model_generator

    # Run Blender in the background to execute the Python script
    blender --background --python generate_weapons.py
    ```
3.  **Output**: The generated `.glb` models and their textures will be saved to `client/assets/models/weapons/`.

### Building the Client Executable
1.  **Install client dependencies**:
    ```bash
    pip install -r requirements_client.txt
    ```
2.  **Run the build script**:
    -   **Windows**: Run `build_client.bat`.
    -   **macOS/Linux**: You'll need to create a `build_client.sh` script. The PyInstaller command would be:
        ```sh
        pyinstaller --onefile --windowed --name Valorant --add-data "client/assets:assets" client/main.py
        ```
3.  **Upload**: After building, a new `Valorant.exe` (or `Valorant` on other OSes) will be in the `dist/` folder. Upload this file to a new release on GitHub to enable the auto-updater for players.
