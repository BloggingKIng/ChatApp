from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Room, Membership
from .serializers import RoomSerializer, MembershipSerializer, UserSerializer
from django.core.exceptions import ObjectDoesNotExist


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_groups(request):
    try:
        user_membership = Membership.objects.filter(user=request.user)
        rooms_with_user = Room.objects.filter(membership__in=user_membership)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = RoomSerializer(rooms_with_user, many=True)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group(request):
    serializer = RoomSerializer(data=request.data)
    if serializer.is_valid():
        room = serializer.save()
        Membership.objects.create(user=request.user, room=room, is_admin=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_group(request, room_id):
    try:
        room = Room.objects.get(pk=room_id)
    except Room.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Check if the user is an admin of the group
    if not Membership.objects.filter(user=request.user, room=room, is_admin=True).exists():
        return Response({"detail": "You are not the admin of this group."}, status=status.HTTP_403_FORBIDDEN)

    room.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_member(request, room_id):
    try:
        room = Room.objects.get(pk=room_id)
    except Room.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Check if the user is an admin of the group
    if not Membership.objects.filter(user=request.user, room=room, is_admin=True).exists():
        return Response({"detail": "You are not the admin of this group."}, status=status.HTTP_403_FORBIDDEN)

    serializer = MembershipSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def group_members(request,id):
    try:
        room = Room.objects.get(pk=id)
    except Room.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    members = Membership.objects.filter(room=room)
    serializer = MembershipSerializer(members, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group(request):
    group = request.data['id']
    room = Room.objects.get(id=group)
    Membership.objects.create(user=request.user, room=room)
    return Response(status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)