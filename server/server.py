import asyncio
import websockets
import json
import numpy as np
from rooms import RoomManager
import uuid

rooms = RoomManager()
# We need a way to map websocket connections to players/clients
clients = {}  # {ws: client_object}

class Client:
    def __init__(self, websocket):
        self.ws = websocket
        self.id = str(uuid.uuid4()) # Unique ID for each client
        self.pos = [0, 5, 0] # Default starting position
        self.rot = 0
        self.room = None

async def handle_client(websocket, path):
    client = Client(websocket)
    clients[websocket] = client
    print(f"Client {client.id} connected.")

    # Send a welcome message with the client's new ID
    await websocket.send(json.dumps({'type': 'welcome', 'id': client.id}))

    # For simplicity, auto-join a default room. A real server would have room selection.
    room_id = "default_room"
    room = rooms.get_or_create_room(room_id)
    room.add_player(client)
    client.room = room
    print(f"Client {client.id} joined room {room.id}")

    try:
        async for message in websocket:
            try:
                data = json.loads(message)

                # We need to make sure the client is in a room to process game actions
                if not client.room:
                    # Maybe handle room joining logic here if not auto-joining
                    continue

                if data.get('type') == 'pos':
                    # Basic validation could be added here to prevent cheating
                    client.pos = data.get('pos', client.pos)
                    client.rot = data.get('rot', client.rot)

                elif data.get('type') == 'shoot':
                    # Server-authoritative hit detection
                    print(f"Player {client.id} is shooting from {client.pos}")
                    # A simple distance-based hit check
                    for other_client in client.room.players:
                        if other_client.id != client.id:
                            # Calculate distance between players
                            dist = np.linalg.norm(np.array(client.pos) - np.array(other_client.pos))
                            # If close enough, register a hit. This is very basic.
                            if dist < 2.0: # 2 meters for a hit
                                print(f"Hit detected! {client.id} -> {other_client.id}")
                                await other_client.ws.send(json.dumps({'type':'hit', 'dmg': 25, 'from': client.id}))

            except json.JSONDecodeError:
                print(f"Received invalid JSON from {client.id}")
                continue

    except websockets.exceptions.ConnectionClosed:
        print(f"Client {client.id} disconnected.")

    finally:
        # Cleanup
        if client.room:
            client.room.remove_player(client)
            print(f"Client {client.id} removed from room {client.room.id}")
        del clients[websocket]

async def broadcast_gamestate():
    """Periodically sends the state of all players to clients in each room."""
    while True:
        for room in rooms.get_all_rooms():
            if not room.players:
                continue

            # Prepare the list of player states for this room
            player_states = [
                {'id': p.id, 'pos': p.pos, 'rot': p.rot} for p in room.players
            ]

            # Broadcast to all players in the room
            if player_states:
                await room.broadcast(json.dumps({'type':'sync', 'players': player_states}))

        # Run at ~30Hz
        await asyncio.sleep(1/30)

async def main():
    # Start the game state broadcast loop
    asyncio.create_task(broadcast_gamestate())

    # Start the WebSocket server
    port = 8765
    async with websockets.serve(handle_client, "0.0.0.0", port):
        print(f"🚀 Server started on ws://0.0.0.0:{port}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
