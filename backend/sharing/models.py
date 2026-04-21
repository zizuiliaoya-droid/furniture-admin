import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password


class ShareLink(models.Model):
    CONTENT_TYPE_CHOICES = [
        ("PRODUCT", "产品"),
        ("CASE", "案例"),
        ("QUOTE", "报价单"),
        ("CATALOG", "产品图册"),
    ]

    token = models.CharField("分享令牌", max_length=64, unique=True, db_index=True)
    content_type = models.CharField("内容类型", max_length=10, choices=CONTENT_TYPE_CHOICES)
    object_id = models.IntegerField("关联对象ID", null=True, blank=True)
    title = models.CharField("分享标题", max_length=200, blank=True, default="")
    password_hash = models.CharField("密码哈希", max_length=128, blank=True, default="")
    expires_at = models.DateTimeField("过期时间", null=True, blank=True)
    max_access_count = models.IntegerField("最大访问次数", null=True, blank=True)
    access_count = models.IntegerField("已访问次数", default=0)
    is_active = models.BooleanField("是否启用", default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="created_shares", verbose_name="创建人",
    )
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        db_table = "sharing_share_link"
        ordering = ["-created_at"]
        verbose_name = "分享链接"
        verbose_name_plural = "分享链接"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = uuid.uuid4().hex
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password) if raw_password else ""

    def check_password(self, raw_password):
        if not self.password_hash:
            return True
        return check_password(raw_password, self.password_hash)


class ShareAccessLog(models.Model):
    share_link = models.ForeignKey(ShareLink, on_delete=models.CASCADE, related_name="access_logs")
    accessed_at = models.DateTimeField("访问时间", auto_now_add=True)
    ip_address = models.GenericIPAddressField("IP地址", null=True, blank=True)
    user_agent = models.TextField("浏览器信息", blank=True, default="")

    class Meta:
        db_table = "sharing_access_log"
        ordering = ["-accessed_at"]
        verbose_name = "访问记录"
        verbose_name_plural = "访问记录"
