from rest_framework import serializers
from .models import Case, CaseImage, CaseProduct


class CaseImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseImage
        fields = ["id", "image_path", "thumbnail_path", "sort_order", "is_cover", "created_at"]


class CaseListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")
    industry_display = serializers.CharField(source="get_industry_display", read_only=True)

    class Meta:
        model = Case
        fields = ["id", "title", "industry", "industry_display", "cover_image", "created_by_name", "created_at"]

    def get_cover_image(self, obj):
        cover = obj.images.filter(is_cover=True).first() or obj.images.first()
        if cover:
            return {"image_path": cover.image_path, "thumbnail_path": cover.thumbnail_path}
        return None


class CaseDetailSerializer(serializers.ModelSerializer):
    images = CaseImageSerializer(many=True, read_only=True)
    product_ids = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")
    industry_display = serializers.CharField(source="get_industry_display", read_only=True)

    class Meta:
        model = Case
        fields = [
            "id", "title", "description", "industry", "industry_display",
            "images", "product_ids", "created_by", "created_by_name",
            "created_at", "updated_at",
        ]

    def get_product_ids(self, obj):
        return list(obj.products.values_list("id", flat=True))


class CaseCreateUpdateSerializer(serializers.ModelSerializer):
    product_ids = serializers.ListField(child=serializers.IntegerField(), required=False, write_only=True)

    class Meta:
        model = Case
        fields = ["title", "description", "industry", "product_ids"]

    def create(self, validated_data):
        product_ids = validated_data.pop("product_ids", [])
        validated_data["created_by"] = self.context["request"].user
        case = Case.objects.create(**validated_data)
        if product_ids:
            CaseProduct.objects.bulk_create(
                [CaseProduct(case=case, product_id=pid) for pid in product_ids]
            )
        return case

    def update(self, instance, validated_data):
        product_ids = validated_data.pop("product_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if product_ids is not None:
            CaseProduct.objects.filter(case=instance).delete()
            CaseProduct.objects.bulk_create(
                [CaseProduct(case=instance, product_id=pid) for pid in product_ids]
            )
        return instance
