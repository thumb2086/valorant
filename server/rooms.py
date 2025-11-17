import asyncio
import json

class Room:
    def __init__(self, room_id):
        self.id = room_id
        self.players = set()  # Using a set for efficient add/remove
        self.max_players = 10

    def add_player(self, client):
        if len(self.players) < self.max_players:
            self.players.add(client)
            return True
        return False

    def remove_player(self, client):
        self.players.discard(client) # Use discard to avoid errors if player not in room

    async def broadcast(self, message):
        """Sends a message to all players in the room."""
        # Create a list of tasks to send messages concurrently
        tasks = [p.ws.send(message) for p in self.players]
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True) # Use gather for concurrent sending

class RoomManager:
    def __init__(self):
        self._rooms = {}

    def get_or_create_room(self, room_id):
        if room_id not in self._rooms:
            print(f"Creating new room: {room_id}")
            self._rooms[room_id] = Room(room_id)
        return self._rooms[room_id]

    def get_room(self, room_id):
        return self._rooms.get(room_id)

    def get_all_rooms(self):
        return list(self._rooms.values())
