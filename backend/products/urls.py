from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("products", views.ProductViewSet, basename="product")
router.register("categories", views.CategoryViewSet, basename="category")

urlpatterns = [
    path("", include(router.urls)),
    path("products/<int:product_pk>/configs/",
         views.ProductConfigViewSet.as_view({"get": "list", "post": "create"}),
         name="product-configs"),
    path("products/configs/<int:pk>/",
         views.ProductConfigViewSet.as_view({"put": "update", "delete": "destroy"}),
         name="product-config-detail"),
    path("products/images/<int:pk>/",
         views.delete_product_image, name="delete-product-image"),
    path("products/images/<int:pk>/cover/",
         views.set_cover_image, name="set-cover-image"),
]
