from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from auth_app.permissions import IsAdminRole
from .models import Category, Product, ProductImage, ProductConfig
from .serializers import (
    CategorySerializer, CategoryTreeSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    ProductImageSerializer, ProductConfigSerializer, ProductConfigCreateSerializer,
)
from .services import CategoryService, ProductImageService, ProductImportService


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        dimension = self.request.query_params.get("dimension")
        parent = self.request.query_params.get("parent")
        if dimension:
            qs = qs.filter(dimension=dimension)
        if parent:
            qs = qs.filter(parent_id=parent)
        return qs.order_by("sort_order", "id")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "reorder"):
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    @action(detail=False, methods=["get"])
    def tree(self, request):
        dimension = request.query_params.get("dimension")
        if not dimension:
            return Response({"detail": "dimension 参数必填"}, status=400)
        roots = CategoryService.get_tree(dimension)
        return Response(CategoryTreeSerializer(roots, many=True).data)

    @action(detail=False, methods=["put"])
    def reorder(self, request):
        items = request.data
        if not isinstance(items, list):
            return Response({"detail": "请提供排序数组"}, status=400)
        CategoryService.reorder(items)
        return Response({"detail": "排序已更新"})


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related("category", "created_by").prefetch_related("images", "configs")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductCreateUpdateSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        origin = self.request.query_params.get("origin")
        category = self.request.query_params.get("category")
        is_active = self.request.query_params.get("is_active")

        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(code__icontains=search) |
                Q(description__icontains=search) |
                Q(configs__config_name__icontains=search) |
                Q(configs__attributes__icontains=search)
            ).distinct()
        if origin:
            qs = qs.filter(origin=origin)
        if category:
            cat_ids = CategoryService.get_descendant_ids(int(category))
            qs = qs.filter(Q(category_id__in=cat_ids) | Q(categories__id__in=cat_ids)).distinct()
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("true", "1"))
        return qs

    @action(detail=True, methods=["post"], url_path="upload_images")
    def upload_images(self, request, pk=None):
        product = self.get_object()
        files = request.FILES.getlist("images")
        if not files:
            return Response({"detail": "请选择图片"}, status=400)
        images = ProductImageService.upload(product, files)
        return Response(ProductImageSerializer(images, many=True).data, status=201)

    @action(detail=True, methods=["put"], url_path="images/order")
    def update_image_order(self, request, pk=None):
        product = self.get_object()
        ProductImageService.update_order(product, request.data)
        return Response({"detail": "排序已更新"})

    @action(detail=False, methods=["post"], url_path="import")
    def import_products(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "请选择文件"}, status=400)
        result = ProductImportService.import_from_excel(file, request.user)
        return Response(result)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdminRole])
def delete_product_image(request, pk):
    try:
        image = ProductImage.objects.get(pk=pk)
    except ProductImage.DoesNotExist:
        return Response({"detail": "图片不存在"}, status=404)
    ProductImageService.delete(image)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminRole])
def set_cover_image(request, pk):
    try:
        image = ProductImage.objects.get(pk=pk)
    except ProductImage.DoesNotExist:
        return Response({"detail": "图片不存在"}, status=404)
    ProductImageService.set_cover(image)
    return Response(ProductImageSerializer(image).data)


class ProductConfigViewSet(ModelViewSet):
    serializer_class = ProductConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProductConfig.objects.filter(product_id=self.kwargs.get("product_pk"))

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ProductConfigCreateSerializer
        return ProductConfigSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(product_id=self.kwargs["product_pk"])
