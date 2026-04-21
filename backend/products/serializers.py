from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductConfig, ProductCategory


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "parent", "dimension", "sort_order"]


class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "parent", "dimension", "sort_order", "children"]

    def get_children(self, obj):
        children = obj.children.all().order_by("sort_order", "id")
        return CategoryTreeSerializer(children, many=True).data


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image_path", "thumbnail_path", "sort_order", "is_cover", "created_at"]


class ProductConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductConfig
        fields = ["id", "config_name", "attributes", "guide_price", "created_at"]


class ProductConfigCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductConfig
        fields = ["id", "config_name", "attributes", "guide_price"]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default="")
    cover_image = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")

    class Meta:
        model = Product
        fields = [
            "id", "name", "code", "origin", "min_price", "is_active",
            "category", "category_name", "cover_image", "created_by_name",
            "created_at", "updated_at",
        ]

    def get_cover_image(self, obj):
        cover = obj.images.filter(is_cover=True).first()
        if cover:
            return {"image_path": cover.image_path, "thumbnail_path": cover.thumbnail_path}
        first = obj.images.first()
        if first:
            return {"image_path": first.image_path, "thumbnail_path": first.thumbnail_path}
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    configs = ProductConfigSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default="")
    category_ids = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")

    class Meta:
        model = Product
        fields = [
            "id", "name", "code", "description", "origin", "min_price",
            "is_active", "category", "category_name", "category_ids",
            "images", "configs", "created_by", "created_by_name",
            "created_at", "updated_at",
        ]

    def get_category_ids(self, obj):
        return list(obj.categories.values_list("id", flat=True))


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    category_ids = serializers.ListField(child=serializers.IntegerField(), required=False, write_only=True)

    class Meta:
        model = Product
        fields = [
            "name", "code", "description", "origin", "min_price",
            "is_active", "category", "category_ids",
        ]

    def create(self, validated_data):
        category_ids = validated_data.pop("category_ids", [])
        validated_data["created_by"] = self.context["request"].user
        product = Product.objects.create(**validated_data)
        if category_ids:
            ProductCategory.objects.bulk_create(
                [ProductCategory(product=product, category_id=cid) for cid in category_ids]
            )
        return product

    def update(self, instance, validated_data):
        category_ids = validated_data.pop("category_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if category_ids is not None:
            ProductCategory.objects.filter(product=instance).delete()
            ProductCategory.objects.bulk_create(
                [ProductCategory(product=instance, category_id=cid) for cid in category_ids]
            )
        return instance
