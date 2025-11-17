from ursina import *
from ursina.prefabs.first_person_controller import FirstPersonController
import asyncio
import websockets
import json
import threading
from network import NetworkClient  # Custom network client

# --- Game Configuration ---
# This dictionary holds the specific gameplay parameters for each Gaia weapon.
GAIA_WEAPON_STATS = {
    'gaia_vandal':   {'id': 1, 'dmg': 40, 'rpm': 9.75, 'mag_size': 25, 'hs_multiplier': 4},
    'gaia_phantom':  {'id': 2, 'dmg': 39, 'rpm': 11,   'mag_size': 30, 'hs_multiplier': 4},
    'gaia_spectre':  {'id': 3, 'dmg': 26, 'rpm': 13.33,'mag_size': 30, 'hs_multiplier': 3},
    'gaia_judge':    {'id': 4, 'dmg': 17, 'rpm': 3.5,  'mag_size': 7,  'hs_multiplier': 2}, # Per pellet
    'gaia_frenzy':   {'id': 5, 'dmg': 26, 'rpm': 10,   'mag_size': 13, 'hs_multiplier': 3},
    'gaia_karambit': {'id': 6, 'dmg': 75, 'rpm': 1.5,  'mag_size': 1,  'hs_multiplier': 2},
}

class Player(FirstPersonController):
    def __init__(self):
        super().__init__()
        self.hp = 100
        self.id = None

        # --- Weapon Setup ---
        self.weapons = {}
        self.current_weapon_name = 'gaia_vandal'
        self.current_ammo = 0
        self.is_reloading = False

        # Load all Gaia weapon models
        for name, stats in GAIA_WEAPON_STATS.items():
            # Assumes .glb files exist. User must generate them first.
            self.weapons[name] = Entity(
                model=f'assets/models/weapons/{name}.glb',
                parent=camera,
                position=(0.6, -0.6, 1.2),
                rotation=(-5, 10, 0),
                scale=0.15,
                enabled=False,
                # Add a reference to its stats
                stats=stats
            )

        self.switch_weapon('gaia_vandal') # Start with the Vandal

    def switch_weapon(self, weapon_name):
        if self.is_reloading:
            return

        print(f"Switching to {weapon_name}")
        for w_name, w_entity in self.weapons.items():
            w_entity.enabled = (w_name == weapon_name)

        self.current_weapon_name = weapon_name
        self.current_ammo = self.get_active_weapon().stats['mag_size']

    def get_active_weapon(self):
        return self.weapons.get(self.current_weapon_name)

    def shoot(self):
        active_weapon = self.get_active_weapon()
        if not active_weapon or self.is_reloading:
            return

        if self.current_ammo > 0:
            self.current_ammo -= 1
            print(f"Shoot! Ammo: {self.current_ammo}/{active_weapon.stats['mag_size']}")

            # Play shooting animation if available in the model
            active_weapon.animate('Shoot', duration=0.2) # Use short duration for fast RPM

            # Send shoot event to server with weapon info for damage calculation
            network.send_shoot(weapon_name=self.current_weapon_name)
        else:
            self.reload()

    def reload(self):
        if self.is_reloading:
            return

        active_weapon = self.get_active_weapon()
        print("Reloading...")
        self.is_reloading = True

        # Play reload animation
        active_weapon.animate('Reload', duration=1.5, on_finish=self._finish_reload)

    def _finish_reload(self):
        self.is_reloading = False
        self.current_ammo = self.get_active_weapon().stats['mag_size']
        print("Reload complete.")

# --- Global Scope ---
app = Ursina()
local_player = None
remote_players = {}
network = None
server_ip = "localhost:8765" # Default server address

# --- Networking ---
def start_network_thread():
    """Initializes and runs the network client in a separate thread."""
    def run_client():
        asyncio.run(network.connect(server_ip))

    global network
    network = NetworkClient(on_sync=sync_remote_players)
    threading.Thread(target=run_client, daemon=True).start()

def sync_remote_players(data):
    """Updates the state of remote players based on server data."""
    server_player_states = {p['id']: p for p in data.get('players', [])}

    # Update existing players and add new ones
    for pid, p_state in server_player_states.items():
        if pid == network.client_id:
            if local_player and not local_player.id:
                local_player.id = pid
            continue

        if pid not in remote_players:
            remote_players[pid] = Entity(model='cube', color=color.cyan, scale_y=1.8)

        remote_players[pid].position = p_state['pos']
        remote_players[pid].rotation_y = p_state['rot']

    # Remove players that are no longer in the server state
    for pid in list(remote_players.keys()):
        if pid not in server_player_states:
            destroy(remote_players[pid])
            del remote_players[pid]

# --- Input Handling ---
def input(key):
    if not local_player:
        return

    if key == 'left mouse down':
        local_player.shoot()

    if key == 'r':
        local_player.reload()

    # Weapon switching with number keys
    if key == '1': local_player.switch_weapon('gaia_vandal')
    if key == '2': local_player.switch_weapon('gaia_phantom')
    if key == '3': local_player.switch_weapon('gaia_spectre')
    if key == '4': local_player.switch_weapon('gaia_judge')
    if key == '5': local_player.switch_weapon('gaia_frenzy')
    if key == '6': local_player.switch_weapon('gaia_karambit')

# --- Main Game Loop ---
def update():
    if local_player and network and network.ws:
        network.send_position(local_player.position, local_player.rotation_y)

# --- Initialization ---
def initialize_game():
    global local_player

    # A simple connection status text
    status_text = Text("Connecting to server...", origin=(0, -2), scale=1.5)

    start_network_thread()

    # In a real game, we would wait for a successful connection before proceeding

    local_player = Player()
    local_player.position = (0, 2, 0) # Start slightly above the ground

    # A simple ground plane for orientation
    ground = Entity(model='plane', scale=150, color=color.dark_gray, texture='white_cube', collider='box')

    # Get rid of the connection text once the player is created
    destroy(status_text)

if __name__ == '__main__':
    initialize_game()
    app.run()
