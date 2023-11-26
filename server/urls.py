from django.urls import path
from . import views

urlpatterns = [
    path("", views.main, name="index"),
    path("<str:room_name>/", views.room, name="room"),
]