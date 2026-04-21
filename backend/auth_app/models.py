from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ("ADMIN", "管理员"),
        ("STAFF", "普通员工"),
    ]

    role = models.CharField("角色", max_length=10, choices=ROLE_CHOICES, default="STAFF")
    display_name = models.CharField("显示名称", max_length=100)

    class Meta:
        db_table = "auth_user"
        verbose_name = "用户"
        verbose_name_plural = "用户"

    def __str__(self):
        return f"{self.display_name} ({self.username})"

    @property
    def is_admin(self):
        return self.role == "ADMIN"
