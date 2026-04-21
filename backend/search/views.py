from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from products.serializers import ProductListSerializer
from cases.models import Case
from cases.serializers import CaseListSerializer
from documents.models import Document
from documents.serializers import DocumentSerializer
from quotes.models import Quote
from quotes.serializers import QuoteListSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def global_search_view(request):
    q = request.query_params.get("q", "").strip()
    if not q:
        return Response({"products": [], "cases": [], "documents": [], "quotes": []})

    products = Product.objects.filter(
        Q(name__icontains=q) | Q(code__icontains=q) | Q(description__icontains=q)
    ).select_related("category", "created_by").prefetch_related("images")[:5]

    cases = Case.objects.filter(
        Q(title__icontains=q) | Q(description__icontains=q)
    ).select_related("created_by").prefetch_related("images")[:5]

    documents = Document.objects.filter(
        name__icontains=q
    ).select_related("folder", "created_by")[:5]

    quotes = Quote.objects.filter(
        Q(title__icontains=q) | Q(customer_name__icontains=q)
    ).select_related("created_by")[:5]

    return Response({
        "products": ProductListSerializer(products, many=True).data,
        "cases": CaseListSerializer(cases, many=True).data,
        "documents": DocumentSerializer(documents, many=True).data,
        "quotes": QuoteListSerializer(quotes, many=True).data,
    })
