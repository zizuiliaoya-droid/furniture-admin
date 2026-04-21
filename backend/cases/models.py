from django.db import models
from django.conf import settings


class Case(models.Model):
    INDUSTRY_CHOICES = [
        ("TECH", "科技/互联网"),
        ("FINANCE", "金融/保险/财税"),
        ("REALESTATE", "地产/建筑/设计院"),
        ("EDUCATION", "教育培训"),
        ("MEDICAL", "医疗/大健康"),
        ("MEDIA", "广告/文创/传媒"),
        ("MANUFACTURE", "制造/实业/工厂"),
        ("GOVERNMENT", "政府/国企/事业单位"),
        ("OTHER", "其他"),
    ]

    title = models.CharField("案例标题", max_length=200)
    description = models.TextField("项目描述", blank=True, default="")
    industry = models.CharField("行业分类", max_length=20, choices=INDUSTRY_CHOICES, default="OTHER")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="created_cases", verbose_name="创建人",
    )
    products = models.ManyToManyField(
        "products.Product", through="CaseProduct", related_name="cases",
        blank=True, verbose_name="关联产品",
    )
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        db_table = "cases_case"
        ordering = ["-created_at"]
        verbose_name = "客户案例"
        verbose_name_plural = "客户案例"

    def __str__(self):
        return self.title


class CaseProduct(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)

    class Meta:
        db_table = "cases_case_product"
        unique_together = ("case", "product")


class CaseImage(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="images", verbose_name="案例")
    image_path = models.CharField("图片路径", max_length=500)
    thumbnail_path = models.CharField("缩略图路径", max_length=500, blank=True, default="")
    sort_order = models.IntegerField("排序", default=0)
    is_cover = models.BooleanField("是否封面", default=False)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        db_table = "cases_case_image"
        ordering = ["sort_order", "id"]
        verbose_name = "案例图片"
        verbose_name_plural = "案例图片"
