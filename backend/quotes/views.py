import os
from django.conf import settings
from django.db.models import Q
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from auth_app.permissions import IsAdminRole
from .models import Quote, QuoteItem
from .serializers import (
    QuoteListSerializer, QuoteDetailSerializer, QuoteCreateUpdateSerializer,
    QuoteItemSerializer,
)


class QuoteViewSet(ModelViewSet):
    queryset = Quote.objects.select_related("created_by").prefetch_related("items")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return QuoteListSerializer
        if self.action == "retrieve":
            return QuoteDetailSerializer
        return QuoteCreateUpdateSerializer

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        s = self.request.query_params.get("status")
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(customer_name__icontains=search))
        if s:
            qs = qs.filter(status=s)
        return qs

    @action(detail=True, methods=["post"])
    def duplicate(self, request, pk=None):
        original = self.get_object()
        new_quote = Quote.objects.create(
            title=f"{original.title} (副本)",
            customer_name=original.customer_name,
            notes=original.notes,
            terms=original.terms,
            created_by=request.user,
        )
        for item in original.items.all():
            QuoteItem.objects.create(
                quote=new_quote, product=item.product,
                product_name=item.product_name, config_name=item.config_name,
                unit_price=item.unit_price, quantity=item.quantity,
                discount=item.discount, sort_order=item.sort_order,
            )
        new_quote.recalculate_total()
        return Response(QuoteDetailSerializer(new_quote).data, status=201)

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        quote = self.get_object()
        items = quote.items.all()
        html = render_to_string("quotes/pdf_template.html", {
            "quote": quote, "items": items,
        })
        try:
            from weasyprint import HTML
            pdf_bytes = HTML(string=html).write_pdf()
            response = HttpResponse(pdf_bytes, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="quote_{quote.id}.pdf"'
            return response
        except Exception as e:
            return Response({"detail": f"PDF生成失败: {str(e)}"}, status=500)


class QuoteItemViewSet(ModelViewSet):
    serializer_class = QuoteItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuoteItem.objects.filter(quote_id=self.kwargs.get("quote_pk"))

    def perform_create(self, serializer):
        item = serializer.save(quote_id=self.kwargs["quote_pk"])
        item.quote.recalculate_total()

    def perform_update(self, serializer):
        item = serializer.save()
        item.quote.recalculate_total()

    def perform_destroy(self, instance):
        quote = instance.quote
        instance.delete()
        quote.recalculate_total()
