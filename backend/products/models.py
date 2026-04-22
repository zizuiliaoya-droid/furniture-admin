from django.db import models
from django.conf import settings


class Category(models.Model):
    DIMENSION_CHOICES = [
        ("TYPE", "产品类别"),
        ("BRAND", "品牌"),
    ]

    name = models.CharField("分类名称", max_length=100)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True,
        related_name="children", verbose_name="父分类",
    )
    dimension = models.CharField("维度", max_length=10, choices=DIMENSION_CHOICES)
    sort_order = models.IntegerField("排序", default=0)

    class Meta:
        db_table = "products_category"
        unique_together = ("parent", "name", "dimension")
        ordering = ["sort_order", "id"]
        verbose_name = "产品分类"
        verbose_name_plural = "产品分类"

    def __str__(self):
        return f"[{self.dimension}] {self.name}"


class Product(models.Model):
    ORIGIN_CHOICES = [
        ("IMPORT", "进口"),
        ("DOMESTIC", "国产"),
        ("CUSTOM", "定制"),
    ]

    name = models.CharField("产品名称", max_length=200)
    code = models.CharField("产品编号", max_length=50, unique=True, null=True, blank=True)
    description = models.TextField("产品描述", blank=True, default="")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="primary_products", verbose_name="主分类",
    )
    origin = models.CharField("产地", max_length=10, choices=ORIGIN_CHOICES, default="DOMESTIC")
    min_price = models.DecimalField("最低售价", max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField("是否上架", default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="created_products", verbose_name="创建人",
    )
    categories = models.ManyToManyField(
        Category, through="ProductCategory", related_name="products",
        blank=True, verbose_name="关联分类",
    )
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        db_table = "products_product"
        ordering = ["-created_at"]
        verbose_name = "产品"
        verbose_name_plural = "产品"

    def __str__(self):
        return self.name


class ProductCategory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        db_table = "products_product_category"
        unique_together = ("product", "category")


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images", verbose_name="产品",
    )
    image_path = models.CharField("图片路径", max_length=500)
    thumbnail_path = models.CharField("缩略图路径", max_length=500, blank=True, default="")
    sort_order = models.IntegerField("排序", default=0)
    is_cover = models.BooleanField("是否封面", default=False)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        db_table = "products_product_image"
        ordering = ["sort_order", "id"]
        verbose_name = "产品图片"
        verbose_name_plural = "产品图片"


class ProductConfig(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="configs", verbose_name="产品",
    )
    config_name = models.CharField("配置名称", max_length=200)
    attributes = models.JSONField("自定义属性", default=dict, blank=True)
    guide_price = models.DecimalField("指导价格", max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        db_table = "products_product_config"
        ordering = ["id"]
        verbose_name = "产品配置"
        verbose_name_plural = "产品配置"

    def __str__(self):
        return f"{self.product.name} - {self.config_name}"
