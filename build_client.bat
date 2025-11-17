@echo off
echo Installing client dependencies...
pip install -r requirements_client.txt

echo.
echo Packaging client application with PyInstaller...

REM The --add-data flag copies the assets directory into the root of the build.
REM The path separator is platform-specific, so on Windows it's ';'.
pyinstaller --onefile --windowed --name Valorant --add-data "client/assets;assets" client/main.py

echo.
echo ==========================================================
echo ✅ EXE generated at: dist/Valorant.exe
echo 👉 Remember to upload this file to a new GitHub Release!
echo ==========================================================

pause
