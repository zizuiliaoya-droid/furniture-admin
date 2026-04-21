from decimal import Decimal
from django.db import models
from django.conf import settings


class Quote(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "草稿"),
        ("SENT", "已发送"),
        ("CONFIRMED", "已确认"),
        ("CANCELLED", "已取消"),
    ]

    title = models.CharField("报价单标题", max_length=200)
    customer_name = models.CharField("客户名称", max_length=200, blank=True, default="")
    status = models.CharField("状态", max_length=15, choices=STATUS_CHOICES, default="DRAFT")
    notes = models.TextField("备注", blank=True, default="")
    terms = models.TextField("条款", blank=True, default="")
    total_amount = models.DecimalField("总金额", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="created_quotes", verbose_name="创建人",
    )
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        db_table = "quotes_quote"
        ordering = ["-created_at"]
        verbose_name = "报价单"
        verbose_name_plural = "报价单"

    def __str__(self):
        return self.title

    def recalculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=["total_amount"])


class QuoteItem(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name="items", verbose_name="报价单")
    product = models.ForeignKey(
        "products.Product", on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="关联产品",
    )
    product_name = models.CharField("产品名称", max_length=200)
    config_name = models.CharField("配置名称", max_length=200, blank=True, default="")
    unit_price = models.DecimalField("单价", max_digits=10, decimal_places=2)
    quantity = models.IntegerField("数量", default=1)
    discount = models.DecimalField("折扣(%)", max_digits=5, decimal_places=2, default=Decimal("0.00"))
    subtotal = models.DecimalField("小计", max_digits=12, decimal_places=2, default=Decimal("0.00"))
    sort_order = models.IntegerField("排序", default=0)

    class Meta:
        db_table = "quotes_quote_item"
        ordering = ["sort_order", "id"]
        verbose_name = "报价明细"
        verbose_name_plural = "报价明细"

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity * (1 - self.discount / Decimal("100"))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
