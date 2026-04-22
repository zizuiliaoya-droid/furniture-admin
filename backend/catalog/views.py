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

        # 支持多分类 ID 筛选（逗号分隔）
        categories = self.request.query_params.get("categories")
        if categories:
            cat_ids = []
            for cid in categories.split(","):
                cid = cid.strip()
                if cid.isdigit():
                    cat_ids.extend(CategoryService.get_descendant_ids(int(cid)))
            if cat_ids:
                qs = qs.filter(
                    Q(category_id__in=cat_ids) | Q(categories__id__in=cat_ids)
                ).distinct()

        # 兼容旧的单分类参数
        category = self.request.query_params.get("category")
        if category and not categories:
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
                Q(name__icontains=q) |
                Q(code__icontains=q) |
                Q(configs__config_name__icontains=q) |
                Q(configs__attributes__icontains=q)
            ).distinct()

        return qs.order_by("-created_at")
