from rest_framework import serializers
from .models import Room, Membership, Message, Requests
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = get_user_model()
        fields = "__all__"

class RoomSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'members']

class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Membership
        fields = ['user', 'room','is_admin']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'room', 'message', 'sentdate']

class RequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer()
    class Meta:
        model = Requests
        fields = ['id', 'requester', 'room', 'request_message', 'declined', 'request_type', 'sentdate','accepted']