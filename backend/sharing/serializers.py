from rest_framework import serializers
from .models import ShareLink


class ShareLinkSerializer(serializers.ModelSerializer):
    has_password = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")

    class Meta:
        model = ShareLink
        fields = [
            "id", "token", "content_type", "object_id", "title",
            "has_password", "expires_at", "max_access_count", "access_count",
            "is_active", "created_by_name", "created_at",
        ]

    def get_has_password(self, obj):
        return bool(obj.password_hash)


class ShareLinkCreateSerializer(serializers.Serializer):
    content_type = serializers.ChoiceField(choices=ShareLink.CONTENT_TYPE_CHOICES)
    object_id = serializers.IntegerField(required=False, allow_null=True)
    title = serializers.CharField(max_length=200, required=False, default="")
    password = serializers.CharField(required=False, default="", allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    max_access_count = serializers.IntegerField(required=False, allow_null=True)

    def create(self, validated_data):
        password = validated_data.pop("password", "")
        link = ShareLink(**validated_data)
        link.created_by = self.context["request"].user
        link.set_password(password)
        link.save()
        return link


class SharePublicSerializer(serializers.ModelSerializer):
    has_password = serializers.SerializerMethodField()

    class Meta:
        model = ShareLink
        fields = ["token", "content_type", "object_id", "title", "has_password"]

    def get_has_password(self, obj):
        return bool(obj.password_hash)
