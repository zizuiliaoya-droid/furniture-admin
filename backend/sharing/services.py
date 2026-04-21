from django.utils import timezone
from .models import ShareLink, ShareAccessLog


class ShareService:
    @staticmethod
    def validate_access(share: ShareLink) -> str | None:
        if not share.is_active:
            return "分享链接已禁用"
        if share.expires_at and timezone.now() > share.expires_at:
            return "分享链接已过期"
        if share.max_access_count and share.access_count >= share.max_access_count:
            return "分享链接已达到最大访问次数"
        return None

    @staticmethod
    def log_access(share: ShareLink, request) -> None:
        share.access_count += 1
        share.save(update_fields=["access_count"])
        ShareAccessLog.objects.create(
            share_link=share,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

    @staticmethod
    def get_shared_content(share: ShareLink) -> dict:
        if share.content_type == "PRODUCT":
            from products.models import Product
            from products.serializers import ProductDetailSerializer
            try:
                product = Product.objects.prefetch_related("images", "configs").get(pk=share.object_id)
                return {"type": "product", "data": ProductDetailSerializer(product).data}
            except Product.DoesNotExist:
                return {"type": "product", "data": None}

        elif share.content_type == "CASE":
            from cases.models import Case
            from cases.serializers import CaseDetailSerializer
            try:
                case = Case.objects.prefetch_related("images", "products").get(pk=share.object_id)
                return {"type": "case", "data": CaseDetailSerializer(case).data}
            except Case.DoesNotExist:
                return {"type": "case", "data": None}

        elif share.content_type == "QUOTE":
            from quotes.models import Quote
            from quotes.serializers import QuoteDetailSerializer
            try:
                quote = Quote.objects.prefetch_related("items").get(pk=share.object_id)
                return {"type": "quote", "data": QuoteDetailSerializer(quote).data}
            except Quote.DoesNotExist:
                return {"type": "quote", "data": None}

        elif share.content_type == "CATALOG":
            from products.models import Product
            from products.serializers import ProductListSerializer
            products = Product.objects.filter(is_active=True).prefetch_related("images")[:50]
            return {"type": "catalog", "data": ProductListSerializer(products, many=True).data}

        return {"type": "unknown", "data": None}
