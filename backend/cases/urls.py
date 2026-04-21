from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("cases", views.CaseViewSet, basename="case")

urlpatterns = [
    path("", include(router.urls)),
    path("cases/images/<int:pk>/", views.delete_case_image, name="delete-case-image"),
]
