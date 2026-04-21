from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from auth_app.permissions import IsAdminRole
from common.file_storage import FileStorageService
from .models import Case, CaseImage
from .serializers import (
    CaseListSerializer, CaseDetailSerializer, CaseCreateUpdateSerializer, CaseImageSerializer,
)


class CaseViewSet(ModelViewSet):
    queryset = Case.objects.select_related("created_by").prefetch_related("images", "products")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return CaseListSerializer
        if self.action == "retrieve":
            return CaseDetailSerializer
        return CaseCreateUpdateSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        industry = self.request.query_params.get("industry")
        product_id = self.request.query_params.get("product_id")
        if industry:
            qs = qs.filter(industry=industry)
        if product_id:
            qs = qs.filter(products__id=product_id)
        return qs

    @action(detail=True, methods=["post"], url_path="upload_images")
    def upload_images(self, request, pk=None):
        case = self.get_object()
        files = request.FILES.getlist("images")
        if not files:
            return Response({"detail": "请选择图片"}, status=400)
        has_cover = case.images.filter(is_cover=True).exists()
        images = []
        for i, file in enumerate(files):
            result = FileStorageService.save_image(file, "cases")
            img = CaseImage.objects.create(
                case=case,
                image_path=result["path"],
                thumbnail_path=result["thumbnails"].get("small", ""),
                sort_order=case.images.count() + i,
                is_cover=not has_cover and i == 0,
            )
            if not has_cover and i == 0:
                has_cover = True
            images.append(img)
        return Response(CaseImageSerializer(images, many=True).data, status=201)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdminRole])
def delete_case_image(request, pk):
    try:
        image = CaseImage.objects.get(pk=pk)
    except CaseImage.DoesNotExist:
        return Response({"detail": "图片不存在"}, status=404)
    FileStorageService.delete_file(image.image_path)
    was_cover = image.is_cover
    case = image.case
    image.delete()
    if was_cover:
        first = case.images.first()
        if first:
            first.is_cover = True
            first.save(update_fields=["is_cover"])
    return Response(status=status.HTTP_204_NO_CONTENT)
