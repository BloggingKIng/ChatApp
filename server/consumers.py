import json

from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Message, Room, Membership
from users.models import CustomUser
from asgiref.sync import sync_to_async
from channels.auth import get_user
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender = await sync_to_async(CustomUser.objects.get)(username=text_data_json["sender"]['username'])
        try:
            room = await sync_to_async(Room.objects.get)(id=text_data_json["room"])
        except:
            await self.send(text_data=json.dumps({"message": "Room with this id does not exist"}))
            print("LOG: Room with this id does not exist")
            return
        membership = await sync_to_async(lambda: Membership.objects.filter(user=sender, room=room).first())()
        if not membership:
            await self.send(text_data=json.dumps({"message": "You are not a member of the group"}))
            print("LOG: You are not a member of the group")
            return
        message = await sync_to_async(Message.objects.create)(
            sender=sender,
            message=text_data_json["message"],
            room=room,
        )

        # Send message to room group
        text_data_json["id"] = message.id
        #send message back to user
        await self.send(text_data=json.dumps(text_data_json))
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": text_data_json}
        )
    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket

        await self.send(text_data=json.dumps({"message": message}))
