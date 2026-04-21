from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("shares", views.ShareLinkViewSet, basename="share")

urlpatterns = [
    path("", include(router.urls)),
    path("share/<str:token>/", views.share_public_view, name="share-public"),
    path("share/<str:token>/verify/", views.share_verify_view, name="share-verify"),
]
