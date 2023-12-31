from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Room, Membership, Message, Requests
from .serializers import RoomSerializer, MembershipSerializer, UserSerializer, MessageSerializer, RequestSerializer
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
        Membership.objects.get_or_create(user=request.user, room=room, is_admin=True)
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
def request_group_membership(request):
    id = request.data['id']
    try:
        room = Room.objects.get(id=id)
    except ObjectDoesNotExist:
        return Response({'message':'Room with this id does not exist'},status=status.HTTP_404_NOT_FOUND)
    req = Requests.objects.create(requester=request.user, room=room, request_message=f'{request.user.username} wants to join the group', request_type='request')
    
    return Response(status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_or_decline_request(request):
    id = request.data['id']
    action = request.data['action']
    try:
        req = Requests.objects.get(id=id)
    except ObjectDoesNotExist:
        return Response({'message':'Request with this id does not exist'},status=status.HTTP_404_NOT_FOUND)
    if action == 'accept':
        Membership.objects.get_or_create(user=req.requester, room=req.room, is_admin=False)
        Message.objects.create(sender=req.requester, room=req.room, message=f'{req.requester.username} has joined the group', message_type='join')
        req.accepted = True
    else:
        req.declined = True
    req.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_room_requests(request):
    room_id = request.data['id']
    try:
        room = Room.objects.get(id=room_id)
    except ObjectDoesNotExist:
        return Response({'message':'Room with this id does not exist'},status=status.HTTP_404_NOT_FOUND)
    membership = Membership.objects.get(user=request.user, room=room)
    if membership.is_admin:
        
        requests = Requests.objects.filter(room=room, declined=False, accepted=False)
        serializer = RequestSerializer(requests, many=True)
        return Response(serializer.data)
    else:
        return Response({'message':'You are not an admin of this group'},status=status.HTTP_401_UNAUTHORIZED)

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
    Membership.objects.get_or_create(user=request.user, room=room)
    return Response(status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_membership_details(request):
    room_id = request.data['id']
    try:
        room = Room.objects.get(id=room_id)
        membership = Membership.objects.get(user=request.user, room=room)
    except:
        return Response({'message':'You are not a member of the group'},status=status.HTTP_401_UNAUTHORIZED)
    serializer = MembershipSerializer(membership)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_group_messages(request):
    id = request.data['id']
    try:
        room = Room.objects.get(id=id)
        member =  Membership.objects.get(user=request.user, room=room)
    except:
        return Response({'message':'You are not a member of the group'},status=status.HTTP_401_UNAUTHORIZED)

    messages = Message.objects.filter(room=room)
    serializer = MessageSerializer(messages, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)