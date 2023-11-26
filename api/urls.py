from django.urls import path
from .import views
urlpatterns = [
    path('groups/',views.list_groups,name='groups'),
    path('create_group/', views.create_group, name='create_group'),
    path('delete_group/<int:room_id>/', views.delete_group, name='delete_group'),
    path('add_member/<int:room_id>/', views.add_member, name='add_member'),
    path('members/<int:id>/', views.group_members,name='members'),
    path('join_group/',views.join_group,name='join_group'),
]