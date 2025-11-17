# High-Precision Weapon Model Generator

This directory contains the scripts and logic for generating high-detail, game-ready 3D weapon models using the Blender Python API.

## How to Use

### Prerequisites
- **Blender 4.2+**: You must have Blender installed and accessible from your command line. You can download it for free from [blender.org](https://www.blender.org/).

### Generation Command
1.  Navigate to this directory (`model_generator/`) in your terminal.
2.  Run the following command:
    ```bash
    blender --background --python generate_weapons.py
    ```
    -   `--background`: Runs Blender without the user interface, which is ideal for scripting.
    -   `--python <script>`: Tells Blender to execute the specified Python script.

### Output
The script will automatically:
1.  Generate 5 different weapon models (`Vandal`, `Phantom`, `Operator`, `Sheriff`, `Classic`).
2.  Create procedural PBR materials and animations for shooting and reloading.
3.  Export each weapon as a `.glb` file (a standard format for 3D scenes).
4.  Place the final `.glb` files into the `../client/assets/models/weapons/` directory, making them immediately available to the Ursina client.

### Customization
You can customize the generated weapons by editing the `WEAPONS` dictionary at the top of the `generate_weapons.py` script. Here you can change parameters like barrel length, polygon count, and whether the weapon should have a scope or silencer.
