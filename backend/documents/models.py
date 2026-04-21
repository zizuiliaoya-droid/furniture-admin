from django.db import models
from django.conf import settings


class DocumentFolder(models.Model):
    DOC_TYPE_CHOICES = [
        ("DESIGN", "设计资源"),
        ("TRAINING", "培训资料"),
        ("CERTIFICATE", "资质文件"),
    ]

    name = models.CharField("文件夹名称", max_length=200)
    doc_type = models.CharField("文档类型", max_length=15, choices=DOC_TYPE_CHOICES)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True,
        related_name="children", verbose_name="父文件夹",
    )
    sort_order = models.IntegerField("排序", default=0)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        db_table = "documents_folder"
        ordering = ["sort_order", "id"]
        verbose_name = "文件夹"
        verbose_name_plural = "文件夹"

    def __str__(self):
        return self.name


class Document(models.Model):
    DOC_TYPE_CHOICES = DocumentFolder.DOC_TYPE_CHOICES

    name = models.CharField("文件名", max_length=300)
    doc_type = models.CharField("文档类型", max_length=15, choices=DOC_TYPE_CHOICES)
    folder = models.ForeignKey(
        DocumentFolder, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="documents", verbose_name="所属文件夹",
    )
    file_path = models.CharField("文件路径", max_length=500)
    file_size = models.BigIntegerField("文件大小", default=0)
    mime_type = models.CharField("MIME类型", max_length=100, blank=True, default="")
    tags = models.JSONField("标签", default=list, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="created_documents", verbose_name="上传人",
    )
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        db_table = "documents_document"
        ordering = ["-created_at"]
        verbose_name = "文档"
        verbose_name_plural = "文档"

    def __str__(self):
        return self.name
