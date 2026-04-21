from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from products.models import Product
from products.serializers import ProductListSerializer
from products.services import CategoryService


class CatalogBrowseView(ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related(
            "category", "created_by"
        ).prefetch_related("images")

        category = self.request.query_params.get("category")
        if category:
            cat_ids = CategoryService.get_descendant_ids(int(category))
            qs = qs.filter(
                Q(category_id__in=cat_ids) | Q(categories__id__in=cat_ids)
            ).distinct()

        return qs.order_by("-created_at")


class CatalogSearchView(ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related(
            "category", "created_by"
        ).prefetch_related("images")

        q = self.request.query_params.get("q", "")
        if q:
            qs = qs.filter(
                Q(name__icontains=q) | Q(code__icontains=q)
            ).distinct()

        return qs.order_by("-created_at")
