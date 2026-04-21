import os
import uuid
from datetime import datetime

from django.conf import settings
from PIL import Image


class FileStorageService:
    """统一文件存储服务"""

    @staticmethod
    def _generate_path(subdirectory: str, filename: str) -> str:
        date_dir = datetime.now().strftime("%Y%m%d")
        unique_name = f"{uuid.uuid4().hex[:8]}_{filename}"
        return os.path.join(subdirectory, date_dir, unique_name)

    @classmethod
    def save_file(cls, file, subdirectory: str) -> str:
        relative_path = cls._generate_path(subdirectory, file.name)
        full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, "wb+") as dest:
            for chunk in file.chunks():
                dest.write(chunk)

        return relative_path

    @classmethod
    def save_image(cls, file, subdirectory: str) -> dict:
        image_path = cls.save_file(file, subdirectory)
        thumbnails = {}

        for size_name, dimensions in settings.THUMBNAIL_SIZES.items():
            thumb_path = cls.generate_thumbnail(image_path, dimensions, size_name)
            thumbnails[size_name] = thumb_path

        return {"path": image_path, "thumbnails": thumbnails}

    @classmethod
    def generate_thumbnail(cls, image_path: str, size: tuple, size_name: str) -> str:
        full_path = os.path.join(settings.MEDIA_ROOT, image_path)
        name, ext = os.path.splitext(image_path)
        thumb_relative = f"{name}_thumb_{size_name}{ext}"
        thumb_full = os.path.join(settings.MEDIA_ROOT, thumb_relative)

        os.makedirs(os.path.dirname(thumb_full), exist_ok=True)

        try:
            with Image.open(full_path) as img:
                img.thumbnail(size, Image.LANCZOS)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(thumb_full, quality=85)
        except Exception:
            return ""

        return thumb_relative

    @classmethod
    def delete_file(cls, file_path: str) -> None:
        if not file_path:
            return
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        if os.path.exists(full_path):
            os.remove(full_path)

        # Delete associated thumbnails
        name, ext = os.path.splitext(file_path)
        for size_name in settings.THUMBNAIL_SIZES:
            thumb_path = os.path.join(
                settings.MEDIA_ROOT, f"{name}_thumb_{size_name}{ext}"
            )
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
