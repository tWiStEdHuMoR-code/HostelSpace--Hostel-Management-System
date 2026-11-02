from django.urls import path
from . import profile, views

urlpatterns = [
    path("csrf/", views.csrf),
    path("login/", views.login_view),
    path("logout/", views.logout_view),
    path("me/", views.me),
    path("profile/", profile.profile),
]
