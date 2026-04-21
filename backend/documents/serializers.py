from rest_framework import serializers
from .models import DocumentFolder, Document


class DocumentFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentFolder
        fields = ["id", "name", "doc_type", "parent", "sort_order", "created_at"]


class DocumentFolderTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = DocumentFolder
        fields = ["id", "name", "doc_type", "parent", "sort_order", "children"]

    def get_children(self, obj):
        children = obj.children.all().order_by("sort_order", "id")
        return DocumentFolderTreeSerializer(children, many=True).data


class DocumentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")
    folder_name = serializers.CharField(source="folder.name", read_only=True, default="")

    class Meta:
        model = Document
        fields = [
            "id", "name", "doc_type", "folder", "folder_name",
            "file_path", "file_size", "mime_type", "tags",
            "created_by", "created_by_name", "created_at",
        ]
