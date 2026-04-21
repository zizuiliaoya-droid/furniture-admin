import os
import mimetypes

from django.conf import settings
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from auth_app.permissions import IsAdminRole
from common.file_storage import FileStorageService
from .models import DocumentFolder, Document
from .serializers import (
    DocumentFolderSerializer, DocumentFolderTreeSerializer, DocumentSerializer,
)


class DocumentFolderViewSet(ModelViewSet):
    queryset = DocumentFolder.objects.all()
    serializer_class = DocumentFolderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        doc_type = self.request.query_params.get("doc_type")
        if doc_type:
            qs = qs.filter(doc_type=doc_type)
        return qs.order_by("sort_order", "id")

    def get_permissions(self):
        if self.action in ("create", "destroy"):
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        folder = self.get_object()
        if folder.documents.exists() or folder.children.exists():
            return Response({"detail": "文件夹非空，无法删除"}, status=400)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def tree(self, request):
        doc_type = request.query_params.get("doc_type")
        if not doc_type:
            return Response({"detail": "doc_type 参数必填"}, status=400)
        roots = DocumentFolder.objects.filter(doc_type=doc_type, parent__isnull=True).order_by("sort_order", "id")
        return Response(DocumentFolderTreeSerializer(roots, many=True).data)


class DocumentViewSet(ModelViewSet):
    queryset = Document.objects.select_related("folder", "created_by")
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        doc_type = self.request.query_params.get("doc_type")
        folder = self.request.query_params.get("folder")
        tag = self.request.query_params.get("tag")
        search = self.request.query_params.get("search")
        if doc_type:
            qs = qs.filter(doc_type=doc_type)
        if folder:
            qs = qs.filter(folder_id=folder)
        if tag:
            qs = qs.filter(tags__contains=[tag])
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def get_permissions(self):
        if self.action in ("destroy",):
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    @action(detail=False, methods=["post"])
    def upload(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "请选择文件"}, status=400)

        doc_type = request.data.get("doc_type", "DESIGN")
        folder_id = request.data.get("folder") or None
        tags = request.data.getlist("tags", [])

        file_path = FileStorageService.save_file(file, f"documents/{doc_type.lower()}")
        mime_type = mimetypes.guess_type(file.name)[0] or ""

        doc = Document.objects.create(
            name=file.name,
            doc_type=doc_type,
            folder_id=folder_id,
            file_path=file_path,
            file_size=file.size,
            mime_type=mime_type,
            tags=tags,
            created_by=request.user,
        )
        return Response(DocumentSerializer(doc).data, status=201)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        doc = self.get_object()
        full_path = os.path.join(settings.MEDIA_ROOT, doc.file_path)
        if not os.path.exists(full_path):
            return Response({"detail": "文件不存在"}, status=404)
        response = FileResponse(open(full_path, "rb"), content_type=doc.mime_type or "application/octet-stream")
        response["Content-Disposition"] = f'attachment; filename="{doc.name}"'
        return response

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        FileStorageService.delete_file(doc.file_path)
        return super().destroy(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Only allow updating tags
        instance = self.get_object()
        tags = request.data.get("tags")
        if tags is not None:
            instance.tags = tags
            instance.save(update_fields=["tags"])
        return Response(DocumentSerializer(instance).data)
