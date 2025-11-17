import websockets
import json
import asyncio

class NetworkClient:
    def __init__(self, on_sync=None):
        self.ws = None
        self.on_sync = on_sync
        self.client_id = None

    async def connect(self, addr):
        uri = f"ws://{addr}"
        try:
            async with websockets.connect(uri) as ws:
                self.ws = ws
                print(f"Connected to {uri}")
                await self.main_loop()
        except Exception as e:
            print(f"Failed to connect to {uri}: {e}")
            self.ws = None # Ensure ws is None if connection fails

    async def main_loop(self):
        try:
            while self.ws and self.ws.open:
                msg = await self.ws.recv()
                data = json.loads(msg)

                if data.get('type') == 'welcome':
                    self.client_id = data.get('id')
                    print(f"Received client ID: {self.client_id}")

                elif data.get('type') == 'sync':
                    if self.on_sync:
                        self.on_sync(data)

                # Handle other message types like 'hit', 'player_joined', 'player_left'
                elif data.get('type') == 'hit':
                    print(f"You've been hit for {data.get('dmg')} damage!")

        except websockets.exceptions.ConnectionClosed:
            print("Connection to server closed.")
        finally:
            self.ws = None

    async def _send(self, data):
        if self.ws and self.ws.open:
            await self.ws.send(json.dumps(data))

    def send_position(self, pos, rot):
        # Fire and forget - create a task so it doesn't block
        asyncio.create_task(self._send({'type':'pos', 'pos':list(pos), 'rot':rot}))

    def send_shoot(self):
        asyncio.create_task(self._send({'type':'shoot'}))

    def send_join_room(self, room_id):
        asyncio.create_task(self._send({'type': 'join_room', 'room_id': room_id}))
