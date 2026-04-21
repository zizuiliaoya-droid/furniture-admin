from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("quotes", views.QuoteViewSet, basename="quote")

urlpatterns = [
    path("", include(router.urls)),
    path("quotes/<int:quote_pk>/items/",
         views.QuoteItemViewSet.as_view({"get": "list", "post": "create"}),
         name="quote-items"),
    path("quotes/items/<int:pk>/",
         views.QuoteItemViewSet.as_view({"put": "update", "delete": "destroy"}),
         name="quote-item-detail"),
]
