from rest_framework import serializers
from .models import Quote, QuoteItem


class QuoteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteItem
        fields = [
            "id", "product", "product_name", "config_name",
            "unit_price", "quantity", "discount", "subtotal", "sort_order",
        ]
        read_only_fields = ["subtotal"]


class QuoteListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    item_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = Quote
        fields = [
            "id", "title", "customer_name", "status", "status_display",
            "total_amount", "item_count", "created_by_name", "created_at",
        ]


class QuoteDetailSerializer(serializers.ModelSerializer):
    items = QuoteItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source="created_by.display_name", read_only=True, default="")
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Quote
        fields = [
            "id", "title", "customer_name", "status", "status_display",
            "notes", "terms", "total_amount", "items",
            "created_by", "created_by_name", "created_at", "updated_at",
        ]


class QuoteCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ["title", "customer_name", "status", "notes", "terms"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
